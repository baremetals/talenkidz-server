const {
  createNotification,
  adminLogo,
} = require("../../../../lib/firebase/notification");

module.exports = {
  async afterCreate(event) {
    const { params } = event;
    const entity = params.data;

    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({ where: { id: entity.user } });

    const firstname =
      user.fullName !== "" ? user.fullName.split(" ")[0] : user.username;
    const emailTemplate = {
      subject: "Your payment has been successfully processed!",
      title: "Your payment has been successfully processed!", // has the issue
      username: firstname,
      url: `${process.env.FRONT_END_HOST}`,
      firstLine:
        "We're excited to confirm that your payment has been successfully processed.", // has issue
      secondLine:
        "",
      thirdLine:
        "",
      buttonText: "Click here to login",
      imageUrl:
        "https://firebasestorage.googleapis.com/v0/b/talentkids.appspot.com/o/image%2092.png?alt=media&token=41124dc9-ff1d-4304-a796-26da1199bed5",
    };

    const message = {
      sender: "talentkids admin",
      recipientEmail: user.email,
      recipientName: user.fullName,
      messageType: "order",
      messageImage: adminLogo,
      subject: "Payment successful",
      message:
        "We're excited to confirm that your payment has been successfully processed.",
      entityId: user.id,
      entityType: "Order",
      url: "",
    };

    await createNotification(
      message,
      user.email,
      "d-4e55cd22ed7d490f9a0f7719c816b3ba",
      emailTemplate
    );
  },
};
