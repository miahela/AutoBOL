// helpers.js
const {
    By,
    until
} = require('selenium-webdriver');

async function waitForElementAndClick(driver, locator, timeout = 2000) {
    const element = await driver.wait(until.elementIsVisible(By.css(locator)), timeout);
    await element.click();
}

async function waitForElementAndSendKeys(driver, locator, keys, timeout = 2000) {
    const element = await driver.wait(until.elementIsVisible(By.name(locator)), timeout);
    await element.sendKeys(keys);
}

exports.waitForElementAndClick = waitForElementAndClick;
exports.waitForElementAndSendKeys = waitForElementAndSendKeys;