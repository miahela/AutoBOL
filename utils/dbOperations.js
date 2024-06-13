const pool = require('../config/db'); // Import the database pool

/**
 * Save an order to the database.
 * @param {Object} orderObject - The order details.
 */
async function saveOrderToDatabase(orderObject) {
    const checkQuery = 'SELECT 1 FROM commercehuborders WHERE po_number = $1';
    const insertQuery = `
        INSERT INTO commercehuborders (
            po_number, merchant, status, qty, order_date, must_ship_date, vendor_sku, province, customer_name, profile, full_address, is_added_to_monday
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `;
    const values = [
        orderObject['PO NUMBER'],
        orderObject['MERCHANT'],
        orderObject['STATUS'],
        orderObject['QTY'],
        orderObject['ORDER DATE'],
        orderObject['MUST SHIP DATE'],
        orderObject['VENDOR SKU'],
        orderObject['PROVINCE'],
        orderObject['CUSTOMER NAME'],
        orderObject['PROFILE'],
        orderObject['ADDRESS'],
        false
    ];

    try {
        const res = await pool.query(checkQuery, [orderObject['PO NUMBER']]);
        if (res.rows.length > 0) {
            console.log('Order already exists in the database:', orderObject['PO NUMBER']);
        } else {
            await pool.query(insertQuery, values);
            console.log('Order saved to database:', orderObject);
        }
    } catch (err) {
        console.error('Error saving order to database:', err);
    }
}
/**
 * Fetch all orders that have not been added to Monday.com.
 */
async function fetchAllOrders() {
    const query = 'SELECT * FROM commercehuborders WHERE is_added_to_monday = FALSE';
    try {
        const res = await pool.query(query);
        return res.rows;
    } catch (err) {
        console.error('Error fetching orders from database:', err);
        return [];
    }
}

/**
 * Fetch an order by its PO number.
 * @param {string} poNumber - The PO number of the order.
 */
async function fetchOrderByPONumber(poNumber) {
    const query = 'SELECT * FROM commercehuborders WHERE po_number = $1';
    try {
        const res = await pool.query(query, [poNumber]);
        return res.rows[0];
    } catch (err) {
        console.error('Error fetching order from database:', err);
        return null;
    }
}

/**
 * Update order status to indicate it has been added to Monday.com.
 * @param {string} poNumber - The PO number of the order.
 */
async function updateOrderStatus(poNumber) {
    const query = 'UPDATE commercehuborders SET is_added_to_monday = TRUE WHERE po_number = $1';
    try {
        await pool.query(query, [poNumber]);
        console.log(`Order ${poNumber} updated to is_added_to_monday = TRUE`);
    } catch (err) {
        console.error('Error updating order status in database:', err);
    }
}

module.exports = {
    saveOrderToDatabase,
    fetchAllOrders,
    fetchOrderByPONumber,
    updateOrderStatus
};