const Db = require("./DatabaseConnection");
Db(); // Initialize your database connection
const express = require("express");
const { Server } = require('socket.io');
const http = require('http')
const setupSocket = require('./sockets/chatSocket')
const setupGameSocket = require('./sockets/gameSocket')
const app = express();
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: "*" } });

//Imporing cron jobs
const reduceActivityPoints = require('./cron-jobs/reduceActivityPoints')
const checkBadgeEligibility = require('./cron-jobs/checkBadgeEligibility')
require('./cron-jobs/updateLeaderboard')
reduceActivityPoints()
checkBadgeEligibility()

// initializing socket.io
setupSocket(io)
setupGameSocket(io)
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
app.use('/api/chat', require('./routes/chat'))
app.use('/api/badge', require('./routes/badge'))

// Start the server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
