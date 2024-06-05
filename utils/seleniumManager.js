const {
    Builder,
    By,
    until
} = require('selenium-webdriver');
const {
    createLogger,
    format,
    transports
} = require('winston');

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.printf(({
            timestamp,
            level,
            message
        }) => {
            return `${timestamp} [${level}]: ${message}`;
        })
    ),
    transports: [
        new transports.Console(),
        new transports.File({
            filename: 'selenium.log'
        })
    ]
});

class SeleniumManager {
    constructor() {
        this.driver = new Builder().forBrowser('chrome').build();
    }

    async open(url) {
        try {
            await this.driver.get(url);
            logger.info(`Opened URL: ${url}`);
        } catch (error) {
            logger.error(`Error opening URL: ${url}, ${error.message}`);
        }
    }

    async findElement(locator) {
        try {
            const element = await this.driver.wait(until.elementLocated(locator), 50000);
            return element;
        } catch (error) {
            logger.error(`Error finding element: ${locator}, ${error.message}`);
        }
    }

    async findElements(locator) {
        try {
            const elements = await this.driver.wait(until.elementsLocated(locator), 50000);
            return elements;
        } catch (error) {
            logger.error(`Error finding elements: ${locator}, ${error.message}`);
        }
    }

    async getText(locator) {
        try {
            const element = await this.findElement(locator);
            const text = await element.getText();
            logger.info(`Got text: ${text}`);
            return text;
        } catch (error) {
            logger.error(`Error getting text: ${locator}, ${error.message}`);
        }
    }

    async click(locator) {
        try {
            const element = await this.findElement(locator);

            await this.driver.executeScript("arguments[0].scrollIntoView(true);", element);

            try {
                await element.click();
            } catch (clickError) {
                console.log(clickError.message);
                await this.driver.executeScript("const el = arguments[0]; setTimeout(() => el.click(), 500);", element);
                console.log('Clicked element after timeout');
            }

            logger.info(`Clicked element: ${locator}`);
        } catch (error) {
            logger.error(`Error clicking element: ${locator}, ${error.message}`);
        }
    }

    async sendKeys(locator, keys) {
        try {
            const element = await this.findElement(locator);
            await element.sendKeys(keys);
            logger.info(`Sent keys to element: ${locator}`);
        } catch (error) {
            logger.error(`Error sending keys to element: ${locator}, ${error.message}`);
        }
    }

    async goBack() {
        try {
            await this.driver.navigate().back();
            logger.info('Navigated back');
        } catch (error) {
            logger.error(`Error navigating back: ${error.message}`);
        }
    }

    async close() {
        try {
            await this.driver.quit();
            logger.info('Browser closed');
        } catch (error) {
            logger.error(`Error closing browser: ${error.message}`);
        }
    }
}

module.exports = SeleniumManager;