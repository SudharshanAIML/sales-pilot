import * as opportunityRepo from "./opportunity.repo.js";
import * as contactRepo from "../contacts/contact.repo.js";
import * as dealRepo from "../deals/deal.repo.js";

/* ---------------------------------------------------
   CREATE OPPORTUNITY (SQL → OPPORTUNITY)
--------------------------------------------------- */
export const createOpportunity = async (
  contactId,
  empId,
  expectedValue
) => {
  const contact = await contactRepo.getById(contactId);

  if (!contact) {
    throw new Error("Contact not found");
  }

  if (contact.status !== "SQL") {
    throw new Error("Only SQL contacts can create opportunities");
  }

  // Ensure no OPEN opportunity already exists
  const existing =
    await opportunityRepo.getOpenByContact(contactId);

  if (existing) {
    throw new Error("An open opportunity already exists");
  }

  const opportunityId = await opportunityRepo.createOpportunity({
    contact_id: contactId,
    emp_id: empId,
    expected_value: expectedValue,
    status: "OPEN",
  });

  // Update contact status
  await contactRepo.updateStatus(contactId, "OPPORTUNITY");

  // Status history
  await contactRepo.insertStatusHistory(
    contactId,
    "SQL",
    "OPPORTUNITY",
    empId
  );

  return opportunityId;
};

/* ---------------------------------------------------
   GET OPPORTUNITY BY ID
--------------------------------------------------- */
export const getOpportunityById = async (opportunityId) => {
  return await opportunityRepo.getById(opportunityId);
};

/* ---------------------------------------------------
   MARK OPPORTUNITY AS WON (→ CUSTOMER)
--------------------------------------------------- */
export const markAsWon = async (
  opportunityId,
  empId,
  dealValue
) => {
  const opportunity =
    await opportunityRepo.getById(opportunityId);

  if (!opportunity) {
    throw new Error("Opportunity not found");
  }

  if (opportunity.status !== "OPEN") {
    throw new Error("Only OPEN opportunities can be won");
  }

  // Create deal (money locked)
  await dealRepo.createDeal({
    opportunity_id: opportunityId,
    deal_value: dealValue,
    closed_by: empId,
  });

  // Mark opportunity as WON
  await opportunityRepo.updateStatus(
    opportunityId,
    "WON"
  );

  // Convert contact to CUSTOMER
  await contactRepo.updateStatus(
    opportunity.contact_id,
    "CUSTOMER"
  );

  // Status history
  await contactRepo.insertStatusHistory(
    opportunity.contact_id,
    "OPPORTUNITY",
    "CUSTOMER",
    empId
  );
};

/* ---------------------------------------------------
   MARK OPPORTUNITY AS LOST (→ DORMANT)
--------------------------------------------------- */
export const markAsLost = async (
  opportunityId,
  empId,
  reason = null
) => {
  const opportunity =
    await opportunityRepo.getById(opportunityId);

  if (!opportunity) {
    throw new Error("Opportunity not found");
  }

  if (opportunity.status !== "OPEN") {
    throw new Error("Only OPEN opportunities can be lost");
  }

  // Mark opportunity as LOST
  await opportunityRepo.updateStatus(
    opportunityId,
    "LOST",
    reason
  );

  // Move contact to DORMANT
  await contactRepo.updateStatus(
    opportunity.contact_id,
    "DORMANT"
  );

  // Status history
  await contactRepo.insertStatusHistory(
    opportunity.contact_id,
    "OPPORTUNITY",
    "DORMANT",
    empId
  );
};
