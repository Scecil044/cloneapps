const { Leads, Onboardings, Offboardings } = require('../models');

const leadsCounts = async () => {
  const result = await Leads.aggregate([
    {
      $project: {
        leads_generated: {
          $size: {
            $filter: {
              input: '$processes',
              cond: {
                $and: [{ $eq: ['$$this.stage_name', 'Lead Received'] }, { $eq: ['$$this.process_status', 'completed'] }],
              },
            },
          },
        },
        leads_contacted: {
          $size: {
            $filter: {
              input: '$processes',
              cond: {
                $and: [{ $eq: ['$$this.stage_name', 'Contact Client'] }, { $eq: ['$$this.process_status', 'completed'] }],
              },
            },
          },
        },
        proposal_submitted: {
          $size: {
            $filter: {
              input: '$processes',
              cond: {
                $and: [{ $eq: ['$$this.stage_name', 'Send Proposal'] }, { $eq: ['$$this.process_status', 'completed'] }],
              },
            },
          },
        },
        document_collection: {
          $size: {
            $filter: {
              input: '$processes',
              cond: {
                $and: [{ $eq: ['$$this.stage_name', 'Collect Documents'] }, { $eq: ['$$this.process_status', 'progress'] }],
              },
            },
          },
        },
        agreement_signed: {
          $size: {
            $filter: {
              input: '$processes',
              cond: {
                $and: [{ $eq: ['$$this.stage_name', 'Service Agreement'] }, { $eq: ['$$this.process_status', 'completed'] }],
              },
            },
          },
        },
        unsuccessful_leads: {
          $sum: {
            $cond: {
              if: { $eq: ['$is_unsuccessful', true] },
              then: 1,
              else: 0,
            },
          },
        },
      },
    },
    {
      $group: {
        _id: null,
        leads_generated: { $sum: '$leads_generated' },
        leads_contacted: { $sum: '$leads_contacted' },
        proposal_submitted: { $sum: '$proposal_submitted' },
        document_collection: { $sum: '$document_collection' },
        agreement_signed: { $sum: '$agreement_signed' },
        unsuccessful_leads: { $sum: '$unsuccessful_leads' },
      },
    },
    {
      $project: {
        counts: [
          {
            name: 'Leads Generated',
            count: '$leads_generated',
          },
          {
            name: 'Leads Contacted',
            count: '$leads_contacted',
          },
          {
            name: 'Proposal Submitted',
            count: '$proposal_submitted',
          },
          {
            name: 'Document Collection',
            count: '$document_collection',
          },
          {
            name: 'Agreement Signed',
            count: '$agreement_signed',
          },
          {
            name: 'Unsuccessfull Leads',
            count: '$unsuccessful_leads',
          },
        ],
      },
    },
  ]);
  return result[0].counts;
};

const leadsCountsOnClientType = async () => {
  const result = await Leads.aggregate([
    {
      $project: {
        new_client: {
          $sum: {
            $cond: {
              if: { $eq: ['$client_type', 'new client'] },
              then: 1,
              else: 0,
            },
          },
        },
        existing_client: {
          $sum: {
            $cond: {
              if: { $eq: ['$client_type', 'existing client'] },
              then: 1,
              else: 0,
            },
          },
        },
      },
    },
    {
      $group: {
        _id: null,
        new_client: { $sum: '$new_client' },
        existing_client: { $sum: '$existing_client' },
      },
    },
    {
      $project: {
        counts: [
          {
            name: 'New Client',
            count: '$new_client',
          },
          {
            name: 'Existing Client',
            count: '$existing_client',
          },
        ],
      },
    },
  ]);
  return result[0].counts;
};

