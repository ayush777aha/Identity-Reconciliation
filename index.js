require("dotenv").config();
const express = require("express");
require("./src/connection/db");
const contactRoute = require("./src/routes/contact/contact.route");

const app = express();
const PORT = process.env.PORT || 8081;

app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

app.use("/", contactRoute);
