const Db = require("./DatabaseConnection");
Db(); // Initialize your database connection
const express = require("express");
const http = require('http')
const setupSocket = require('./sockets/chatSocket')
const app = express();
const server = http.createServer(app)

// initializing socket.io
setupSocket(server)
const port = 5000;




// Import middlewares
const passportMiddleware = require("./middlewares/passportMiddleware");
const corsMiddleware = require("./middlewares/corsMiddleware");
const jsonMiddleware = require("./middlewares/jsonMiddleware");

// Apply middlewares
app.use(jsonMiddleware);
app.use(corsMiddleware);
passportMiddleware(app); // Initialize passport middleware separately




// Available routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/user", require("./routes/user"));
app.use("/api/venue", require("./routes/venue"));
app.use("/api/booking", require("./routes/booking"));
app.use('/api/game', require('./routes/game'))

// Start the server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
