const Db = require('./DatabaseConnection')
Db()
const express = require("express");
const cors = require('cors')
const app = express();

const port = 5000;  // changed from 3000 to 5000 because port 3000 will run react app

// creating middlewhere to deal with json 
app.use(express.json());
app.use(cors())

//available routes

app.listen(port, () => {
 console.log(`Example app listening on port ${port}`);
});
