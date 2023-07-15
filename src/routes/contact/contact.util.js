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

const updateContact = (setStatement, whereClause) => {
  const sql = `UPDATE contacts SET ${setStatement} ${whereClause}`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};

const doesContactContainsNewInfo = (contacts, newContact) => {
  const contactsHavingSameEmail = contacts.filter((contact) => contact.email === newContact.email);
  const contactsHavingSamePhoneNumber = contacts.filter(
    (contact) => contact.phoneNumber === newContact.phoneNumber
  );
  return contactsHavingSameEmail.length === 0 || contactsHavingSamePhoneNumber.length === 0;
};

const shouldSwitchFromPrimaryToSecondary = (contacts, newContact) => {
  const [primaryContactWithSameEmail] = contacts.filter(
    (contact) => contact.email === newContact.email && contact.linkPrecedence === "primary"
  );
  const [primaryContactWithSamePhoneNumber] = contacts.filter(
    (contact) =>
      contact.phoneNumber === newContact.phoneNumber && contact.linkPrecedence === "primary"
  );
  if (!primaryContactWithSameEmail || !primaryContactWithSamePhoneNumber)
    return [false, null, null];
  return [
    primaryContactWithSameEmail.id !== primaryContactWithSamePhoneNumber,
    primaryContactWithSameEmail,
    primaryContactWithSamePhoneNumber,
  ];
};

const updateContactListFromPrimaryToSecondary = (contacts, id) => {
  for (let contact of contacts) {
    if (contact.id === id) {
      contact.linkPrecedence = "secondary";
      return;
    }
  }
};

module.exports = {
  createContact,
  fetchContacts,
  updateContact,
  doesContactContainsNewInfo,
  shouldSwitchFromPrimaryToSecondary,
  updateContactListFromPrimaryToSecondary,
};
