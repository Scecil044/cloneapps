const mongoose = require('mongoose');
const { toJSON, paginate, deletion } = require('./plugins');

const onboardingsSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId
    },
    company_id: {
      type: mongoose.Schema.Types.ObjectId
    },
    stage_id: {
      type: mongoose.Schema.Types.ObjectId
    },
    processes: {
      type: Array
    },
    is_unsuccessful: {
      type: Boolean,
      default: false
    },
    reason_for_unsuccessful: {
      type: String,
      default: ''
    },
    employment_contract: {
      type: Object,
      default: {}
    },
    create_work_order: {
      type: Object,
      default: {}
    },
    upfront_costs: {
      type: Object,
      default: {}
    },
    create_invoice: {
      type: Object,
      default: {}
    },
    record_payments: {
      type: Object,
      default: {}
    },
    process_type: {
      type: String
    },
    attachments: {
      type: Array
    },
    comments: {
      type: Array
    },
    stage_type: {
      type: String
    },
    status: {
      type: String
    },
    have_eid: {
      type: String,
      default: ''
    },
    vip: {
      type: String,
      default: ''
    },
    user_location: {
      type: String,
      default: ''
    },
    visa_type: {
      type: String,
      default: ''
    },
    medical_center: {
      type: Object,
      default: {}
    },
    eid_center: {
      type: Object,
      default: {}
    },
    tawjeeh_center: {
      type: Object,
      default: {}
    },
    assigned_pro: {
      type: mongoose.Schema.Types.ObjectId
    },
    created_by: {
      type: String
    },
    updated_by: {
      type: String
    },
    is_deleted: {
      type: Boolean,
      default: false
    },
    created_date: {
      type: String
    },
    updated_date: {
      type: String
    },
    eid_center_fingerprint_time: {
      type: String,
      default: ''
    },
    eid_center_fingerprint_date: {
      type: Date,
      default: ''
    },
    attachedDocumentNumbers: {
      type: Object,
      default: {
        labourCardAndContractNumber: '',
        labourCardAndContractNumberExpiry: '',

        medicalTestResultNumber: '',
        medicalTestResultExpiry: '',

        healthInsuranceNumber: '',
        healthInsuranceExpiry: '',
        temporaryLabourCardNumber: '',
        temporaryLabourCardExpiry: '',
        medApplicationReferenceExpiry: '',
        medApplicationReferenceNumber: '',
        molCancellationApplicationNumber: '',
        molCancellationApplicationExpiry: '',
        visaNumber: '',
        VisaExpiry: '',
        changeOfStatusExpiry: '',
        changeOfStatusNumber: '',
        eVisaExpiry: '',
        eVisaNumber: '',
        stampedVisaNumber: '',
        stampedVisaExpiry: '',
        molWPSNumber: '',
        molWPSExpiry: '',
        molSignedNumber: '',
        MolSignedExpiry: '',
        molOfferLetterNumber: '',
        molOfferLetterExpiry: '',
        tawjeehTrainingNumber:'',
        tawjeehTrainingExpiry:'',
        residencyCancellationNumber:'',
        residencyCancellationExpiry:'',
        stampedResidenceVisaNumber:'',
        stampedResidenceVisaExpiry:'',
        labourCardNumber:'',
        labourCardExpiry:'',
        emiratesIdCaptureNumber:'',
        emiratesIdCaptureExpiry:'',
        emiratesIdNumber:'',
        emiratesIdExpiry:'',
        emiratesIdApplicationNumber:'',
        emiratesIdApplicationExpiry:'',
        // medAppRefNo: '',
        // MedAppRefExpiry: '',
        // molApprovalNumber: '',
        // molApprovalExpiry: '',
        // molPreApprovalNumber: '',
        // molPreApprovalExpiry: '',
      }
    },
    assigned_escalation_manager: { type: mongoose.Schema.Types.ObjectId},
    assigned_insurance_agent: { type: mongoose.Schema.Types.ObjectId},
    assigned_hr_specialist: { type: mongoose.Schema.Types.ObjectId},
    assigned_support_agent: { type: mongoose.Schema.Types.ObjectId},
  },
  {
    timestamps: true
  }
);

onboardingsSchema.index({is_deleted: 1}, {background: true});

onboardingsSchema.plugin(toJSON);
onboardingsSchema.plugin(paginate);
onboardingsSchema.plugin(deletion);

const Onboardings = mongoose.model('Onboardings', onboardingsSchema);
module.exports = Onboardings;
