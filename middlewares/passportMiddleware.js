const passport = require('passport');
require('../strategies_passport/local-strategy'); // Ensure the strategy is loaded

// Export passport initialization
const passportMiddleware = (app) => {
    app.use(passport.initialize());
    app.use(passport.session());
};

module.exports = passportMiddleware;
