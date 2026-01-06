-- Customers Table
CREATE TABLE customers (
    customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT
);

-- Orders Table
CREATE TABLE orders (
    order_id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER,
    product_name TEXT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expected_delivery_date TIMESTAMP NOT NULL,
    current_status TEXT, -- 'Pending', 'In Transit', 'Out for Delivery', 'Delivered', 'Delayed'
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(customer_id) REFERENCES customers(customer_id)
);

-- Tracking History (For detailed logs)
CREATE TABLE tracking_history (
    history_id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    location TEXT,
    status_update TEXT,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(order_id) REFERENCES orders(order_id)
);

-- Proactive Notifications Log (Prevents double-emailing)
CREATE TABLE notifications_log (
    notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    notification_type TEXT, -- 'Delay_Alert'
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reason TEXT,
    FOREIGN KEY(order_id) REFERENCES orders(order_id)
);

-- Indexing for high-performance lookups in large DBs
CREATE INDEX idx_order_status ON orders(current_status);
CREATE INDEX idx_expected_delivery ON orders(expected_delivery_date);
