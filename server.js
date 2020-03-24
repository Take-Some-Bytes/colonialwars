/**
 * @fileoverview The server of this web app. Made with express.js
 * @author Horton Cheng <horton0712@gmail.com>
 * @version 0.1.0
 */

//Dependencies
const http = require("http");
const path = require("path");
const express = require("./node_modules/express");
const socketIO = require("./node_modules/socket.io");

//Variables
var PROTOCOL = "http";
var PORT = PROTOCOL === "http" ? 80 : 443;
var HOST = "localhost";

//Custom modules
const router = require("./Lib/Router");

//Initialization
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

//Server stuff
app.use("/game", express.static(path.join(__dirname, "Shared/Game/public")));
app.use("/shared", express.static(path.join(__dirname, "Shared")));
app.use("/JS", express.static(path.join(__dirname, "Public/JS")));
app.use("/", router);

server.listen(PORT, HOST, 20, () => {
   console.log(`Server started on port ${PORT}, http://${HOST}.`);
   console.log(`Protocol is: ${PROTOCOL}.`);
})