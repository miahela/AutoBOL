const {
    formatDate
} = require('../../utils/dateManager');
const mondaySdk = require("monday-sdk-js");
const monday = mondaySdk();
const {
    USA_BOARD_ID,
    CANADA_BOARD_ID,
    USA_GROUP_ID,
    CANADA_GROUP_ID,
} = require('./mondayIntegration');

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

    const variables = {
        boardId: entry["COUNTRY"] === "USA" ? USA_BOARD_ID : CANADA_BOARD_ID,
        groupId: entry["COUNTRY"] === "USA" ? USA_GROUP_ID : CANADA_GROUP_ID,
        itemName: `PO Number: ${entry["PO NUMBER"]}`,
        columnValues: JSON.stringify({
            "text": entry["PO NUMBER"],
            "customer": {
                "labels": [mapCostumerLabel(entry["MERCHANT"])]
            },
            "status": {
                "label": mapStatusLabel(entry["STATUS"])
            },
            "date4": {
                "date": formatDate(entry["ORDER DATE"])
            }
        })
    };

    monday.api(query, {
            variables
        })
        .then(res => {
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
        //TODO: Add more status mappings as needed
    };
    return statusMap[originalStatus] || originalStatus;
}

function mapCostumerLabel(originalCustomer) {
    const customerMap = {
        "The Home Depot Canada": "HomeDepotCanada-Canada-CAD",
        "Costco": "Costco-Canada"
    };
    return customerMap[originalCustomer] || originalCustomer;
}

module.exports = {
    createOrUpdateItem
};