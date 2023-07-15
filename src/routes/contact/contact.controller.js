const contactUtil = require("./contact.util");

const verify = async (req, res) => {
  const { email, phoneNumber } = req.body;

  let contacts = await contactUtil.fetchContacts("*", `WHERE email='${email}' OR phoneNumber='${phoneNumber}'`);

  const onlyQueryDonotUpdate = !email || !phoneNumber;
  const isNewContact = contacts.length === 0;
  const contactHavingNewInformation = contactUtil.doesContactContainsNewInfo(contacts, { email,phoneNumber });
  const [switchPrimaryToSecondary, primaryContactWithSameEmail, primaryContactWithSamePhoneNumber] =
    contactUtil.shouldSwitchFromPrimaryToSecondary(contacts, { email, phoneNumber });
  
  if (isNewContact && !onlyQueryDonotUpdate) {
    await contactUtil.createContact({ email, phoneNumber, linkPrecedence: "primary" });
    contacts = await contactUtil.fetchContacts("*", `WHERE email='${email}' OR phoneNumber='${phoneNumber}'`);
  } else if (contactHavingNewInformation && !onlyQueryDonotUpdate) {
    const linkedId = contactUtil.getLinkId(primaryContactWithSameEmail, primaryContactWithSamePhoneNumber);
    await contactUtil.createContact({ email, phoneNumber, linkPrecedence: "secondary", linkedId });
    contacts = await contactUtil.fetchContacts("*", `WHERE email='${email}' OR phoneNumber='${phoneNumber}'`);
  } else if (switchPrimaryToSecondary && !onlyQueryDonotUpdate) {
    let contactToSwitch;
    let linkId;
    if (primaryContactWithSameEmail.createdAt > primaryContactWithSamePhoneNumber.createdAt) {
      contactToSwitch = primaryContactWithSameEmail;
      linkId = primaryContactWithSamePhoneNumber.id;
    } else {
      linkId = primaryContactWithSameEmail.id;
      contactToSwitch = primaryContactWithSamePhoneNumber;
    }
    await contactUtil.updateContact(`linkPrecedence='secondary', linkedId=${linkId}`, `WHERE id=${contactToSwitch.id}`);
    contactUtil.updateContactListFromPrimaryToSecondary(contacts, contactToSwitch.id);
  }
  return res.status(200).json({ contact: contactUtil.generateContactResponse(contacts) });
};

module.exports = {
  verify,
};
