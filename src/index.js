'use strict';
const session = require("koa-session2");
const { admin, db, firebase, defaultAuth,  } = require("./lib/firebase/index");
const { createMessageNotification, adminLogo } = require("./lib/firebase/notification");
const utils = require("@strapi/utils");

const { ApplicationError } = utils.errors;
module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {
    const extensionService = strapi.plugin("graphql").service("extension");
    extensionService.use(({ nexus }) => ({
      types: [
        nexus.extendType({
          type: "Users",
          definition(t) {
            // console.log(t)
            t.string("testing");
          },
        }),
      ],
    }));
    strapi.server.use(
      session({
        secret: "grant",
      })
    );
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap(/*{ strapi }*/) {
    strapi.db.lifecycles.subscribe({
      models: ["plugin::users-permissions.user"],
      async afterCreate(event) {
        // afterCreate lifeclcyle
      },
      async beforeCreate(event) {
        // beforeCreate lifeclcyle
      },
      async beforeUpdate(event) {
        const { params } = event;
        if (params.data.fUid) {
          const newEmail = params.data.email;
          try {
            await defaultAuth.updateUser(params.data.fUid, {
              email: newEmail,
            });
          } catch (err) {
            throw new ApplicationError(
              "Something is wrong please try again later or contact support"
            );
          }
        }
      },
      async afterUpdate(event) {
        const { result } = event;
        // console.log(event);
        const message = {
          sender: "talentkids admin",
          recipientEmail: result.email,
          recipientName: result.fullName,
          messageType: "profile update",
          messageImage: adminLogo,
          subject: "profile successfuly updated!",
          message:
            "Your profile information has been updated.",
          entityId: result.id,
          entityType: "User",
          url: `/account`,
        };
        await createMessageNotification(message);

        // if you want o update email from the strapi admin and then change the email for firebase you have to pull the current email and then compare.
        // if (params.data.email !== result.email) {
        //   const newEmail = result.email;
        //   console.log(newEmail)
        //   // try {
        //   //   await defaultAuth.updateUser(result.firebaseUserId, {
        //   //     email: newEmail,
        //   //   });
        //   // } catch (err) {
        //   //   throw new ApplicationError(
        //   //     "Something is wrong please try again later or contact support"
        //   //   );
        //   // }
        // }
      },

      async beforeFindOne(event) {
        // beforeFindOne lifeclcyle
      },
      async afterFindOne(event) {
        const { result, params } = event;
        // console.log(event)
      },
    });
  },
};
