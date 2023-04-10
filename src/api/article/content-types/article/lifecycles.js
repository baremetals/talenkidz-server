const {
  createNotification,
  adminLogo,
  createMessageNotification,
} = require("../../../../lib/firebase/notification");

module.exports = {
  async afterCreate(event) {
    const { params } = event;
    const entity = params.data;

    if (entity.creator !== null || entity.creator !== undefined) {
      const category = await strapi.db
        .query("api::category.category")
        .findOne({ where: { id: entity.category } });

      const user = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({ where: { id: entity.creator } });

      const firstname =
        user.fullName !== "" ? user.fullName.split(" ")[0] : user.username;
      const emailTemplate = {
        subject: `Article Published`,
        title: `Your article "${entity.title}" has been published`, // has the issue
        username: firstname,
        url: `${process.env.FRONT_END_HOST}/articles/${category.slug}/${entity.slug}`,
        firstLine:
          "We're excited to let you know that your article has been successfully published!, Your contribution to our community is greatly appreciated, and we're confident that your post will inspire and inform our users", // has issue
        secondLine: `Your article is now live, and you can view it at the following link:`,
        thirdLine:
          "Please feel free to share your article with your friends and family on social media and encourage them to join our community. We're always looking for more contributors who share our passion for child development and education.",
        buttonText: "Click here to view",
        imageUrl: entity.SEO.url,
      };

      const message = {
        sender: "talentkids admin",
        recipientEmail: user.email,
        recipientName: user.fullName,
        messageType: "new article",
        messageImage: adminLogo,
        subject: "Article Published",
        message:
          "We're excited to let you know that your article has been successfully published!, Your contribution to our community is greatly appreciated.",
        entityId: user.id,
        entityType: "Article",
        url: `/articles/${category.slug}/${entity.slug}`,
      };

      await createNotification(
        message,
        user.email,
        "d-4e55cd22ed7d490f9a0f7719c816b3ba",
        emailTemplate
      );
    }
  },
  async afterUpdate(event) {
    const { params } = event;
    const entity = params.data;

    const category = await strapi.db
      .query("api::category.category")
      .findOne({ where: { id: entity.category } });

    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({ where: { id: entity.creator } });

    // console.log(event);
    const message = {
      sender: "talentkids admin",
      recipientEmail: user.email,
      recipientName: user.fullName,
      messageType: "article update",
      messageImage: adminLogo,
      subject: "article successfuly updated!",
      message: "Your article information has been updated.",
      entityId: user.id,
      entityType: "Article",
      url: `/articles/${category.slug}/${entity.slug}`,
    };
    await createMessageNotification(message);
  },
};
