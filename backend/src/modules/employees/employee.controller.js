import * as employeeService from "./employee.service.js";
import * as employeeRepo from "./employee.repo.js";
import * as companyRepo from "../companies/company.repo.js";
import { sendInvitationEmail } from "../../utils/emailService.js";
import jwt from "jsonwebtoken";

/**
 * @desc   Complete employee profile after Google OAuth
 * @route  POST /employees/complete-profile
 * @access Employee
 */
export const completeProfile = async (req, res, next) => {
  try {
    const { name, phone, role, department, companyName } = req.body;
    const empId = req.user.empId;

    // Validate required fields
    if (!name || !phone || !role || !department) {
      return res.status(400).json({
        message: "Name, phone, role, and department are required",
      });
    }

    let companyId = req.user.companyId;

    // If user is an ADMIN and doesn't have a company, create one
    if (role === 'ADMIN' && !companyId) {
      // Get employee email to extract domain
      const employee = await employeeService.getEmployeeById(empId);
      const emailDomain = employee.email.split('@')[1];
      
      // Create a new company for this admin
      companyId = await companyRepo.createCompany({
        company_name: companyName || `${name}'s Company`,
        domain: emailDomain,
        email: employee.email,
      });
    }

    // Update employee profile with company_id
    await employeeService.updateEmployee(empId, {
      name,
      phone,
      role,
      department,
      company_id: companyId,
    });

    // Get updated employee data
    const updatedEmployee = await employeeService.getEmployeeById(empId);

    // Generate new JWT with updated company_id
    const newToken = jwt.sign(
      {
        empId: updatedEmployee.emp_id,
        companyId: updatedEmployee.company_id,
        role: updatedEmployee.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Profile completed successfully",
      token: newToken,
      user: {
        name: updatedEmployee.name,
        email: updatedEmployee.email,
        phone: updatedEmployee.phone,
        department: updatedEmployee.department,
        role: updatedEmployee.role,
        company_id: updatedEmployee.company_id,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Create a new employee (invite)
 * @route  POST /employees
 * @access Admin
 */
export const createEmployee = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const adminId = req.user.empId;
    const { sendInvite = true } = req.body;
    
    // Add the admin's company_id and invitation info
    const employeeData = {
      ...req.body,
      company_id: companyId,
      invitation_status: 'INVITED',
      invited_by: adminId
    };

    const { insertId: empId, invitationToken } = await employeeService.createEmployee(employeeData);

    // Send invitation email if requested
    if (sendInvite && invitationToken) {
      try {
        // Get admin info and company name
        const admin = await employeeService.getEmployeeById(adminId);
        const company = await companyRepo.getById(companyId);
        
        await sendInvitationEmail({
          to: employeeData.email,
          employeeName: employeeData.name,
          adminName: admin?.name || 'Admin',
          companyName: company?.company_name || 'CRM Platform',
          inviteToken: invitationToken
        });
      } catch (emailError) {
        console.error('Failed to send invitation email:', emailError);
        // Don't fail the request, employee is created
      }
    }

    res.status(201).json({
      message: sendInvite ? "Employee created and invitation sent" : "Employee created successfully",
      empId,
      invitationSent: sendInvite
    });
  } catch (error) {
    // Handle duplicate email error
    if (error.message.includes('already exists')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

/**
 * @desc   Resend invitation to employee
 * @route  POST /employees/:id/resend-invite
 * @access Admin
 */
export const resendInvitation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminId = req.user.empId;
    const companyId = req.user.companyId;
    
    // Get the employee
    const employee = await employeeService.getEmployeeById(id);
    
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    
    // Check if employee belongs to same company
    if (employee.company_id !== companyId) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    if (employee.invitation_status === 'ACTIVE') {
      return res.status(400).json({ message: "Employee has already accepted the invitation" });
    }
    
    // Generate new token
    const newToken = await employeeRepo.resendInvitation(id);
    
    // Send email
    const admin = await employeeService.getEmployeeById(adminId);
    const company = await companyRepo.getById(companyId);
    
    await sendInvitationEmail({
      to: employee.email,
      employeeName: employee.name,
      adminName: admin?.name || 'Admin',
      companyName: company?.company_name || 'CRM Platform',
      inviteToken: newToken
    });
    
    res.json({ message: "Invitation resent successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get all employees with invitation status (Admin)
 * @route  GET /employees/team
 * @access Admin
 */
export const getTeamWithStatus = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const employees = await employeeRepo.getByCompanyWithStatus(companyId);
    
    res.json(employees);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Toggle employee status (enable/disable)
 * @route  PATCH /employees/:id/status
 * @access Admin
 */
export const toggleEmployeeStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'ACTIVE' or 'DISABLED'
    const companyId = req.user.companyId;
    
    if (!['ACTIVE', 'DISABLED'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    const employee = await employeeService.getEmployeeById(id);
    
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    
    if (employee.company_id !== companyId) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    await employeeRepo.updateInvitationStatus(id, status);
    
    res.json({ message: `Employee ${status === 'ACTIVE' ? 'enabled' : 'disabled'} successfully` });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get employee by ID
 * @route  GET /employees/:id
 * @access Employee
 */
export const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await employeeService.getEmployeeById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    // Remove sensitive fields
    delete employee.password;

    res.json(employee);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get employees by company
 * @route  GET /employees/company/:companyId
 * @access Employee
 */
export const getEmployeesByCompany = async (req, res, next) => {
  try {
    const employees = await employeeService.getEmployeesByCompany(
      req.params.companyId
    );

    res.json(employees);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get current logged-in employee profile
 * @route  GET /employees/me
 * @access Employee
 */
export const getProfile = async (req, res, next) => {
  try {
    const employee = await employeeService.getEmployeeById(req.user.empId);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    // Return complete profile information
    res.json({
      emp_id: employee.emp_id,
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      department: employee.department,
      role: employee.role,
      company_id: employee.company_id,
      created_at: employee.created_at,
      updated_at: employee.updated_at,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update employee
 * @route  PATCH /employees/:id
 * @access Admin / Self
 */
export const updateEmployee = async (req, res, next) => {
  try {
    await employeeService.updateEmployee(req.params.id, req.body);

    res.json({
      message: "Employee updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update employee role (Admin only)
 * @route  PATCH /employees/:id/role
 * @access Admin
 */
export const updateEmployeeRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const targetEmpId = req.params.id;
    const adminEmpId = req.user.empId;

    // Validate role
    if (!role || !['ADMIN', 'EMPLOYEE'].includes(role)) {
      return res.status(400).json({
        message: "Invalid role. Must be 'ADMIN' or 'EMPLOYEE'",
      });
    }

    // Prevent admin from demoting themselves
    if (targetEmpId == adminEmpId && role === 'EMPLOYEE') {
      return res.status(400).json({
        message: "You cannot demote yourself",
      });
    }

    // Check if target employee exists and belongs to same company
    const targetEmployee = await employeeService.getEmployeeById(targetEmpId);
    if (!targetEmployee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    if (targetEmployee.company_id !== req.user.companyId) {
      return res.status(403).json({
        message: "Cannot modify employees from other companies",
      });
    }

    await employeeService.updateEmployee(targetEmpId, { role });

    res.json({
      message: `Employee role updated to ${role}`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Delete employee
 * @route  DELETE /employees/:id
 * @access Admin
 */
export const deleteEmployee = async (req, res, next) => {
  try {
    const targetEmpId = req.params.id;
    const adminEmpId = req.user.empId;

    // Prevent admin from deleting themselves
    if (targetEmpId == adminEmpId) {
      return res.status(400).json({
        message: "You cannot delete yourself",
      });
    }

    // Check if target employee exists and belongs to same company
    const targetEmployee = await employeeService.getEmployeeById(targetEmpId);
    if (!targetEmployee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    if (targetEmployee.company_id !== req.user.companyId) {
      return res.status(403).json({
        message: "Cannot delete employees from other companies",
      });
    }

    await employeeService.deleteEmployee(targetEmpId);

    res.json({
      message: "Employee deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