const leadsPipelineCounts = async () => {
  const result = await Leads.aggregate([
    {
      $project: {
        new_lead: {
          $sum: {
            $cond: {
              if: { $eq: ['$status', 'Lead Received'] },
              then: 1,
              else: 0,
            },
          },
        },
        lead_contacted: {
          $sum: {
            $cond: {
              if: { $eq: ['$status', 'Contact Client'] },
              then: 1,
              else: 0,
            },
          },
        },
        proposal_submitted: {
          $sum: {
            $cond: {
              if: { $eq: ['$status', 'Send Proposal'] },
              then: 1,
              else: 0,
            },
          },
        },
        proposal_successful: {
          $sum: {
            $cond: {
              if: { $eq: ['$status', 'Waiting for Approval'] },
              then: 1,
              else: 0,
            },
          },
        },
        successfull_leads: {
          $sum: {
            $cond: {
              if: { $eq: ['$status', 'active'] },
              then: 1,
              else: 0,
            },
          },
        },
        successfull_leads: {
          $sum: {
            $cond: {
              if: { $eq: ['$status', 'active'] },
              then: 1,
              else: 0,
            },
          },
        },
        unsuccessfull_leads: {
          $sum: {
            $cond: {
              if: { $eq: ['$status', 'unsuccessful'] },
              then: 1,
              else: 0,
            },
          },
        },
        leads_on_hold: {
          $sum: {
            $cond: {
              if: { $eq: ['$status', 'hold'] },
              then: 1,
              else: 0,
            },
          },
        },
      },
    },
    {
      $group: {
        _id: null,
        new_lead: { $sum: '$new_lead' },
        lead_contacted: { $sum: '$lead_contacted' },
        proposal_submitted: { $sum: '$proposal_submitted' },
        proposal_successful: { $sum: '$proposal_successful' },
        successfull_leads: { $sum: '$successfull_leads' },
        unsuccessfull_leads: { $sum: '$unsuccessfull_leads' },
        leads_on_hold: { $sum: '$leads_on_hold' },
      },
    },
    {
      $project: {
        counts: [
          {
            name: 'New Lead',
            count: '$new_lead',
          },
          {
            name: 'Lead Contacted',
            count: '$lead_contacted',
          },
          {
            name: 'Proposal Submitted',
            count: '$proposal_submitted',
          },
          {
            name: 'Proposal Successfull',
            count: '$proposal_successful',
          },
          {
            name: 'Successfull Leads',
            count: '$successfull_leads',
          },
          {
            name: 'Unsuccessfull Leads',
            count: '$unsuccessfull_leads',
          },
          {
            name: 'Leads on Hold',
            count: '$leads_on_hold',
          },
        ],
      },
    },
  ]);
  return result[0].counts;
};

const onboardingsCount = async () => {
  const onboardings = await Onboardings.find({ status: 'Employee Details' });
  const offboardings = await Offboardings.find({ status: 'Resignation Received' });
  return [
    {
      name: 'Onboarding Applications',
      count: onboardings.length,
    },
    {
      name: 'Offboarding Applications',
      count: offboardings.length,
    },
  ];
};

const onboardingPipelineCounts = async () => {
  const result = await Onboardings.aggregate([
    {
      $project: {
        new_onboardings: {
          $sum: {
            $cond: {
              if: { $eq: ['$status', 'Employee Details'] },
              then: 1,
              else: 0,
            },
          },
        },
        employment_contract_created: {
          $sum: {
            $cond: {
              if: { $eq: ['$status', 'Create Employment contract'] },
              then: 1,
              else: 0,
            },
          },
        },
        contract_approvals: {
          $sum: {
            $cond: [
              {
                $or: [{ $eq: ['$status', "Employer's Approval"] }, { $eq: ['$status', "Employee's Sign"] }],
              },
              1,
              0,
            ],
          },
        },
        work_order_creation: {
          $sum: {
            $cond: {
              if: { $eq: ['$status', 'Create Work Order'] },
              then: 1,
              else: 0,
            },
          },
        },
        work_order_approval: {
          $sum: {
            $cond: {
              if: { $eq: ['$status', 'Work Order Approval'] },
              then: 1,
              else: 0,
            },
          },
        },
        successfull_onboarding: {
          $sum: {
            $cond: {
              if: { $eq: ['$status', 'active'] },
              then: 1,
              else: 0,
            },
          },
        },
      },
    },
    {
      $group: {
        _id: null,
        new_onboardings: { $sum: '$new_onboardings' },
        employment_contract_created: { $sum: '$employment_contract_created' },
        contract_approvals: { $sum: '$contract_approvals' },
        work_order_creation: { $sum: '$work_order_creation' },
        work_order_approval: { $sum: '$work_order_approval' },
        successfull_onboarding: { $sum: '$successfull_onboarding' },
      },
    },
    {
      $project: {
        counts: [
          {
            name: 'New Onboardings',
            count: '$new_onboardings',
          },
          {
            name: 'Employment Contract Creation',
            count: '$employment_contract_created',
          },
          {
            name: 'Contact Approvals',
            count: '$contract_approvals',
          },
          {
            name: 'Work Order Creation',
            count: '$work_order_creation',
          },
          {
            name: 'Work Order Approvals',
            count: '$work_order_approval',
          },
          {
            name: 'Successfull Onboardings',
            count: '$successfull_onboarding',
          },
        ],
      },
    },
  ]);
  return result[0].counts;
};

module.exports = {
  leadsCounts,
  leadsCountsOnClientType,
  leadsPipelineCounts,
  onboardingsCount,
  onboardingPipelineCounts,
};
