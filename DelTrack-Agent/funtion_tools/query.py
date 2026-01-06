import sqlite3
from datetime import datetime, timedelta, timezone
from typing import List, Dict
from langchain.tools import tool

@tool
def check_for_delayed_orders(
    db_path: str,
    threshold_hours: int = 24
) -> List[Dict]:
    """
    Finds orders that are delayed beyond the given threshold
    and have not yet been notified.

    Args:
        db_path (str): Path to delivery_tracking.db
        threshold_hours (int): Delay threshold in hours

    Returns:
        List[Dict]: Structured delayed order records
    """

    cutoff_time = datetime.now(timezone.utc) - timedelta(hours=threshold_hours)

    query = """
    SELECT
        o.order_id,
        o.product_name,
        o.expected_delivery_date,
        o.current_status,
        c.customer_id,
        c.name AS customer_name,
        c.email AS customer_email,
        n.reason AS delay_reason
    FROM orders o
    JOIN customers c
        ON o.customer_id = c.customer_id
    LEFT JOIN notifications_log n
        ON o.order_id = n.order_id
        AND n.notification_type = 'DELIVERY_DELAY'
    WHERE
        o.expected_delivery_date < ?
        AND o.current_status != 'Delivered'
        AND n.notification_id IS NULL
    ORDER BY o.expected_delivery_date ASC;
    """

    # Register adapter and converter for timezone-aware datetime
    def adapt_datetime(dt):
        return dt.isoformat()

    def convert_datetime(s):
        return datetime.fromisoformat(s.decode())

    sqlite3.register_adapter(datetime, adapt_datetime)
    sqlite3.register_converter("timestamp", convert_datetime)

    conn = sqlite3.connect(db_path, detect_types=sqlite3.PARSE_DECLTYPES | sqlite3.PARSE_COLNAMES)
    conn.row_factory = sqlite3.Row

    try:
        cursor = conn.cursor()
        cursor.execute(query, (cutoff_time,))
        rows = cursor.fetchall()

        delayed_orders = [
            {
                "order_id": row["order_id"],
                "product_name": row["product_name"],
                "expected_delivery_date": row["expected_delivery_date"],
                "current_status": row["current_status"],
                "customer": {
                    "customer_id": row["customer_id"],
                    "name": row["customer_name"],
                    "email": row["customer_email"],
                },
                "delay_hours": round(
                    (datetime.now(timezone.utc) - row["expected_delivery_date"]).total_seconds() / 3600,
                    2
                ),
                "delay_reason": row["delay_reason"] if "delay_reason" in row.keys() else None
            }
            for row in rows
        ]

        return delayed_orders

    finally:
        conn.close()


