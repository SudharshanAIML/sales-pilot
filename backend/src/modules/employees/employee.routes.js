import { Router } from "express";
import * as employeeController from "./employee.controller.js";
import { authenticateEmployee } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";
import { USER_ROLES } from "../../utils/constants.js";

const router = Router();

/* ---------------------------------------------------
   COMPLETE EMPLOYEE PROFILE
--------------------------------------------------- */
/**
 * @route   POST /employees/complete-profile
 * @desc    Complete employee profile after Google OAuth
 * @access  Employee
 */
router.post(
  "/complete-profile",
  authenticateEmployee,
  employeeController.completeProfile
);

/* ---------------------------------------------------
   GET CURRENT USER PROFILE
--------------------------------------------------- */
/**
 * @route   GET /employees/me
 * @desc    Get current logged-in employee profile
 * @access  Employee
 */
router.get(
  "/me",
  authenticateEmployee,
  employeeController.getProfile
);

/* ---------------------------------------------------
   CREATE EMPLOYEE (ADMIN)
--------------------------------------------------- */
/**
 * @route   POST /employees
 * @desc    Create new employee
 * @access  Admin
 */
router.post(
  "/",
  authenticateEmployee,
  authorizeRoles(USER_ROLES.ADMIN),
  employeeController.createEmployee
);

/* ---------------------------------------------------
   GET TEAM WITH STATUS (ADMIN)
--------------------------------------------------- */
/**
 * @route   GET /employees/team
 * @desc    Get all team members with invitation status
 * @access  Admin
 */
router.get(
  "/team",
  authenticateEmployee,
  authorizeRoles(USER_ROLES.ADMIN),
  employeeController.getTeamWithStatus
);

/* ---------------------------------------------------
   RESEND INVITATION (ADMIN)
--------------------------------------------------- */
/**
 * @route   POST /employees/:id/resend-invite
 * @desc    Resend invitation email to employee
 * @access  Admin
 */
router.post(
  "/:id/resend-invite",
  authenticateEmployee,
  authorizeRoles(USER_ROLES.ADMIN),
  employeeController.resendInvitation
);

/* ---------------------------------------------------
   TOGGLE EMPLOYEE STATUS (ADMIN)
--------------------------------------------------- */
/**
 * @route   PATCH /employees/:id/status
 * @desc    Enable or disable an employee
 * @access  Admin
 */
router.patch(
  "/:id/status",
  authenticateEmployee,
  authorizeRoles(USER_ROLES.ADMIN),
  employeeController.toggleEmployeeStatus
);

/* ---------------------------------------------------
   GET EMPLOYEE BY ID
--------------------------------------------------- */
/**
 * @route   GET /employees/:id
 * @desc    Get employee by ID
 * @access  Employee
 */
router.get(
  "/:id",
  authenticateEmployee,
  employeeController.getEmployeeById
);

/* ---------------------------------------------------
   GET EMPLOYEES BY COMPANY
--------------------------------------------------- */
/**
 * @route   GET /employees/company/:companyId
 * @desc    Get all employees of a company
 * @access  Employee
 */
router.get(
  "/company/:companyId",
  authenticateEmployee,
  employeeController.getEmployeesByCompany
);

/* ---------------------------------------------------
   UPDATE EMPLOYEE
--------------------------------------------------- */
/**
 * @route   PATCH /employees/:id
 * @desc    Update employee details
 * @access  Admin / Self
 */
router.patch(
  "/:id",
  authenticateEmployee,
  employeeController.updateEmployee
);

/* ---------------------------------------------------
   UPDATE EMPLOYEE ROLE (ADMIN)
--------------------------------------------------- */
/**
 * @route   PATCH /employees/:id/role
 * @desc    Update employee role (promote/demote)
 * @access  Admin
 */
router.patch(
  "/:id/role",
  authenticateEmployee,
  authorizeRoles(USER_ROLES.ADMIN),
  employeeController.updateEmployeeRole
);

/* ---------------------------------------------------
   DELETE EMPLOYEE
--------------------------------------------------- */
/**
 * @route   DELETE /employees/:id
 * @desc    Delete employee
 * @access  Admin
 */
router.delete(
  "/:id",
  authenticateEmployee,
  authorizeRoles(USER_ROLES.ADMIN),
  employeeController.deleteEmployee
);

export default router;
