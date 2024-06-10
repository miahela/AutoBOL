const pool = require('../config/db'); // Import the database pool

/**
 * Save an order to the database.
 * @param {Object} orderObject - The order details.
 */
async function saveOrderToDatabase(orderObject) {
    const query = `
        INSERT INTO commercehuborders (
            po_number, merchant, status, qty, order_date, must_ship_date, vendor_sku, province, customer_name, profile
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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
        orderObject['PROFILE']
    ];

    try {
        await pool.query(query, values);
        console.log('Order saved to database:', orderObject);
    } catch (err) {
        console.error('Error saving order to database:', err);
    }
}

/**
 * Fetch all orders from the database.
 */
async function fetchAllOrders() {
    const query = 'SELECT * FROM commercehuborders';
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

module.exports = {
    saveOrderToDatabase,
    fetchAllOrders,
    fetchOrderByPONumber
};