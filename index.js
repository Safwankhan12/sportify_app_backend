const Db = require('./DatabaseConnection')
Db()
const express = require("express");
const app = express();
const passport= require('passport')
const session = require('express-session')
const MySQLStore = require('express-mysql-session')(session);
const cors = require('cors')
require('./strategies_passport/local-strategy')
const port = 5000;  // changed from 3000 to 5000 because port 3000 will run react app
const DB_CREDENTIALS = {
    host : 'localhost',
    port : '3306',
    user : 'root',
    password : '',
    database : 'sportify_app'
}

const sessionStore = new MySQLStore(DB_CREDENTIALS) // used fr storing current session


// creating middlewhere to deal with json 
app.use(express.json());
app.use(cors())

// express session middleware to deal with sessions
app.use(session({
    key: 'current_session',
    secret: "safwan_dev",
    saveUninitialized: false,
    store : sessionStore,
    resave: false,
    cookie:{
        maxAge : 60000* 60
    }
}))

 app.use(passport.initialize())
 app.use(passport.session())


//available routes
app.use('/api/auth',require('./routes/auth'))
app.use('/api/user', require('./routes/user'))

app.listen(port, () => {
 console.log(`Example app listening on port ${port}`);
});
