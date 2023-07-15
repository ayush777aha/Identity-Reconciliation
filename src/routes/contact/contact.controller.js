const contactUtil = require("./contact.util");

const verify = async (req, res) => {
  const { email, phoneNumber } = req.body;

  let contacts = await contactUtil.fetchContactsRecursive({ email, phoneNumber });

  const onlyQueryDonotUpdate = !email || !phoneNumber;
  const isNewContact = contacts.length === 0;
  const contactHavingNewInformation = contactUtil.doesContactContainsNewInfo(contacts, { email,phoneNumber });
  const [switchPrimaryToSecondary, primaryContactWithSameEmail, primaryContactWithSamePhoneNumber] =
    contactUtil.shouldSwitchFromPrimaryToSecondary(contacts, { email, phoneNumber });
  
  if (isNewContact && !onlyQueryDonotUpdate) {
    await contactUtil.createContact({ email, phoneNumber, linkPrecedence: "primary" });
    contacts = await contactUtil.fetchContactsRecursive({ email, phoneNumber });
  } else if (contactHavingNewInformation && !onlyQueryDonotUpdate) {
    const linkedId = contactUtil.getLinkId(contacts, { email, phoneNumber });
    await contactUtil.createContact({ email, phoneNumber, linkPrecedence: "secondary", linkedId });
    contacts = await contactUtil.fetchContactsRecursive({ email, phoneNumber });
  } else if (switchPrimaryToSecondary && !onlyQueryDonotUpdate) {
    let contactToSwitch, linkId;
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
