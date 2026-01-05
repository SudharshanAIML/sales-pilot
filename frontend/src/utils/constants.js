// Contact statuses
export const CONTACT_STATUS = {
  LEAD: 'LEAD',
  MQL: 'MQL',
  SQL: 'SQL',
  OPPORTUNITY: 'OPPORTUNITY',
  CUSTOMER: 'CUSTOMER',
  EVANGELIST: 'EVANGELIST',
  DORMANT: 'DORMANT',
};

// User roles
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  EMPLOYEE: 'EMPLOYEE',
};

// Departments
export const DEPARTMENTS = [
  'Sales',
  'Marketing',
  'Customer Success',
  'Operations',
  'Management',
  'IT',
  'HR',
  'Finance',
  'Other',
];

// Session stages
export const SESSION_STAGE = {
  MQL: 'MQL',
  SQL: 'SQL',
};

// Rating limits
export const RATING_LIMITS = {
  SESSION_MIN: 1,
  SESSION_MAX: 10,
  FEEDBACK_MIN: 1,
  FEEDBACK_MAX: 10,
};

// Business rule thresholds
export const THRESHOLDS = {
  MQL_TO_SQL_MIN_AVG_RATING: 7,
  EVANGELIST_MIN_AVG_FEEDBACK: 8,
  MAX_SESSIONS_PER_STAGE: 5,
};