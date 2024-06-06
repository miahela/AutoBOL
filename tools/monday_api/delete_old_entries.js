require('dotenv').config();
const mondaySdk = require("monday-sdk-js");
const monday = mondaySdk();

const MONDAY_API_KEY = process.env.MONDAY_API_KEY;
const USA_BOARD_ID = process.env.USA_BOARD_ID;
const CANADA_BOARD_ID = process.env.CA_BOARD_ID;

monday.setToken(MONDAY_API_KEY);

async function deleteAllItems(boardId) {
    let items = [];
    let hasMoreItems = true;

    try {
        while (hasMoreItems) {
            const query = `query($boardId: ID!, $limit: Int) {
                boards(ids: [$boardId]) {
                    items_page(limit: $limit) {
                        items {
                            id
                            name
                        }
                    }
                }
            }`;

            const variables = {
                boardId: boardId,
                limit: 100,
            };
            const res = await monday.api(query, {
                variables
            });

            console.log("Response:", res); // Debugging response

            if (res.data && res.data.boards.length > 0) {
                items = res.data.boards[0].items_page.items;
                for (let item of items) {
                    await deleteItem(item.id);
                }
                hasMoreItems = items.length === 25;
            } else {
                console.log(`No items found on board ${boardId}`);
                hasMoreItems = false;
            }
        }
    } catch (err) {
        console.error(`Error fetching items from board ${boardId}:`, err);
    }
}

async function deleteItem(itemId) {
    try {
        const query = `mutation($itemId: ID!) {
            delete_item(item_id: $itemId) {
                id
            }
        }`;

        const variables = {
            itemId: itemId
        };
        const res = await monday.api(query, {
            variables
        });

        if (res.data && res.data.delete_item) {
            console.log(`Item ${itemId} deleted successfully`);
        } else {
            console.log(`Failed to delete item ${itemId}`);
        }
    } catch (err) {
        console.error(`Error deleting item ${itemId}:`, err);
    }
}

async function deleteAllItemsOnBoards() {
    console.log('Deleting items from USA board...');
    await deleteAllItems(USA_BOARD_ID);
    console.log('Deleting items from Canada board...');
    await deleteAllItems(CANADA_BOARD_ID);
}

deleteAllItemsOnBoards();