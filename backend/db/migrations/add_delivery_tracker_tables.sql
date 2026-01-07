-- Delivery Tracker Tables (Migrated from DelTrack-Agent Python/SQLite)

-- Customers table (if not exists)
CREATE TABLE IF NOT EXISTS customers (
  customer_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  company_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_company (company_name)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  order_id INT PRIMARY KEY AUTO_INCREMENT,
  customer_id INT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expected_delivery_date DATETIME NOT NULL,
  current_status VARCHAR(50) DEFAULT 'Pending',
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
  INDEX idx_status (current_status),
  INDEX idx_expected_delivery (expected_delivery_date),
  INDEX idx_customer (customer_id)
);

-- Tracking history table (For detailed logs)
CREATE TABLE IF NOT EXISTS tracking_history (
  history_id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  location VARCHAR(255),
  status_update VARCHAR(255),
  update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  INDEX idx_order (order_id),
  INDEX idx_update_time (update_time)
);

-- Proactive Notifications Log (Prevents double-emailing)
CREATE TABLE IF NOT EXISTS notifications_log (
  notification_id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  notification_type VARCHAR(50),
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reason TEXT,
  email_status VARCHAR(50) DEFAULT 'sent',
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  INDEX idx_order (order_id),
  INDEX idx_type (notification_type),
  INDEX idx_sent_at (sent_at)
);

-- Insert sample data for testing
INSERT IGNORE INTO customers (name, email, phone, company_name) VALUES
('John Smith', 'john@acmecorp.com', '+1-555-0101', 'Acme Corp'),
('Sarah Johnson', 'sarah@globalsolutions.com', '+1-555-0102', 'Global Solutions'),
('Mike Chen', 'mike@nextgen.com', '+1-555-0103', 'NextGen Ventures'),
('Emma Davis', 'emma@innovatecorp.com', '+1-555-0104', 'Innovate Corp');

-- Insert delayed orders for testing (expected_delivery_date in the past)
INSERT INTO orders (customer_id, product_name, expected_delivery_date, current_status) VALUES
(1, 'Enterprise CRM License', DATE_SUB(NOW(), INTERVAL 12 HOUR), 'In Transit'),
(2, 'Analytics Module', DATE_SUB(NOW(), INTERVAL 48 HOUR), 'Pending'),
(3, 'Email Integration Package', DATE_SUB(NOW(), INTERVAL 6 HOUR), 'Out for Delivery'),
(4, 'Advanced Reporting Suite', DATE_SUB(NOW(), INTERVAL 24 HOUR), 'In Transit');

-- Insert tracking history
INSERT INTO tracking_history (order_id, location, status_update) VALUES
(1, 'Distribution Center, Chicago IL', 'In Transit'),
(3, 'Local Delivery Station', 'Out for Delivery'),
(4, 'Regional Hub, Dallas TX', 'In Transit');
