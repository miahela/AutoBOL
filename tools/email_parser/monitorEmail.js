require('dotenv').config();
const axios = require('axios');
const Imap = require('imap');
const {
    simpleParser
} = require('mailparser');

const username = process.env.EMAIL_USERNAME;
const tenantID = process.env.EMAIL_TENANT_ID;
const clientID = process.env.EMAIL_CLIENT_ID;
const clientSecret = process.env.EMAIL_CLIENT_SECRET;
const emailPort = process.env.EMAIL_PORT;
const emailHost = process.env.EMAIL_HOST;
const emailTls = process.env.EMAIL_TLS;

const tokenUrl = `https://login.microsoftonline.com/${tenantID}/oauth2/v2.0/token`;

async function getAccessToken() {
    try {
        const params = new URLSearchParams();
        params.append('client_id', clientID);
        params.append('client_secret', clientSecret);
        params.append('scope', 'https://outlook.office365.com/.default');
        params.append('grant_type', 'client_credentials');

        const response = await axios.post(tokenUrl, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Access Token Error:', error.response ? error.response.data : error.message);
        throw error;
    }
}

getAccessToken().then(accessToken => {
    const xoauth2Token = Buffer.from(`user=${username}\x01auth=Bearer ${accessToken}\x01\x01`).toString('base64');

    const imap = new Imap({
        user: username,
        xoauth2: xoauth2Token,
        host: emailHost,
        port: emailPort,
        tls: emailTls,
        tlsOptions: {
            rejectUnauthorized: false
        },
        authTimeout: 10000
    });

    imap.once('ready', function () {
        console.log("IMAP connection ready.");
        openInbox(function (err, box) {
            if (err) throw err;
        });
    });

    imap.once('error', function (err) {
        console.error('IMAP Connection Error:', err);
    });

    imap.once('end', function () {
        console.log('Connection ended');
    });

    imap.once('authenticated', function () {
        console.log('IMAP authenticated');
    });

    imap.once('close', function (hadError) {
        console.log('IMAP connection closed, hadError=', hadError);
    });

    function openInbox(cb) {
        imap.openBox('INBOX', true, cb);
    }

    console.log('Connecting to IMAP server...');
    imap.connect();
}).catch(error => {
    console.error('Failed to get access token:', error.message);
});