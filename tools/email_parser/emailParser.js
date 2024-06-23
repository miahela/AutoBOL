const cheerio = require('cheerio');
const file = require('fs');

function parseEmailContent(html) {
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
        return {
            poNumber,
            qty,
            sku,
            customerName,
            mustShipDate,
            province,
            zipCode
        };
    } catch (error) {
        console.log("This email does not contain the required information");
        console.log(error);
    }
    return {
        poNumber: '',
        qty: '',
        sku: '',
        customerName: '',
        province: '',
        zipCode: ''
    };
}

const html = file.readFileSync('email.html', 'utf8');
const emailData = parseEmailContent(html);
console.log(emailData);