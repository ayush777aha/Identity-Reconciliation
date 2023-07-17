const mysql = require("mysql");

const db = mysql.createConnection({
  host: "bnbafgtau4elnno7mwdo-mysql.services.clever-cloud.com",
  user: "ucxl3rzkciamzcod",
  password: "roRN3G3eGBi0G3LHQ44O",
  database: "bnbafgtau4elnno7mwdo",
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("MySql connected...");
});

module.exports = db;
