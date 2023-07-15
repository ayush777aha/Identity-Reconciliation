const contactUtil = require("./contact.util");

const verify = async (req, res) => {
  const { email, phoneNumber } = req.body;

  const contacts = await contactUtil.fetchContacts("*", `WHERE email='${email}' OR phoneNumber='${phoneNumber}'`);

  const isNewContact = contacts.length == 0;
  const contactHavingNewInformation = contactUtil.doesContactContainsNewInfo(contacts, { email,phoneNumber });
  const [switchPrimaryToSecondary, primaryContactWithSameEmail, primaryContactWithSamePhoneNumber] =
    contactUtil.shouldSwitchFromPrimaryToSecondary(contacts, { email, phoneNumber });

  if (isNewContact) {
    const result = await contactUtil.createContact({ email, phoneNumber, linkPrecedence: "primary" });
    contacts.push(result);
  } else if (contactHavingNewInformation) {
    const result = await contactUtil.createContact({ email, phoneNumber, linkPrecedence: "secondary" });
    contacts.push(result);
  } else if (switchPrimaryToSecondary) {
    let contactToSwitch;
    if (primaryContactWithSameEmail.createdAt > primaryContactWithSamePhoneNumber.createdAt) {
      contactToSwitch = primaryContactWithSameEmail;
    } else {
      contactToSwitch = primaryContactWithSamePhoneNumber;
    }
    await contactUtil.updateContact(`linkPrecedence='secondary'`, `WHERE id=${contactToSwitch.id}`);
    contactUtil.updateContactListFromPrimaryToSecondary(contacts, contactToSwitch.id);
  }
  return res.json({ ok: "ok" });
};

module.exports = {
  verify,
};
