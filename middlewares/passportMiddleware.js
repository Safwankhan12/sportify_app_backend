const passport = require('passport');
require('../strategies_passport/passport-jwt-strategy'); // Ensure the strategy is loaded

// Export passport initialization
const passportMiddleware = (app) => {
    app.use(passport.initialize());
};

module.exports = passportMiddleware;
