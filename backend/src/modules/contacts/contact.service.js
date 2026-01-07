import crypto from "crypto";
import * as contactRepo from "./contact.repo.js";
import * as sessionRepo from "../sessions/session.repo.js";
import * as opportunityRepo from "../opportunities/opportunity.repo.js";
import * as dealRepo from "../deals/deal.repo.js";
import * as feedbackRepo from "../feedback/feedback.repo.js";
import { sendLeadEmail } from "../emails/email.service.js";

/* ---------------------------------------------------
   HELPER: UPDATE CONTACT TEMPERATURE BASED ON RATING
--------------------------------------------------- */
const updateContactTemperature = async (contactId) => {
  const avgRating = await sessionRepo.getOverallAverageRating(contactId);

  let temperature = 'COLD';
  if (avgRating >= 8) {
    temperature = 'HOT';
  } else if (avgRating >= 6) {
    temperature = 'WARM';
  }

  await contactRepo.updateTemperature(contactId, temperature);
  return temperature;
};

/* ---------------------------------------------------
   CREATE LEAD (Employee)
--------------------------------------------------- */
export const createLead = async (data) => {
  const contactId = await contactRepo.createContact({
    ...data,
    status: "LEAD",
  });

  // Generate tracking token
  const token = crypto.randomUUID();
  await contactRepo.saveTrackingToken(contactId, token);

  // Send personalized email with company branding and employee info
  await sendLeadEmail({
    contactId,
    name: data.name,
    email: data.email,
    token,
    empId: data.assigned_emp_id || null,
    companyId: data.company_id || null,
  });

  return contactId;
};

/* ---------------------------------------------------
   GET CONTACT
--------------------------------------------------- */
export const getContactById = async (id) => {
  return await contactRepo.getById(id);
};

/* ---------------------------------------------------
   UPDATE CONTACT
--------------------------------------------------- */
export const updateContact = async (contactId, updates) => {
  return await contactRepo.updateContact(contactId, updates);
};

/* ---------------------------------------------------
   CREATE SESSION AND UPDATE TEMPERATURE
--------------------------------------------------- */
export const createSessionAndUpdateTemperature = async (sessionData) => {
  // Create the session
  const sessionId = await sessionRepo.createSession(sessionData);

  // Update contact temperature based on new average rating
  await updateContactTemperature(sessionData.contact_id);

  return sessionId;
};

/* ---------------------------------------------------
   GET CONTACTS BY STATUS
--------------------------------------------------- */
export const getContactsByStatus = async (companyId, status, limit = 50, offset = 0) => {
  if (status) {
    return await contactRepo.getByStatus(status, companyId);
  }
  return await contactRepo.getAll(companyId, limit, offset);
};

/* ---------------------------------------------------
   GET ALL CONTACTS WITH EMPLOYEE INFO (ADMIN)
--------------------------------------------------- */
export const getAllContactsWithEmployeeInfo = async (companyId, filters = {}) => {
  return await contactRepo.getAllWithEmployeeInfo(companyId, filters);
};

/* ---------------------------------------------------
   SYSTEM: LEAD → MQL (Marketing Automation)
   Triggered by email click or landing page visit
   - Converts LEAD to MQL
   - Creates a session with rating 10
   - Updates contact temperature
--------------------------------------------------- */
export const processLeadActivity = async ({ contactId, token }) => {
  const contact = await contactRepo.getById(contactId);
  if (!contact) {
    console.log(`⚠️ Contact ${contactId} not found for lead activity`);
    return { converted: false, reason: "Contact not found" };
  }

  // Security check - verify token matches (skip if no token provided)
  if (token && contact.tracking_token && contact.tracking_token !== token) {
    console.log(`⚠️ Token mismatch for contact ${contactId}`);
    return { converted: false, reason: "Invalid token" };
  }

  // Increase interest score
  await contactRepo.incrementInterestScore(contactId);

  // Auto promote LEAD → MQL
  if (contact.status === "LEAD") {
    // Update status to MQL
    await contactRepo.updateStatus(contactId, "MQL");
    
    // Insert status history
    await contactRepo.insertStatusHistory(
      contactId,
      "LEAD",
      "MQL",
      null // system - converted by email automation
    );

    // Create a session with rating 10 for email automation conversion
    await sessionRepo.createSession({
      contact_id: contactId,
      emp_id: contact.assigned_emp_id || null,
      stage: "MQL",
      mode_of_contact: "EMAIL",
      rating: 10,
      session_status: "COMPLETED",
      remarks: "Converted by email automation - Lead clicked email and visited landing page",
    });

    // Update contact temperature based on the new session rating
    await updateContactTemperature(contactId);

    console.log(`🎉 Contact ${contactId} (${contact.name}) converted: LEAD → MQL via email automation`);
    console.log(`   ✅ Session created with rating 10`);
    console.log(`   ✅ Temperature updated`);
    
    return { converted: true, newStatus: "MQL" };
  }

  return { converted: false, currentStatus: contact.status };
};

