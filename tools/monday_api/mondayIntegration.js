require('dotenv').config();

const mondaySdk = require("monday-sdk-js");
const monday = mondaySdk();

MONDAY_API_KEY = process.env.MONDAY_API_KEY
USA_BOARD_ID = process.env.USA_BOARD_ID
CA_BOARD_ID = process.env.CA_BOARD_ID

monday.setToken(MONDAY_API_KEY);


const variables = {
    boardId: String(USA_BOARD_ID),
    groupId: 'po',
    itemName: 'New Order Entry',
    columnValues: JSON.stringify({
        date4: {
            "date": "2024-05-28"
        },
        text: "524600014",
        "customer": {
            "labels": ["HomeDepotCanada-USA"]
        }
    })
};

const createItemQuery = `mutation($boardId: ID!, $groupId: String!, $itemName: String!, $columnValues: JSON!) {
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



monday.api(createItemQuery, {
    variables
}).then(res => {
    console.log('Full API Response:', JSON.stringify(res, null, 2));
    if (res.data && res.data.create_item) {
        console.log('Item Created:', res.data.create_item);
    } else {
        console.log('No item data returned or unexpected response structure:', res);
    }
}).catch(err => {
    console.error('Error making API call:', err);
});