const CONTRACT_STATES = {
    Created: 'Created',
    Assigned: 'Assigned',
    Funded: 'Funded',
    Submitted: 'Submitted',
    Approved: 'Approved',
    Paid: 'Paid',
    Disputed: 'Disputed',
    Resolved: 'Resolved'
};
const ALLOWED_TRANSITIONS = {
  Created: {
    next: ["Assigned"],
    roles: ["client"]
  },
  Assigned: {
    next: ["Funded"],
    roles: ["client"]
  },
  Funded: {
    next: ["Submitted"],
    roles: ["freelancer"]
  },
  Submitted: {
    next: ["Approved", "Disputed"],
    roles: ["client", "freelancer"]
  },
  Approved: {
    next: ["Paid"],
    roles: ["client"]
  },
  Disputed: {
    next: ["Resolved"],
    roles: ["admin"]
  },
  Paid: {
    next: [],
    roles: []
  },
  Resolved: {
    next: [],
    roles: []
  }
};

module.exports = {
    CONTRACT_STATES,
    ALLOWED_TRANSITIONS
};
