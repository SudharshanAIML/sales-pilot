import { db } from "../../config/db.js";

/* ---------------------------------------------------
   CREATE FEEDBACK
--------------------------------------------------- */
export const createFeedback = async (data) => {
  await db.query(
    `
    INSERT INTO feedback (
      contact_id,
      rating,
      comment
    )
    VALUES (?, ?, ?)
    `,
    [
      data.contact_id,
      data.rating,
      data.comment || null,
    ]
  );
};

/* ---------------------------------------------------
   GET FEEDBACK BY CONTACT
--------------------------------------------------- */
export const getByContact = async (contactId) => {
  const [rows] = await db.query(
    `
    SELECT *
    FROM feedback
    WHERE contact_id = ?
    ORDER BY created_at DESC
    `,
    [contactId]
  );

  return rows;
};

/* ---------------------------------------------------
   GET AVERAGE RATING (EVANGELIST LOGIC)
--------------------------------------------------- */
export const getAverageRating = async (contactId) => {
  const [rows] = await db.query(
    `
    SELECT AVG(rating) AS avgRating
    FROM feedback
    WHERE contact_id = ?
    `,
    [contactId]
  );

  return rows[0].avgRating || 0;
};

/* ---------------------------------------------------
   GET FEEDBACK COUNT
--------------------------------------------------- */
export const getFeedbackCount = async (contactId) => {
  const [rows] = await db.query(
    `
    SELECT COUNT(*) AS count
    FROM feedback
    WHERE contact_id = ?
    `,
    [contactId]
  );

  return rows[0].count;
};

/* ---------------------------------------------------
   DELETE FEEDBACK (RARE / ADMIN)
--------------------------------------------------- */
export const deleteFeedback = async (feedbackId) => {
  await db.query(
    `
    DELETE FROM feedback
    WHERE feedback_id = ?
    `,
    [feedbackId]
  );
};
