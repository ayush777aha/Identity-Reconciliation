const contactUtil = require("./contact.util");

const verify = async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;

    let contacts = await contactUtil.fetchContactsRecursive({ email, phoneNumber });

    const onlyQueryDonotUpdate = !email || !phoneNumber;
    const isNewContact = contacts.length === 0;
    const contactHavingNewInformation = contactUtil.doesContactContainsNewInfo(contacts, {
      email,
      phoneNumber,
    });
    const [
      switchPrimaryToSecondary,
      primaryContactWithSameEmail,
      primaryContactWithSamePhoneNumber,
    ] = await contactUtil.shouldSwitchFromPrimaryToSecondary({ email, phoneNumber });

    if (isNewContact && !onlyQueryDonotUpdate) {
      await contactUtil.createContact({ email, phoneNumber, linkPrecedence: "primary" });
    } else if (contactHavingNewInformation && !switchPrimaryToSecondary && !onlyQueryDonotUpdate) {
      const linkedId = contactUtil.getLinkId(contacts, { email, phoneNumber });
      await contactUtil.createContact({
        email,
        phoneNumber,
        linkPrecedence: "secondary",
        linkedId,
      });
    } else if (switchPrimaryToSecondary && !onlyQueryDonotUpdate) {
      let contactToSwitch, linkId;
      if (primaryContactWithSameEmail.createdAt > primaryContactWithSamePhoneNumber.createdAt) {
        contactToSwitch = primaryContactWithSameEmail;
        linkId = primaryContactWithSamePhoneNumber.id;
      } else {
        linkId = primaryContactWithSameEmail.id;
        contactToSwitch = primaryContactWithSamePhoneNumber;
      }
      await Promise.all([
        contactUtil.updateContact(
          `linkPrecedence='secondary', linkedId=${linkId}`,
          `WHERE id=${contactToSwitch.id}`
        ),
        contactUtil.updateContact(
          `linkedId=${linkId}`,
          `WHERE linkedId=${contactToSwitch.id} AND linkPrecedence='secondary'`
        ),
      ]);
    }
    contacts = await contactUtil.fetchContactsRecursive({ email, phoneNumber });
    return res.status(200).json({ contact: contactUtil.generateContactResponse(contacts) });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error", error: err });
  }
};

module.exports = {
  verify,
};
