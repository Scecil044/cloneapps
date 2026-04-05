const mongoose = require('mongoose');
const { SupportLog } = require('./SupportLog.model');
const cron = require('node-cron');
const { paginate } = require('./plugins');

const messagesSchema = new mongoose.Schema(
  {
    content: { type: String },
    attachments: { type: Array },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    isRead: { type: Boolean, default: false },
    readBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const ticketSchema = new mongoose.Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      default: []
    }
  ],
  company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Companies' },
  chats: [messagesSchema],
  lastMessage: { type: String, default: '' },
  lastMessageTime: { type: Date, default: Date.now },
  // logs: [],
  // notes: [{ name: { type: String }, text: { type: String }, createdAt: { type: Date, default: Date.now } }],
  status: {
    type: String,
    enum: ['New', 'Ongoing', 'Completed'],
    default: 'New'
  },
  type: {
    type: String,
    enum: [
      'Application Status',
      'Invoice',
      'Letter Request',
      'Clients',
      'Renewal',
      'Medical Insurance',
      'Modification',
      'Sponsorship',
      'Agreement',
      'Miscellaneous',
      'Cancellation',
      'Other'
      // 'Application Status',
      // 'Invoice',
      // 'Letter Request',
      // 'Clients',
      // 'Referrals',
      // 'Renewal',
      // 'Medical Insurance',
      // 'Modification',
      // 'Sponsorship',
      // 'Agreement',
      // 'Miscellaneous',
      // 'Cancellation',
      // 'Partners',
      // 'Other'
    ]
  },
  rating: {
    type: String,
    enum: ['1', '2', '3', '4', '5']
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  incident_number: {
    type: String,
    unique: true
    // required: true
  },
  anonymous: {
    type: String,
    enum: ['Yes', 'No'],
    default: 'No'
  },
  completed_by: {
    first_name: { type: String },
    last_name: { type: String },
    email: { type: String },
    _id: { type: String }
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  ticketComments: [{ type: Array, default: [] }],
  // assigned_to_nathan: { type: Boolean, default: false },
  completion_date: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: { type: Date, default: Date.now },
  is_deleted: {
    type: Boolean,
    default: false
  },
  assignedToId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }
});

ticketSchema.plugin(paginate);
ticketSchema.index({is_deleted: 1});
ticketSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

ticketSchema.pre('save', async function (next) {
  if (this.status == 'Completed' && this.updatedAt) {
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
    if (this.updatedAt <= fifteenDaysAgo) {
      this.status = 'Resolved';
    }
  }
  next();
});

ticketSchema.methods.updateAssignedToId = async function (assignToId, reassign = false) {
  if (!assignToId) return;

  // Convert assignToId to string for consistent comparison
  const assignToIdString = assignToId.toString();

  if (reassign) {
    // Retain only the participant at the 0th index
    const retainedParticipant = this.participants[0];
    this.participants = retainedParticipant ? [retainedParticipant] : [];
  } else {
    // Clean up existing duplicates first
    this.participants = this.participants.filter((participant, index, self) => 
      index === self.findIndex(p => p?.toString() === participant?.toString())
    );
  }

  // Check if assignToId already exists in participants
  const participantExists = this.participants.some(participantId => 
    participantId?.toString() === assignToIdString
  );

  if (!participantExists) {
    // Add the new assigned user to the end of participants
    this.participants.push(assignToId);
    this.assignedToId = assignToId;
  }

  // No else return - we want to save the cleaned up participants array even if no new participant is added
  await this.save();
};

// Add a static method to clean up existing tickets with duplicate participants
ticketSchema.statics.cleanupDuplicateParticipants = async function() {
  const tickets = await this.find({});
  
  for (const ticket of tickets) {
    const uniqueParticipants = [...new Set(ticket.participants.map(p => p.toString()))];
    if (uniqueParticipants.length !== ticket.participants.length) {
      ticket.participants = uniqueParticipants.map(p => mongoose.Types.ObjectId(p));
      await ticket.save();
    }
  }
};

// Apply the virtual to the schema
ticketSchema.set('toObject', { virtuals: true });
ticketSchema.set('toJSON', { virtuals: true });

// a cron job to check and update status periodically
cron.schedule('0 0 * * *', async () => {
  const ticketsToUpdate = await mongoose.model('Ticket').find({ status: 'Completed', updatedAt: { $lte: fifteenDaysAgo } });
  ticketsToUpdate.forEach(async ticket => {
    ticket.status = 'Resolved';
    await ticket.save();
  });
});

// Apply the virtual to the schema
ticketSchema.set('toObject', { virtuals: true });
ticketSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Ticket', ticketSchema);
