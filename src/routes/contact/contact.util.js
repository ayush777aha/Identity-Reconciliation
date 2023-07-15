const db = require("../../connection/db");

const createContact = (values) => {
  const sql = "INSERT INTO contacts SET ?";
  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  });
};

const fetchContacts = (selectColumns, whereClause) => {
  const sql = `SELECT ${selectColumns} FROM contacts ${whereClause}`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  });
};

const doesContactContainsNewInfo = (contacts, contact) => {
  const contactsHavingSameEmail = contacts.filter((contact) => contact.email === contact.email);
  const contactsHavingSamePhoneNumber = contacts.filter(
    (contact) => contact.phoneNumber === contact.phoneNumber
  );
  return contactsHavingSameEmail.length === 0 || contactsHavingSamePhoneNumber.length === 0;
};

module.exports = {
  createContact,
  fetchContacts,
};
