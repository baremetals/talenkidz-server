// const utils = require("@strapi/utils");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.EMAIL_API_KEY);
const {
  admin,
  db,
  firebase,
  defaultAuth,
} = require("./index");

// const { ApplicationError, ValidationError } = utils.errors;

async function createNotification(notice, to, template, emailMsg) {
  try {
    const currentYear = new Date().getFullYear();
    await db.collection("notifications").add({
        ...notice,
      read: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await sgMail.send({
      to,
      from: "Talentkids.io <noreply@talentkids.io>",
      template_id: template,
      dynamic_template_data: {
        hideWarnings: process.env.NODE_ENV !== "production" ? true : false,
        year: currentYear,
        siteUrl: process.env.FRONT_END_HOST,
        ...emailMsg
      },
    });
  } catch (e) {
    return e;
  }
}

async function createMessageNotification(notice) {
  try {
    await db.collection("notifications").add({
      ...notice,
      read: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

  } catch (e) {
    return e;
  }
}
const adminLogo =
  "https://storage.googleapis.com/talentkids-dev/logo01iconcolored_3491fc3297/logo01iconcolored_3491fc3297.png?updated_at=2022-11-14T19:51:10.690Z";

module.exports = { createNotification, adminLogo, createMessageNotification };