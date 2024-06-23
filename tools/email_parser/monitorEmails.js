require('dotenv').config();
const graphHelper = require('./graphHelper');
const simpleParser = require('mailparser').simpleParser;
const {
    saveOrderToDatabase
} = require('../../utils/dbOperations');
const cheerio = require('cheerio');

const {
    GRAPH_QL_CLEINT_ID: graphQLClientID,
} = process.env;

const graphQLSettings = {
    'clientId': graphQLClientID,
    'tenantId': 'common',
    'graphUserScopes': [
        'user.read',
        'mail.read',
    ]
};

function parseEmailContent(html, poDate) {
    const $ = cheerio.load(html, {
        xmlMode: true
    });
    try {
        const poNumber = $('h5:contains("PO Number")').parentsUntil('table').children('tr').last().find('td').first().find("h5").text().trim()
        const qty = $('h5:contains("Qty")').parentsUntil('table').children('tr').last().find('td').first().find("h5").text().trim()
        const sku = $('h5:contains("Item Code")').parentsUntil('table').children('tr').last().find('td').first().next().find("h5").first().text().trim()
        const customerName = $('h5:contains("Customer")').parentsUntil('table').children('tr').last().find('td').last().find("h5").first().next().next().text().trim()
        const mustShipDate = $('h5:contains("PO Number")').parentsUntil('table').children('tr').last().find('td').eq(2).find("h5").text().trim()
        const provinceAndZipCode = $('h5:contains("Customer")').parentsUntil('table').children('tr').last().find('td').last().find("h5").first().next().next().next().next().next().next().text().trim().split(",")[1].trim();
        const province = provinceAndZipCode.split(" ")[0];
        const zipCode = provinceAndZipCode.substring(provinceAndZipCode.indexOf(' ') + 1)
        const orderObject = {
            'PO NUMBER': poNumber,
            'MERCHANT': 'Wayfair-Canada',
            'STATUS': 'Open',
            'QTY': qty,
            'ORDER DATE': poDate,
            'MUST SHIP DATE': mustShipDate,
            'VENDOR SKU': sku,
            'PROVINCE': province,
            'CUSTOMER NAME': customerName,
            'PROFILE': '3',
            'ADDRESS': zipCode
        };
        // TODO: Fix the address parsing
        return orderObject;
    } catch (error) {
        console.log(error);
    }
    return null;
}

async function listInboxAsync() {
    try {
        const messagePage = await graphHelper.getInboxAsync();
        const messages = messagePage.value;

        for (const message of messages) {
            console.log('-----------------------------------');
            console.log(`Message: ${message.subject ?? 'NO SUBJECT'}`);
            console.log(`  ID: ${message.from?.emailAddress?.address ?? 'UNKNOWN'}`);
            console.log(`  From: ${message.from?.emailAddress?.name ?? 'UNKNOWN'}`);
            let status = message.isRead ? 'Read' : 'Unread';
            let poDate = message.receivedDateTime;

            const mimeMessage = await graphHelper.getMimeContentOfMessageAsync(message.id);
            const parsed = await simpleParser(mimeMessage);
            const emailContent = parsed.html || parsed.text;

            const emailData = parseEmailContent(emailContent, poDate);
            if (emailData != null) {
                saveOrderToDatabase(emailData);
            } else {
                console.log("This email does not contain the required information");
            }
        }

        const moreAvailable = messagePage['@odata.nextLink'] != undefined;
        console.log(`\nMore messages available? ${moreAvailable}`);
    } catch (err) {
        console.log(`Error getting user's inbox: ${err}`);
    }
}

function initializeGraph(settings) {
    graphHelper.initializeGraphForUserAuth(settings, (info) => {
        console.log(info.message);
    });
}

async function main() {
    initializeGraph(graphQLSettings);
    await listInboxAsync();
}

main();