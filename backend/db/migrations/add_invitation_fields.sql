-- Add invitation-related fields to employees table
ALTER TABLE employees 
ADD COLUMN invitation_status ENUM('INVITED', 'PENDING', 'ACTIVE', 'DISABLED') DEFAULT 'ACTIVE' AFTER department,
ADD COLUMN invitation_token VARCHAR(255) DEFAULT NULL AFTER invitation_status,
ADD COLUMN invitation_sent_at TIMESTAMP NULL DEFAULT NULL AFTER invitation_token,
ADD COLUMN invited_by INT DEFAULT NULL AFTER invitation_sent_at,
ADD COLUMN last_login_at TIMESTAMP NULL DEFAULT NULL AFTER invited_by;

-- Add index for faster lookups
CREATE INDEX idx_invitation_token ON employees(invitation_token);
CREATE INDEX idx_invitation_status ON employees(invitation_status);

-- Add foreign key for invited_by (references the admin who invited)
ALTER TABLE employees 
ADD CONSTRAINT fk_invited_by FOREIGN KEY (invited_by) REFERENCES employees(emp_id) ON DELETE SET NULL;
