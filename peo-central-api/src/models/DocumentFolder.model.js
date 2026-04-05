const mongoose = require('mongoose');
const { paginate } = require('./plugins');

const DocumentFolderSchema = new mongoose.Schema({
  folder_name: {
    type: String
  },
  isClientFolder: {
    type: Boolean,
    default: false
  },
  client_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Companies'
  },
  company_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Companies'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  totalFiles: {
    type: Number,
    default: 0
  },
  is_deleted: {
    type: Boolean,
    default: false
  },
  files: { type: Array, default: [] }
},{timestamps: true});

DocumentFolderSchema.plugin(paginate);
const DocumentFolder = mongoose.model('DocumentFolder', DocumentFolderSchema);
module.exports = DocumentFolder;
