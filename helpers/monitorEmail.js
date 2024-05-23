// TODO: Parse email body and extract relevant information
// TODO: Connect to database and save the extracted information
// TODO: Implement a scheduler to run this script at regular intervals

const Imap = require('imap');
const {
    simpleParser
} = require('mailparser');
const {
    ClientCredentials
} = require('simple-oauth2');

const username = process.env.EMAIL_USERNAME;
const tenantID = process.env.TENANT_ID;
const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

const oauth2 = new ClientCredentials({
    client: {
        id: clientID,
        secret: clientSecret
    },
    auth: {
        tokenHost: `https://login.microsoftonline.com/${tenantID}`,
        tokenPath: '/oauth2/v2.0/token',
    }
});

oauth2.getToken({
    scope: 'https://outlook.office365.com/.default'
}).then((result) => {
    const accessToken = result.token.access_token;

    // IMAP setup with access token
    const imap = new Imap({
        user: username,
        xoauth2: accessToken,
        host: 'outlook.office365.com',
        port: 993,
        tls: true,
        tlsOptions: {
            rejectUnauthorized: false
        },
        authTimeout: 3000
    });

    function openInbox(cb) {
        imap.openBox('INBOX', true, cb);
    }

    imap.once('ready', function () {
        console.log("IMAP connection ready.");
        openInbox(function (err, box) {
            if (err) throw err;
            imap.search(['UNSEEN', ['FROM', 'WayfairOps1@wayfair.com']], function (err, results) {
                if (err) throw err;
                if (results.length === 0) {
                    console.log('No new emails found.');
                    imap.end();
                    return;
                }
                const f = imap.fetch(results, {
                    bodies: ''
                });
                f.on('message', function (msg, seqno) {
                    msg.on('body', function (stream, info) {
                        simpleParser(stream, (err, parsed) => {
                            if (err) {
                                console.error(err);
                                return;
                            }
                            const {
                                subject,
                                from,
                                date,
                                text
                            } = parsed;
                            const sender = from.text;

                            console.log('----------------------------');
                            console.log(`Subject: ${subject}`);
                            console.log(`From: ${sender}`);
                            console.log(`Date: ${date}`);
                            console.log(`Body: ${text}`);
                            console.log('----------------------------');
                        });
                    });
                });
                f.once('error', function (err) {
                    console.error('Fetch error: ' + err);
                });
                f.once('end', function () {
                    console.log('Done fetching all messages!');
                    imap.end();
                });
            });
        });
    });

    imap.once('error', function (err) {
        console.error(err);
    });

    imap.once('end', function () {
        console.log('Connection ended');
    });

    imap.connect();
}).catch((error) => {
    console.error('Access Token Error', error.message);
});