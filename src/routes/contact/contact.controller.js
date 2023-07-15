const contactUtil = require("./contact.util");

const verify = async (req, res) => {
  const { email, phoneNumber } = req.body;
  const [contactsWithGivenEmail, contactsWithGivenPhoneNumber] = await Promise.all([
    contactUtil.fetchContacts("*", `WHERE email='${email}'`),
    contactUtil.fetchContacts("*", `WHERE phoneNumber='${phoneNumber}'`),
  ]);

  const contactHavingNewInformation = contactUtil.doesContactContainsNewInfo(
    [...contactsWithGivenEmail, ...contactsWithGivenPhoneNumber],
    { email, phoneNumber }
  );
  // new contact
  if (contactsWithGivenEmail.length == 0 && contactsWithGivenPhoneNumber.length == 0) {
    await contactUtil.createContact({ email, phoneNumber, linkPrecedence: "primary" });
  } else if (contactHavingNewInformation) {
    await contactUtil.createContact({ email, phoneNumber, linkPrecedence: "secondary" });
  }
  return res.json({ ok: "ok" });
};

module.exports = {
  verify,
};
