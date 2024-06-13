require('dotenv').config();
const mondaySdk = require("monday-sdk-js");
const monday = mondaySdk();
const {
    fetchAllOrders,
    updateOrderStatus
} = require('../../utils/dbOperations');
const {
    formatDate
} = require('../../utils/dateManager');

const MONDAY_API_KEY = process.env.MONDAY_API_KEY;
const USA_BOARD_ID = process.env.USA_BOARD_ID;
const CANADA_BOARD_ID = process.env.CA_BOARD_ID;
const USA_GROUP_ID = process.env.USA_GROUP_ID;
const CANADA_GROUP_ID = process.env.CA_GROUP_ID;

monday.setToken(MONDAY_API_KEY);

async function main() {
    try {
        const orders = await fetchAllOrders();
        processOrders(orders);
    } catch (err) {
        console.error("Error handling database data:", err);
    }
}

function processOrders(entries) {
    entries.forEach(entry => {
        createOrUpdateItem(entry);
    });
}

async function createOrUpdateItem(entry) {
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

    const formattedOrderDate = entry["order_date"] ? formatDate(entry["order_date"].toISOString().split('T')[0]) : null;
    const formattedMustShipDate = entry["must_ship_date"] ? formatDate(entry["must_ship_date"].toISOString().split('T')[0]) : null;
    const customerLabel = mapCustomerLabel(entry["merchant"], entry["profile"]);
    const mappedBoardId = mapBoardId(entry["profile"], customerLabel);

    let columnValues = {
        "item": entry["po_number"],
        "customer": {
            "labels": [customerLabel]
        },
        "qty": entry["qty"]
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
            "invoice_": entry["vendor_sku"] || "",
            "text83": entry["customer_name"] && Object.keys(entry["customer_name"]).length ? entry["customer_name"] : undefined,
            "text7": entry["province"] && Object.keys(entry["province"]).length ? entry["province"] : undefined,
            "numbers7": entry["qty"]
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
            "invoice_": entry["vendor_sku"] || "",
            "text2": entry["customer_name"] && Object.keys(entry["customer_name"]).length ? entry["customer_name"] : undefined,
            "text6": entry["province"] && Object.keys(entry["province"]).length ? entry["province"] : undefined,
            "numbers": entry["qty"]
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
        itemName: entry["po_number"],
        columnValues: JSON.stringify(columnValues)
    };

    try {
        const res = await monday.api(query, {
            variables
        });

        if (res.data && res.data.create_item) {
            console.log('Item Created or Updated:', res.data.create_item);
            await updateOrderStatus(entry["po_number"]);
        } else {
            console.log('No data returned or unexpected response structure:', res);
            console.log('Variables:', variables);
        }
    } catch (err) {
        console.error('Error creating or updating item:', err);
    }
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

function mapCustomerLabel(originalCustomer, profile) {
    const customerMap = {
        "The Home Depot Canada": profile == 1 ? "HomeDepotCanada-Canada-CAD" : "HomeDepotCanada-USA",
        "RONA": "Rona",
        "Lowes-Canada": "Lowes-Canada",
        "Reno-Depot": "RenoDepot",
        "Lowe's": "Lowes-USA",
        "Home Depot Canada": "HomeDepotCanada-USA",
        "The Home Depot Inc": "HomeDepot-USA"
    };
    return customerMap[originalCustomer] || originalCustomer;
}

main();