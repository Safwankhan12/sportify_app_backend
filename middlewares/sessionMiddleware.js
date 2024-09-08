const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

// MySQL session store configuration
const DB_CREDENTIALS = {
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '',
    database: 'sportify_app'
};

const sessionStore = new MySQLStore(DB_CREDENTIALS); // MySQL session store

// Export session middleware
const sessionMiddleware = session({
    key: 'current_session',
    secret: "safwan_dev",
    saveUninitialized: false,
    store: sessionStore,
    resave: false,
    cookie: {
        maxAge: 60000 * 60 // 1 hour
    }
});

module.exports = sessionMiddleware;
