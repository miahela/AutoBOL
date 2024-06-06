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

    const formattedOrderDate = entry["ORDER DATE"] ? formatDate(entry["ORDER DATE"]) : null;
    const formattedMustShipDate = entry["MUST SHIP DATE"] ? formatDate(entry["MUST SHIP DATE"]) : null;
    const customerLabel = mapCustomerLabel(entry["MERCHANT"]);
    const mappedBoardId = mapBoardId(entry["PROFILE"], customerLabel);

    let columnValues = {
        "item": entry["PO NUMBER"],
        "customer": {
            "labels": [customerLabel]
        },
        "qty": entry["QTY"]
    };

    if (mappedBoardId === USA_BOARD_ID) {
        columnValues = {
            ...columnValues,
            "date4": formattedOrderDate ? {
                "date": formattedOrderDate
            } : undefined,
            "date7": formattedMustShipDate ? {
                "date": formattedMustShipDate
            } : undefined,
            "invoice_": entry["VENDOR SKU"] || "",
            "text83": entry["CUSTOMER NAME"] && Object.keys(entry["CUSTOMER NAME"]).length ? entry["CUSTOMER NAME"] : undefined,
            "text7": entry["PROVINCE"] && Object.keys(entry["PROVINCE"]).length ? entry["PROVINCE"] : undefined,
            "numbers7": entry["QTY"]
        };
    } else if (mappedBoardId === CANADA_BOARD_ID) {
        columnValues = {
            ...columnValues,
            "date4": formattedOrderDate ? {
                "date": formattedOrderDate
            } : undefined,
            "date__1": formattedMustShipDate ? {
                "date": formattedMustShipDate
            } : undefined,
            "invoice_": entry["VENDOR SKU"] || "",
            "text2": entry["CUSTOMER NAME"] && Object.keys(entry["CUSTOMER NAME"]).length ? entry["CUSTOMER NAME"] : undefined,
            "text6": entry["PROVINCE"] && Object.keys(entry["PROVINCE"]).length ? entry["PROVINCE"] : undefined,
            "numbers": entry["QTY"]
        };
    }

    // Remove undefined or empty string values
    Object.keys(columnValues).forEach(key => {
        if (columnValues[key] === undefined || columnValues[key] === "") {
            delete columnValues[key];
        }
    });

    const variables = {
        boardId: String(mappedBoardId),
        groupId: String(mappedBoardId === USA_BOARD_ID ? USA_GROUP_ID : CANADA_GROUP_ID),
        itemName: `PO Number: ${entry["PO NUMBER"]}`,
        columnValues: JSON.stringify(columnValues)
    };

    monday.api(query, {
        variables
    }).then(res => {
        if (res.data && res.data.create_item) {
            console.log('Item Created or Updated:', res.data.create_item);
            console.log("Item created or updated successfully");
        } else {
            console.log('No data returned or unexpected response structure:', res);
            console.log('Variables:', variables);
        }
    }).catch(err => {
        console.error('Error creating or updating item:', err);
    });
}

function mapBoardId(profile, merchant) {
    let boardId;
    if (merchant === "Lowes-USA") {
        boardId = USA_BOARD_ID;
        return boardId;
    }
    if (profile === "2") {
        if (merchant === "Rona" || merchant === "Reno-Depot" || merchant === "Lowes-Canada") {
            boardId = CANADA_BOARD_ID;
        } else {
            boardId = USA_BOARD_ID;
        }
    } else {
        boardId = CANADA_BOARD_ID;
    }
    return boardId;
}

function mapCustomerLabel(originalCustomer) {
    const customerMap = {
        "The Home Depot Canada": "HomeDepotCanada-Canada-CAD",
        "RONA": "Rona",
        "Lowes-Canada": "Lowes-Canada",
        "Reno-Depot": "RenoDepot",
        "Lowe's": "Lowes-USA",
        "Home Depot Canada": "HomeDepotCanada-USA",
        "Home Depot USA": "HomeDepot-USA"
    };
    return customerMap[originalCustomer] || originalCustomer;
}