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

const fetchContacts = (selectColumns, whereClause, limit = "", skip = "") => {
  const sql = `SELECT ${selectColumns} FROM contacts ${whereClause} ${skip} ${limit}`;
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

const fetchContactsRecursive = async ({email, phoneNumber}) => {
   let contacts = await fetchContacts("id linkedId", `WHERE email='${email}' OR phoneNumber='${phoneNumber}'`, "LIMIT 1");
   if (contacts.length === 0) return [];
   const [contact] = contacts;
   const { id, linkedId } = contact;
   if (linkedId) {
      contacts = await fetchContacts("*", `WHERE id='${linkedId}' OR linkedId='${linkedId}'`);
   } else contacts = await fetchContacts("*", `WHERE id='${id}' OR linkedId='${id}'`);
   contacts.sort((a, b) => a.id - b.id);
   console.log("CONTACTS***************", contacts, "********************8")
   return contacts;
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
    primaryContactWithSameEmail.id !== primaryContactWithSamePhoneNumber.id,
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

const generateContactResponse = (contacts) => {
  const result = {};
  const emails = new Set();
  const phoneNumbers = new Set();
  const secondaryContactIds = new Set();
  contacts.forEach((contact) => {
    if (contact.linkPrecedence === "primary") result.primaryContatctId = contact.id;
    if (contact.email) emails.add(contact.email);
    if (contact.phoneNumber) phoneNumbers.add(contact.phoneNumber);
    if (contact.linkPrecedence === "secondary") secondaryContactIds.add(contact.id);
  });
  result.emails = Array.from(emails);
  result.phoneNumbers = Array.from(phoneNumbers);
  result.secondaryContactIds = Array.from(secondaryContactIds);
  return result;
};

const getLinkId = (contacts, newContact) => {
  const [contact] = contacts.filter(
    (contact) =>
      (contact.email === newContact.email || contact.phoneNumber === newContact.phoneNumber) &&
      contact.linkPrecedence === "primary"
  );
  return contact.id;
};

module.exports = {
  createContact,
  fetchContacts,
  updateContact,
  fetchContactsRecursive,
  doesContactContainsNewInfo,
  shouldSwitchFromPrimaryToSecondary,
  updateContactListFromPrimaryToSecondary,
  generateContactResponse,
  getLinkId,
};
