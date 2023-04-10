const {
  createNotification,
  adminLogo,
  createMessageNotification,
} = require("../../../../lib/firebase/notification");

module.exports = {
  // async beforeCreate(event) {
  // const { data, where, select, populate } = event.params;

  // // let's do a 20% discount everytime
  // // console.log(event, "i am before create");
  // },
  async afterCreate(event) {
    const { params } = event;
    const entity = params.data;
    // const currentYear = new Date().getFullYear();

    // console.log("the event ---------------->", currentYear)
    // const listing = await strapi.db.query("api::listing.listing").findOne({
    //   where: { id: result.id },
    //   populate: { host: true },
    // });

    const category = await strapi.db
      .query("api::category.category")
      .findOne({ where: { id: entity.category } });

    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({ where: { id: entity.host } });

    const firstname =
      user.fullName !== "" ? user.fullName.split(" ")[0] : user.username;
    const emailTemplate = {
      subject: `Activity Published`,
      title: `Your activity "${entity.title}" has been published`, // has the issue
      username: firstname,
      url: `${process.env.FRONT_END_HOST}/activities/${category.slug}/${entity.slug}`,
      firstLine:
        "We're excited to let you know that your activity has been successfully published!, Your contribution to our community is greatly appreciated, and we're confident that your post will inspire and inform our users", // has issue
      secondLine: `Your post is now live, and you can view it at the following link:`,
      thirdLine:
        "Please feel free to share your post with your friends and family on social media and encourage them to join our community. We're always looking for more contributors who share our passion for child development and education.",
      buttonText: "Click here to view",
      imageUrl: entity.listImage,
    };

    const message = {
      sender: "talentkids admin",
      recipientEmail: user.email,
      recipientName: user.fullName,
      messageType: "new activity",
      messageImage: adminLogo,
      subject: "Activity Published",
      message:
        "We're excited to let you know that your activity has been successfully published!, Your contribution to our community is greatly appreciated.",
      entityId: user.id,
      entityType: "Listing",
      url: `/activities/${category.slug}/${entity.slug}`,
    };

    await createNotification(
      message,
      user.email,
      "d-4e55cd22ed7d490f9a0f7719c816b3ba",
      emailTemplate
    );
  },
  async afterUpdate(event) {
    const { params } = event;
    const entity = params.data;

    const category = await strapi.db
      .query("api::category.category")
      .findOne({ where: { id: entity.category } });

    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({ where: { id: entity.host } });

    // console.log(event);
    const message = {
      sender: "talentkids admin",
      recipientEmail: user.email,
      recipientName: user.fullName,
      messageType: "activity update",
      messageImage: adminLogo,
      subject: "activity successfuly updated!",
      message: "Your activity information has been updated.",
      entityId: user.id,
      entityType: "Listing",
      url: `/activities/${category.slug}/${entity.slug}`,
    };
    await createMessageNotification(message);
  },
};
