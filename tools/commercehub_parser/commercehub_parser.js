const {
    Builder,
    By,
    until
} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function login(driver) {
    let email = 'support2@streamlinebath.com';
    let password = 'Pacific2024!';
    await driver.get('https://account.commercehub.com/u/login');
    await driver.findElement(By.name('username')).sendKeys(email);
    await driver.findElement(By.name('action')).click();
    await driver.wait(until.elementLocated(By.name('password')), 2000);
    await driver.findElement(By.name('password')).sendKeys(password);
    await driver.findElement(By.name('action')).click();
}

async function navigateToOrderStream(driver) {
    await driver.wait(until.elementLocated(By.css('span > i')), 10000).click();
    await driver.wait(until.elementLocated(By.linkText('OrderStream')), 2000).click();
}

async function selectRonalynCanada(driver) {
    await driver.wait(until.elementLocated(By.linkText('Pacific Coast Import Inc - (Ronalyn Canada)')), 4000).click();
    await driver.sleep(2000);
    await driver.findElement(By.xpath('//div[@id=\'border-124a2021-6e13-090e-eca6-7c04cf9290a2\']')).click();
    await driver.sleep(2000);
}

async function searchOrders(driver) {
    await driver.sleep(2000);
    await driver.findElement(By.xpath('//*[@id="dsmMenu_mainMenu"]/li[1]/span')).click();
    await driver.sleep(2000);
    await driver.findElement(By.xpath('//*[@id="dsmMenu_mainMenu"]/li[1]/ol/li[3]/a')).click();
    await driver.sleep(2000);
}

async function openOrderLinks(driver) {
    await driver.wait(until.elementLocated(By.xpath('//*[@id="pageParent"]/tbody/tr[6]/td/table/tbody/tr[2]/td/table[2]/tbody/tr[2]/td/table/tbody/tr[4]/td[1]/a')), 2000).click();
}

async function selectHomeDepotCanada(driver) {
    await driver.wait(until.elementLocated(By.css('#pageParent td.characterdata')), 2000).click();
}

async function setPageSize(driver) {
    await driver.wait(until.elementLocated(By.name('pageSize')), 2000).click();
    await driver.wait(until.elementLocated(By.xpath('//option[@value=\'100\']')), 2000).click();
}

async function getOrders(driver) {
    let ordersCanada = await driver.findElements(By.css('table.searchResults'));
    let ordersList = [];
    for (let order of ordersCanada) {
        ordersList.push(await order.getText());
    }
    console.log(ordersList);
}

async function switchProfile(driver) {
    await driver.wait(until.elementLocated(By.xpath('//a[@class=\'switch-profile\']')), 2000).click();
}

async function selectRonalynUSA(driver) {
    await driver.sleep(5000);
    await driver.wait(until.elementLocated(By.linkText('Pacific Coast Import Inc - (Ronalyn USA)')), 10000).click();
    await driver.sleep(5000);
}

async function openOrderLinksUsa(driver) {
    await driver.wait(until.elementLocated(By.xpath('//*[@id="pageParent"]/tbody/tr[6]/td/table/tbody/tr[2]/td/table[2]/tbody/tr[2]/td/table/tbody/tr[6]/td[1]/a')), 2000).click();
}

async function selectLowes(driver) {
    await driver.wait(until.elementLocated(By.xpath('//*[@id="pageParent"]/tbody/tr[6]/td/table/tbody/tr[3]/td/table/tbody/tr[2]/td/table/tbody/tr[2]')), 4000).click();
}

async function getOrdersUSALowes(driver) {
    let ordersUSALowes = await driver.findElements(By.css('table.searchResults'));
    let ordersListUSALowes = [];
    for (let order of ordersUSALowes) {
        ordersListUSALowes.push(await order.getText());
    }
    console.log(ordersListUSALowes);
}

async function getBack(driver) {
    await driver.wait(until.elementLocated(By.xpath('//*[@id="pageParent"]/tbody/tr[4]/td/table/tbody/tr/td[1]/a[2]')), 2000).click();
}

async function selectRona(driver) {
    await driver.wait(until.elementLocated(By.xpath('//*[@id="pageParent"]/tbody/tr[6]/td/table/tbody/tr[3]/td/table/tbody/tr[2]/td/table/tbody/tr[3]')), 2000).click();
}

async function getOrdersUSARona(driver) {
    let ordersUSARona = await driver.findElements(By.css('table.searchResults'));
    let ordersListUSARona = [];
    for (let order of ordersUSARona) {
        ordersListUSARona.push(await order.getText());
    }
    console.log(ordersListUSARona);
}

async function selectHomeDepotINC(driver) {
    await driver.wait(until.elementLocated(By.xpath('//*[@id="pageParent"]/tbody/tr[6]/td/table/tbody/tr[3]/td/table/tbody/tr[2]/td/table/tbody/tr[4]')), 2000).click();
}

async function getOrdersUSAHDINC(driver) {
    let ordersUSAHDINC = await driver.findElements(By.css('table.searchResults')); 
    let ordersListHDINC = [];
    for (let order of ordersUSAHDINC) {
        ordersListHDINC.push(await order.getText());
    }
    console.log(ordersListHDINC);
}

(async function eCommerceHub() {
    let driver = await new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options().addArguments('--no-sandbox')).build();
    try {
        await login(driver);
        await navigateToOrderStream(driver);
        await selectRonalynCanada(driver);
        await searchOrders(driver);
        await openOrderLinks(driver);
        await selectHomeDepotCanada(driver);
        await setPageSize(driver);
        await getOrders(driver);
        await switchProfile(driver);
        await selectRonalynUSA(driver);
        await searchOrders(driver);
        await openOrderLinksUsa(driver);
        await selectLowes(driver);
        await setPageSize(driver);
        await getOrdersUSALowes(driver);
        await getBack(driver);
        await selectRona(driver);
        await setPageSize(driver);
        await getOrdersUSARona(driver);
        await getBack(driver);
        await selectHomeDepotINC(driver);
        await setPageSize(driver);
        await getOrdersUSAHDINC(driver);
    } finally {
        await driver.quit();
    }
})();