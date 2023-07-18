const route = require("express").Router();
const contactController = require("./contact.controller");

route.get("/ping", (req, res) => {
  res.status(200).json({ message: "your identity service is healthy..." });
});
route.post("/identify", contactController.verify);

module.exports = route;
