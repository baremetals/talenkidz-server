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
      subject: "Congratulations on your Premium subscription!",
      title: "Thanks for upgrading your account", // has the issue
      username: firstname,
      url: `${process.env.FRONT_END_HOST}`,
      firstLine:
        "We're thrilled to confirm that your payment has been successfully processed. You now have access to all our exclusive features, including personalised recommendations, and much more.", // has issue
      secondLine:
        "To start using your premium subscription, simply log in to your account and explore our platform. We're confident that you'll find our tools and resources to be incredibly valuable.",
      thirdLine:
        "Please feel free to share the platform with friends and family on social media and encourage them to join our community.",
      buttonText: "Click here to login",
      imageUrl:
        "https://firebasestorage.googleapis.com/v0/b/talentkids.appspot.com/o/image%2092.png?alt=media&token=41124dc9-ff1d-4304-a796-26da1199bed5",
    };

    const message = {
      sender: "talentkids admin",
      recipientEmail: user.email,
      recipientName: user.fullName,
      messageType: "subscrition",
      messageImage: adminLogo,
      subject: "Account Upgrade",
      message:
        "We're thrilled to confirm that your payment has been successfully processed. You now have access to all our exclusive features, including personalised recommendations, and much more..",
      entityId: user.id,
      entityType: "Subscription",
      url: "",
    };

    await createNotification(
      message,
      user.email,
      "d-4e55cd22ed7d490f9a0f7719c816b3ba",
      emailTemplate
    );
  },
  async afterDelete(event) {
    const { result } = event;
    // const entity = params.data;

    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({ where: { id: result.user } });

    const firstname =
      user.fullName !== "" ? user.fullName.split(" ")[0] : user.username;
    const emailTemplate = {
      subject: "We're sorry to see you go",
      title: "We're sorry to see you go", // has the issue
      username: firstname,
      url: `${process.env.FRONT_END_HOST}`,
      firstLine:
        "We're sorry to hear that you've decided to downgrade your account back to Basic. We understand that everyone's needs are different, but we hope you'll consider sticking with us.", // has issue
      secondLine:
        "If you change your mind, simply log in to your account and visit the upgrade section.",
      thirdLine:
        "Please feel free to share the platform with friends and family on social media and encourage them to join our community.",
      buttonText: "Click here to login",
      imageUrl:
        "https://firebasestorage.googleapis.com/v0/b/talentkids.appspot.com/o/image%2092.png?alt=media&token=41124dc9-ff1d-4304-a796-26da1199bed5",
    };

    const message = {
      sender: "talentkids admin",
      recipientEmail: user.email,
      recipientName: user.fullName,
      messageType: "account downgrade",
      messageImage: adminLogo,
      subject: "Cancel Subscrition",
      message:
        "We're sorry to hear that you've decided to downgrade your account back to Basic. We understand that everyone's needs are different, but we hope you'll consider sticking with us. If you change your mind, simply log in to your account and visit the upgrade section.",
      entityId: user.id,
      entityType: "Subscription",
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