/* ---------------------------------------------------
   EMPLOYEE: LEAD → MQL (Manual Promotion)
--------------------------------------------------- */
export const promoteToMQL = async (contactId, empId) => {
  const contact = await contactRepo.getById(contactId);

  if (!contact) {
    throw new Error("Contact not found");
  }

  if (contact.status !== "LEAD") {
    throw new Error("Only LEAD can be promoted to MQL");
  }

  await contactRepo.updateStatus(contactId, "MQL");
  await contactRepo.insertStatusHistory(
    contactId,
    "LEAD",
    "MQL",
    empId
  );
};

/* ---------------------------------------------------
   EMPLOYEE: MQL → SQL
--------------------------------------------------- */
export const promoteToSQL = async (contactId, empId) => {
  const contact = await contactRepo.getById(contactId);

  if (!contact || contact.status !== "MQL") {
    throw new Error("Only MQL can be promoted to SQL");
  }

  const avgRating = await sessionRepo.getAverageRating(
    contactId,
    "MQL"
  );

  if (avgRating < 7) {
    throw new Error("MQL not qualified for SQL -lead should have avgRating >=7 ");
  }

  await contactRepo.updateStatus(contactId, "SQL");
  await contactRepo.insertStatusHistory(
    contactId,
    "MQL",
    "SQL",
    empId
  );
};

/* ---------------------------------------------------
   EMPLOYEE: SQL → OPPORTUNITY
--------------------------------------------------- */
export const convertToOpportunity = async (
  contactId,
  empId,
  expectedValue
) => {
  const contact = await contactRepo.getById(contactId);

  if (!contact || contact.status !== "SQL") {
    throw new Error("Only SQL can be converted to Opportunity");
  }

  await opportunityRepo.createOpportunity({
    contact_id: contactId,
    emp_id: empId,
    expected_value: expectedValue,
  });

  await contactRepo.updateStatus(contactId, "OPPORTUNITY");
  await contactRepo.insertStatusHistory(
    contactId,
    "SQL",
    "OPPORTUNITY",
    empId
  );
};

/* ---------------------------------------------------
   SYSTEM: OPPORTUNITY → CUSTOMER (Deal Closed)
--------------------------------------------------- */
export const closeDeal = async (contactId, empId, dealValue, productName = null) => {
  // Find the open opportunity for this contact
  const opportunity = await opportunityRepo.getOpenByContact(contactId);

  if (!opportunity || opportunity.status !== "OPEN") {
    throw new Error("No open opportunity found for this contact");
  }

  await dealRepo.createDeal({
    opportunity_id: opportunity.opportunity_id,
    deal_value: dealValue,
    product: productName ? productName.toLowerCase().trim() : null,
    closed_by: empId,
  });

  await opportunityRepo.markWon(opportunity.opportunity_id);

  await contactRepo.updateStatus(
    contactId,
    "CUSTOMER"
  );

  await contactRepo.insertStatusHistory(
    contactId,
    "OPPORTUNITY",
    "CUSTOMER",
    empId
  );
};

/* ---------------------------------------------------
   SYSTEM: CUSTOMER → EVANGELIST
--------------------------------------------------- */
export const convertToEvangelist = async (contactId) => {
  const contact = await contactRepo.getById(contactId);

  if (!contact || contact.status !== "CUSTOMER") {
    throw new Error("Only customers can become evangelists");
  }

  const avgFeedback =
    await feedbackRepo.getAverageRating(contactId);

  if (avgFeedback < 8) {
    throw new Error("Customer not eligible for evangelist");
  }

  await contactRepo.updateStatus(contactId, "EVANGELIST");
  await contactRepo.insertStatusHistory(
    contactId,
    "CUSTOMER",
    "EVANGELIST",
    null // system
  );
};

/* ---------------------------------------------------
   GET CONTACT FINANCIALS (Opportunities & Deals)
--------------------------------------------------- */
export const getContactFinancials = async (contactId) => {
  const [opportunities, deals] = await Promise.all([
    opportunityRepo.getByContactId(contactId),
    dealRepo.getByContactId(contactId),
  ]);

  // Calculate summary statistics
  const totalExpectedValue = opportunities.reduce(
    (sum, opp) => sum + parseFloat(opp.expected_value || 0),
    0
  );

  const totalDealValue = deals.reduce(
    (sum, deal) => sum + parseFloat(deal.deal_value || 0),
    0
  );

  const openOpportunities = opportunities.filter(opp => opp.status === 'OPEN');
  const wonOpportunities = opportunities.filter(opp => opp.status === 'WON');
  const lostOpportunities = opportunities.filter(opp => opp.status === 'LOST');

  return {
    opportunities,
    deals,
    summary: {
      totalOpportunities: opportunities.length,
      openOpportunities: openOpportunities.length,
      wonOpportunities: wonOpportunities.length,
      lostOpportunities: lostOpportunities.length,
      totalExpectedValue,
      totalDeals: deals.length,
      totalDealValue,
      conversionRate: opportunities.length > 0
        ? Math.round((wonOpportunities.length / opportunities.length) * 100)
        : 0,
    },
  };
};
