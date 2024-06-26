const {
    By
} = require('selenium-webdriver');
const dotenv = require('dotenv');
const SeleniumManager = require('../../utils/seleniumManager');
const {
    saveOrderToDatabase
} = require('../../utils/dbOperations');
const {
    writeToJsonFile
} = require('../../utils/jsonManager');

dotenv.config();

const EMAIL = process.env.eCommerceHubEmail;
const PASSWORD = process.env.eCommerceHubPassword;

let totalOrders = 0;
let orders = [];

async function login(manager) {
    await manager.open('https://account.commercehub.com/u/login/identifier?state=hKFo2SBKSjkwZldtMVMtQUtzN1BpemtvSXp2LWllbFlnUmlJd6Fur3VuaXZlcnNhbC1sb2dpbqN0aWTZIDBFR2JacVJ2b3V0SjhCVTdPNmthbUMyOHVKNVdsajM2o2NpZNkgTjZ3QnJKMXV3WEtSMU1tMFJ0RlgxSlhONklQNm5oYmw');
    await manager.sendKeys(By.name('username'), EMAIL);
    await manager.click(By.name('action'));
    await manager.findElement(By.name('password'));
    await manager.sendKeys(By.name('password'), PASSWORD);
    await manager.click(By.name('action'));
}

async function navigateToOrderStream(manager) {
    await manager.click(By.css('span > i'));
    await manager.click(By.linkText('OrderStream'));
}

async function navigateToOpenOrders(manager) {
    await manager.open('https://dsm.commercehub.com/dsm/gotoOrderSearch.do')
    await manager.click(By.xpath("//*[text()='Open Orders']"));
}

async function setPageSize(manager) {
    await manager.click(By.name('pageSize'));
    try {
        await manager.click(By.xpath('//option[@value=\'100\']'));
    } catch (error) {
        console.error('Error setting page size to 100', error.message);
    }
}

async function parseProvince(addressText) {
    if (addressText) {
        const lines = addressText.split('\n');
        if (lines.length >= 3) {
            let stateLine = lines[2];
            let stateCodeMatch = stateLine.match(/,\s*([A-Z]{2})\s/);
            if (stateCodeMatch) {
                let stateCode = stateCodeMatch[1];
                console.log('State Code:', stateCode);
                return stateCode;
            } else {
                stateLine = lines[3];
                stateCodeMatch = stateLine.match(/,\s*([A-Z]{2})\s/);
                if (stateCodeMatch) {
                    let stateCode = stateCodeMatch[1];
                    return stateCode;
                } else {
                    console.log('State code not found');
                }
            }
        } else {
            console.log('Address format is not as expected');
        }
    }
}

function parseFullAddress(addressText) {
    if (!addressText) {
        return '';
    }

    const lines = addressText.split('\n').filter(line => line.trim() !== '');
    let address = {};

    address.name = lines[0]?.trim() || '';
    address.street = lines[1]?.trim() || '';
    address.unit = lines[2]?.trim() || '';

    const cityStateZip = lines[3]?.split(',') || [];
    address.city = cityStateZip[0]?.trim() || '';
    const stateZip = cityStateZip[1]?.trim().split(' ') || [];
    address.state = stateZip[0]?.trim() || '';
    address.zip = stateZip[1]?.trim() || '';

    address.country = lines[4]?.trim() || '';
    address.phone = lines.find(line => line.startsWith('Daytime Phone:'))?.replace('Daytime Phone: ', '').trim() || '';
    address.email = lines.find(line => line.startsWith('Email:'))?.replace('Email: ', '').trim() || '';

    return `${address.street}, ${address.unit}, ${address.city}, ${address.state}`;
}


async function getCustomerName(manager) {
    let content = await manager.getText(By.xpath("(//div[@class='fw_widget_windowtag_body'])[3]"));
    if (!content) {
        content = await manager.getText(By.xpath("(//div[@class='fw_widget_windowtag_body'])[4]"));
    }
    const lines = content.split('\n');
    const customerName = lines[0].trim();
    return customerName || '';
}

