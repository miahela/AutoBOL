require('dotenv').config();
const axios = require('axios');
const imaps = require('imap-simple');
const _ = require('lodash');
var Imap = require('node-imap');

const {
    EMAIL_USERNAME: username,
    EMAIL_TENANT_ID: tenantID,
    EMAIL_CLIENT_ID: clientID,
    EMAIL_CLIENT_SECRET: clientSecret,
    EMAIL_PORT: emailPort,
    EMAIL_HOST: emailHost,
    EMAIL_TLS: emailTls
} = process.env;

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


async function readEmails() {
    try {
        const accessToken = await getAccessToken();
        if (!accessToken) {
            console.error("Failed to retrieve access token");
            return;
        }
        console.log('Access Token:', accessToken);

        const auth2 = btoa('user=' + username + '^Aauth=Bearer ' + accessToken + '^A^A');

        var imap = new Imap({
            xoauth2: auth2,
            host: 'outlook.office365.com',
            port: 993,
            tls: true,
            debug: console.log,
            authTimeout: 25000,
            connTimeout: 30000,
            tlsOptions: {
                rejectUnauthorized: false,
                servername: 'outlook.office365.com'
            }
        });

        // const xoauth2Token = Buffer.from(`user=${username}\x01auth=Bearer ${accessToken}\x01\x01`).toString('base64');

        // const config = {
        //     imap: {
        //         user: username,
        //         xoauth2: xoauth2Token,
        //         host: emailHost,
        //         port: parseInt(emailPort, 10),
        //         tls: emailTls === 'true',
        //         authTimeout: 10000, // Increase the timeout to 10 seconds
        //         tlsOptions: {
        //             rejectUnauthorized: false
        //         }
        //     }
        // };

        function openInbox(cb) {
            imap.openBox('INBOX', true, cb);
        }

        imap.once('ready', function () {
            openInbox(function (err, box) {
                if (err) throw err;
                var f = imap.seq.fetch('1:3', {
                    bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
                    struct: true
                });
                f.on('message', function (msg, seqno) {
                    console.log('Message #%d', seqno);
                    var prefix = '(#' + seqno + ') ';
                    msg.on('body', function (stream, info) {
                        var buffer = '';
                        stream.on('data', function (chunk) {
                            buffer += chunk.toString('utf8');
                        });
                        stream.once('end', function () {
                            console.log(
                                prefix + 'Parsed header: %s',
                                inspect(Imap.parseHeader(buffer))
                            );
                        });
                    });
                    msg.once('attributes', function (attrs) {
                        console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
                    });
                    msg.once('end', function () {
                        console.log(prefix + 'Finished');
                    });
                });
                f.once('error', function (err) {
                    console.log('Fetch error: ' + err);
                });
                f.once('end', function () {
                    console.log('Done fetching all messages!');
                    imap.end();
                });
            });
        });

        imap.once('error', function (err) {
            console.log(err);
        });

        imap.once('end', function () {
            console.log('Connection ended');
        });

        imap.connect();

        // console.log('IMAP Config:', config);
        // console.log('Connecting to IMAP server...');
        // const connection = await imaps.connect(config);
        // console.log('Connected to IMAP server');

        // await connection.openBox('INBOX');

        // const searchCriteria = ['ALL'];
        // const fetchOptions = {
        //     bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'],
        //     markSeen: false
        // };

        // const messages = await connection.search(searchCriteria, fetchOptions);
        // messages.forEach(message => {
        //     const all = _.find(message.parts, {
        //         "which": "TEXT"
        //     });
        //     const html = (Buffer.from(all.body, 'base64').toString('utf8'));
        //     console.log(html);
        // });

        // await connection.end();
    } catch (error) {
        console.error('IMAP Connection Error:', error);
    }
}

readEmails();