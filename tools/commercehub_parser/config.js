module.exports = {
    seleniumConfig: {
        loginUrl: 'https://account.commercehub.com/u/login',
        options: ['--no-sandbox']
    },
    credentials: {
        email: process.env.eCommerceHubEmail,
        password: process.env.eCommerceHubPassword
    }
};