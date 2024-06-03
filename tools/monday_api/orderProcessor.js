const {
    readFromJsonFile
} = require('../../utils/jsonManager');

const {
    createOrUpdateItem
} = require('./itemManager');


function processOrders(filePath) {
    const data = readFromJsonFile(filePath);
    const orders = JSON.parse(data);
    orders.entries.forEach(entry => {
        createOrUpdateItem(entry);
    });
}

module.exports = {
    processOrders
};