const route = require("express").Router();
const contactController = require("./contact.controller");

route.post("/identify", contactController.verify);

module.exports = route;
