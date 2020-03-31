/**
 * @fileoverview The express router for the server
 * @author Horton Cheng <horton0712@gmail.com>
 * @version 1.0.1
 */

//Dependencies and stuff
const express = require("express");
const fs = require("fs");
const path = require("path");
var security = require("./Security").create(["GET", "POST", "HEAD"], false, false);
var router = express.Router();
var { serveFile, methodNotImplemented, handleOther, logCSPReport } = require("./Common");


//Route logger and security thing
router.use((req, res, next) => {
   var reqPath = req.url.toString().split("?")[0];
   //Security
   security.setDefaultHeaders(req, res);
   var date = new Date();
   console.log("Request method: %s; Request URL: %s Request date: %s", req.method, req.url, date);
   next();
});

//Homepage
router.route("/")
   .get((req, res, next) => {
      serveFile(req, res, next, "Public/index.html", 
         "<h1>File Not Found!</h1>\n<h3>Somehow the home page isn't where it used to be</h3>");
   })
   .post((req, res, next) => methodNotImplemented(req, res, next))
   .put((req, res, next) => methodNotImplemented(req, res, next))
   .delete((req, res, next) => methodNotImplemented(req, res, next));

//Game page
router.route("/play")
   .get((req, res, next) => {
      serveFile(req, res, next, "Public/play.html", 
         "<h1>File Not Found!</h1>\n<h3>Somehow the game page isn't where it used to be</h3>");
   })
   .post((req, res, next) => methodNotImplemented(req, res, next))
   .put((req, res, next) => methodNotImplemented(req, res, next))
   .delete((req, res, next) => methodNotImplemented(req, res, next));

//About page
router.route("/about")
   .get((req, res, next) => {
      serveFile(req, res, next, "Public/about.html", 
         "<h1>File Not Found!</h1>\n<h3>Somehow the about page isn't where it used to be</h3>");
   })
   .post((req, res, next) => methodNotImplemented(req, res, next))
   .put((req, res, next) => methodNotImplemented(req, res, next))
   .delete((req, res, next) => methodNotImplemented(req, res, next));

//Version page
router.route("/version")
   .get((req, res, next) => {
      serveFile(req, res, next, "Public/version.html", 
         "<h1>File Not Found!</h1>\n<h3>Somehow the version page isn't where it used to be</h3>");
   })
   .post((req, res, next) => methodNotImplemented(req, res, next))
   .put((req, res, next) => methodNotImplemented(req, res, next))
   .delete((req, res, next) => methodNotImplemented(req, res, next));

//CSP report uri
router.route("/logs/CSP-reports.log")
   .get((req, res, next) => methodNotImplemented(req, res, next))
   .post((req, res, next) => {
      logCSPReport(req, res, next);
   })
   .put((req, res, next) => methodNotImplemented(req, res, next))
   .delete((req, res, next) => methodNotImplemented(req, res, next));

//All other routes
router.route("*")
   .get((req, res, next) => {
      handleOther(req, res, next);
   })
   .post((req, res, next) => methodNotImplemented(req, res, next))
   .put((req, res, next) => methodNotImplemented(req, res, next))
   .delete((req, res, next) => methodNotImplemented(req, res, next));
/**
 * Module exports
 */
module.exports = exports = router;
