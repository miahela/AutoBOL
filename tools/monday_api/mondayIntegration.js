require('dotenv').config();
const fs = require('fs');
const mondaySdk = require("monday-sdk-js");
const monday = mondaySdk();
const {
    readFromJsonFile,
} = require('../../utils/jsonManager');
const {
    formatDate
} = require('../../utils/dateManager');

const MONDAY_API_KEY = process.env.MONDAY_API_KEY;
const USA_BOARD_ID = process.env.USA_BOARD_ID;
const CANADA_BOARD_ID = process.env.CA_BOARD_ID;
const USA_GROUP_ID = process.env.USA_GROUP_ID;
const CANADA_GROUP_ID = process.env.CA_GROUP_ID;

monday.setToken(MONDAY_API_KEY);

const jsonFilePath = './data/orders.json';
try {
    const data = readFromJsonFile(jsonFilePath);
    const orders = JSON.parse(data);
    processOrders(orders.ordersList);
} catch (err) {
    console.error("Error handling JSON data:", err);
}

function processOrders(entries) {
    entries.forEach(entry => {
        createOrUpdateItem(entry);
    });
}

function createOrUpdateItem(entry) {
    const query = `mutation($boardId: ID!, $groupId: String!, $itemName: String!, $columnValues: JSON!) {
        create_item(board_id: $boardId, group_id: $groupId, item_name: $itemName, column_values: $columnValues) {
            id
            name
            column_values {
                id
                text
                value
            }
        }
    }`;

    const formattedOrderDate = formatDate(entry["ORDER DATE"]);
    const formattedMustShipDate = formatDate(entry["MUST SHIP DATE"]);

    const variables = {
        boardId: String(entry["COUNTRY"] === "USA" ? USA_BOARD_ID : CANADA_BOARD_ID),
        groupId: String(entry["COUNTRY"] === "USA" ? USA_GROUP_ID : CANADA_GROUP_ID),
        itemName: `PO Number: ${entry["PO NUMBER"]}`,
        columnValues: JSON.stringify({
            "text": entry["PO NUMBER"],
            "customer": {
                "labels": [mapCustomerLabel(entry["MERCHANT"])]
            },
            "status": {
                "label": mapStatusLabel(entry["STATUS"])
            },
            "date4": {
                "date": formattedOrderDate
            },
            "date9": {
                "date": formattedMustShipDate
            },
            "qty": entry["QTY"],
            "vendor_sku": entry["VENDOR SKU"],
            "province": entry["PROVINCE"],
            "customer_name": entry["CUSTOMER NAME"]
        })
    };

    monday.api(query, {
        variables
    }).then(res => {
        if (res.data && res.data.create_item) {
            console.log('Item Created or Updated:', res.data.create_item);
        } else {
            console.log('No data returned or unexpected response structure:', res);
        }
    }).catch(err => {
        console.error('Error creating or updating item:', err);
    });
}

function mapStatusLabel(originalStatus) {
    const statusMap = {
        "Open": "Pending Verification",
        // TODO: Add more status mappings as needed
    };
    return statusMap[originalStatus] || originalStatus;
}

function mapCustomerLabel(originalCustomer) {
    const customerMap = {
        "The Home Depot Canada": "HomeDepotCanada-Canada-CAD",
        "Costco": "Costco-Canada",
        "Lowe's": "Lowes-Canada",
        "RONA": "Rona",
    }
    return customerMap[originalCustomer] || originalCustomer;
}