async function getOrdersData(manager, profile) {
    let merchantRows = await getTableElements(manager);
    for (let i = 0; i < merchantRows.length; i++) {
        merchantRows = await getTableElements(manager);
        let merchantRow = merchantRows[i];
        // await merchantRow.click();
        let tdElement = await merchantRow.findElement(By.css("td.characterdata.shipmentInformationColumn"));
        await tdElement.click(); // Click on the <td> element
        let item = await manager.getText(By.xpath("//tr[contains(@id, '.poNumber')]/td[contains(@id, '.poNumber')][2]"));
        let customer = await manager.getText(By.xpath("//tr[contains(@id, '.merchantName')]/td[contains(@id, '.merchantName')][2]"));
        let poDate = await manager.getText(By.xpath("//tr[contains(@id, '.orderDate')]/td[contains(@id, '.orderDate')][2]"));
        let mustShipDate = await manager.getText(By.xpath("//tr/td[contains(@id, '.expectedShipDate')]"));
        let vendorSku = await manager.getText(By.xpath("//tr/td[contains(@id, '.vendorSku')]"));
        const addressText = await manager.getText(By.xpath("(//div[@class='fw_widget_windowtag_body'])[4]"));
        let fullAddress = await parseFullAddress(addressText);
        let province = await parseProvince(addressText);
        let customerName = (await getCustomerName(manager)).toUpperCase();
        let qty = await manager.getText(By.xpath("//tr/td[contains(@id, '.qty')]"));
        const orderObject = {
            'PO NUMBER': item,
            'MERCHANT': customer,
            'STATUS': 'Open',
            'QTY': qty,
            'ORDER DATE': poDate,
            'MUST SHIP DATE': mustShipDate,
            'VENDOR SKU': vendorSku,
            'PROVINCE': province,
            'CUSTOMER NAME': customerName,
            'PROFILE': profile,
            'ADDRESS': fullAddress
        };
        await saveOrderToDatabase(orderObject);
        manager.goBack();
        totalOrders++;
        if (merchantRows.length - 1 === i) {
            console.log('Last order');
            break;
        }
    }
}

async function switchProfile(manager) {
    await manager.open("https://auth.commercehub.com/user/switch-account?applicationId=prod_orderstream&applicationUrl=https:%2F%2Fdsm.commercehub.com%2Fdsm%2FhandleLogin.do&applicationLabel=OrderStream");
    await manager.click(By.linkText('Pacific Coast Import Inc - (Ronalyn USA)'));
    await navigateToOpenOrders(manager);
}

async function getTableElements(manager) {
    return await manager.findElements(By.xpath("//table[@class='searchresults']//tr[position() > 1]"));
}

async function operateMerchants(manager, state) {
    let merchantRows = await getTableElements(manager);
    for (let i = 0; i < merchantRows.length; i++) {
        merchantRows = await getTableElements(manager);
        let merchantRow = merchantRows[i];
        await merchantRow.click();
        if (i === 0) {
            await setPageSize(manager);
        }
        await getOrdersData(manager, state);
        await manager.click(By.xpath("//a[contains(@href, 'gotoNextGroupingLevel.do?level=0')]"));
    }
}

(async function eCommerceHub() {
    const manager = new SeleniumManager();

    try {
        await login(manager);
        await navigateToOrderStream(manager);
        await manager.click(By.linkText('Pacific Coast Import Inc - (Ronalyn Canada)'));
        await manager.click(By.xpath("//div[@id=\'border-124a2021-6e13-090e-eca6-7c04cf9290a2\']"));
        await navigateToOpenOrders(manager);
        await operateMerchants(manager, "1");
        await switchProfile(manager);
        await operateMerchants(manager, "2");
    } finally {
        console.log('Total Orders:', totalOrders);
        await manager.close();
    }
})();