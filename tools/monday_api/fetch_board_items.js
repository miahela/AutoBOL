require('dotenv').config();
const mondaySdk = require("monday-sdk-js");
const monday = mondaySdk();

const MONDAY_API_KEY = process.env.MONDAY_API_KEY;
const USA_BOARD_ID = process.env.USA_BOARD_ID;
const CANADA_BOARD_ID = process.env.CA_BOARD_ID;

monday.setToken(MONDAY_API_KEY);

async function getBoardItemCount(boardId) {
    const query = `query($boardId: Int!) {
        boards(ids: [$boardId]) {
            items {
                id
            }
        }
    }`;

    try {
        const response = await monday.api(query, {
            variables: {
                boardId: Number(boardId)
            }
        });
        if (response.data && response.data.boards[0] && response.data.boards[0].items) {
            const itemCount = response.data.boards[0].items.length;
            console.log(`Board ID: ${boardId} has ${itemCount} items.`);
            return itemCount;
        } else {
            console.log(`No items found for Board ID: ${boardId}`);
            return 0;
        }
    } catch (err) {
        console.error(`Error fetching items for Board ID: ${boardId}:`, err);
        return 0;
    }
}

(async () => {
    const usaBoardItemCount = await getBoardItemCount(USA_BOARD_ID);
    const canadaBoardItemCount = await getBoardItemCount(CANADA_BOARD_ID);
    console.log(`USA Board has ${usaBoardItemCount} items.`);
    console.log(`Canada Board has ${canadaBoardItemCount} items.`);
})();