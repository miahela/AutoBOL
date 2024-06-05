// operations.js
const {
    waitForElementAndClick,
    waitForElementAndSendKeys
} = require('./helpers');
const {
    seleniumConfig,
    credentials
} = require('./config');

async function login(driver) {
    await driver.get(seleniumConfig.loginUrl);
    await waitForElementAndSendKeys(driver, 'username', credentials.email);
    await waitForElementAndSendKeys(driver, 'password', credentials.password);
    await waitForElementAndClick(driver, 'input[type="submit"]');
}

async function navigateToOrderStream(driver) {
    await waitForElementAndClick(driver, 'span > i');
    await waitForElementAndClick(driver, 'a[href*="OrderStream"]');
}

async function selectProfile(driver, profileName) {
    await waitForElementAndClick(driver, `a.linkText('${profileName}')`);
}

async function searchOrders(driver) {
    await waitForElementAndClick(driver, '#dsmMenu_mainMenu > li:first-child > span');
    await waitForElementAndClick(driver, '#dsmMenu_mainMenu > li:first-child > ol > li:nth-child(3) > a');
}

async function openOrderLinks(driver, linkXpath) {
    await waitForElementAndClick(driver, linkXpath);
}

async function setPageSize(driver) {
    await waitForElementAndClick(driver, 'select[name="pageSize"]');
    await waitForElementAndClick(driver, 'option[value="100"]');
}

async function getOrders(driver) {
    let orders = await driver.findElements(By.css('table.searchResults tr'));
    let ordersList = [];
    for (let order of orders) {
        const columns = await order.findElements(By.css('td'));
        const orderObject = {
            poNumber: await columns[0].getText(),
            merchant: await columns[1].getText(),
            status: await columns[2].getText(),
            lineCount: await columns[3].getText(),
            orderDate: await columns[4].getText()
        };
        ordersList.push(orderObject);
    }
    return ordersList;
}

exports.login = login;
exports.navigateToOrderStream = navigateToOrderStream;
exports.selectProfile = selectProfile;
exports.searchOrders = searchOrders;
exports.openOrderLinks = openOrderLinks;
exports.setPageSize = setPageSize;
exports.getOrders = getOrders;