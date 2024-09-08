const Db = require('./DatabaseConnection');
Db(); // Initialize your database connection
const express = require("express");
const app = express();
const port = 5000; // React app will use port 3000

// Import middlewares
const sessionMiddleware = require('./middlewares/sessionMiddleware');
const passportMiddleware = require('./middlewares/passportMiddleware');
const corsMiddleware = require('./middlewares/corsMiddleware');
const jsonMiddleware = require('./middlewares/jsonMiddleware');

// Apply middlewares
app.use(jsonMiddleware);
app.use(corsMiddleware);
app.use(sessionMiddleware);
passportMiddleware(app); // Initialize passport middleware separately

// Available routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
