const Db = require('./DatabaseConnection')
Db()
const express = require("express");
const passport= require('passport')
//import session from 'express-session';
const cors = require('cors')
const app = express();

const port = 5000;  // changed from 3000 to 5000 because port 3000 will run react app

// creating middlewhere to deal with json 
app.use(express.json());
app.use(cors())


// app.use(session({
//     secret: "safwan_dev",
//     saveUninitialized: false,
//     resave: false,
//     cookie:{
//         maxAge : 60000* 60
//     }
// }))

//  app.use(passport.initialize())
//  app.use(passport.session())


//available routes
//app.use('/api/auth', require('./routes/auth'))
app.use('/api/user', require('./routes/user'))

app.listen(port, () => {
 console.log(`Example app listening on port ${port}`);
});
