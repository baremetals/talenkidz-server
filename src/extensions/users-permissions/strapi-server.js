const confirm_email = require("./email-template/confirm_email");
const reset = require("./email-template/reset_password");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.EMAIL_API_KEY);

const crypto = require("crypto");
const _ = require("lodash");
const utils = require("@strapi/utils");
const bcrypt = require("bcryptjs");
const urlJoin = require("url-join");
const {
  validateCallbackBody,
  validateRegisterBody,
  validateSendEmailConfirmationBody,
} = require("./validation/auth");
const { createCandidate, createOrganisation } = require("../../lib");

const { getAbsoluteServerUrl, sanitize } = utils;
const { ApplicationError, ValidationError } = utils.errors;

const emailRegExp =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const sanitizeUser = (user, ctx) => {
  const { auth } = ctx.state;
  const userSchema = strapi.getModel("plugin::users-permissions.user");

  return sanitize.contentAPI.output(user, userSchema, { auth });
};

const getService = (name) => {
  return strapi.plugin("users-permissions").service(name);
};

module.exports = (plugin) => {
  plugin.controllers.user.findOne = async (ctx) => {
    const { id } = ctx.params;

    const entity = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({ where: { username: id } });

    if (!entity) {
      throw new ApplicationError("This user doesn't exist");
    }
    const sanitizedEntity = await sanitizeUser(entity, ctx);
    return ctx.send({ user: sanitizedEntity });
  };

  plugin.controllers.auth.callback = async (ctx) => {
    const provider = ctx.params.provider || "local";
    const params = ctx.request.body;

    const store = await strapi.store({
      type: "plugin",
      name: "users-permissions",
    });

    if (provider === "local") {
      if (!_.get(await store.get({ key: "grant" }), "email.enabled")) {
        throw new ApplicationError("This provider is disabled");
      }

      await validateCallbackBody(params);

      const query = { provider };

      // Check if the provided identifier is an email or not.
      const isEmail = emailRegExp.test(params.identifier);

      // Set the identifier to the appropriate query field.
      if (isEmail) {
        query.email = params.identifier.toLowerCase();
      } else {
        query.username = params.identifier;
      }

      // Check if the user exists.
      const user = await strapi
        .query("plugin::users-permissions.user")
        .findOne({ where: query, populate: { organisation: true } });

      if (!user) {
        throw new ValidationError("Invalid identifier or password");
      }

      if (
        _.get(await store.get({ key: "advanced" }), "email_confirmation") &&
        user.confirmed !== true
      ) {
        throw new ApplicationError("Your account email is not confirmed");
      }

      if (user.blocked === true) {
        throw new ApplicationError(
          "Your account has been blocked by an administrator"
        );
      }

      // The user never authenticated with the `local` provider.
      if (!user.password) {
        throw new ApplicationError(
          "This user never set a local password, please login with the provider used during account creation"
        );
      }

      const validPassword = await getService("user").validatePassword(
        params.password,
        user.password
      );

      if (!validPassword) {
        throw new ValidationError("Invalid identifier or password");
      } else {
        ctx.send({
          jwt: getService("jwt").issue({
            id: user.id,
          }),
          user: await sanitizeUser(user, ctx),
        });
      }
    } else {
      if (!_.get(await store.get({ key: "grant" }), [provider, "enabled"])) {
        throw new ApplicationError("This provider is disabled");
      }

      // Connect the user with the third-party provider.
      let user;
      let error;
      try {
        [user, error] = await getService("providers").connect(
          provider,
          ctx.query
        );
      } catch ([user, error]) {
        throw new ApplicationError(error.message);
      }

      if (!user) {
        throw new ApplicationError(error.message);
      }

      ctx.send({
        jwt: getService("jwt").issue({ id: user.id }),
        user: await sanitizeUser(user, ctx),
      });
    }
  };

  plugin.controllers.auth.forgotPassword = async (ctx) => {
    let { email } = ctx.request.body;

    // Check if the provided email is valid or not.
    const isEmail = emailRegExp.test(email);

    if (isEmail) {
      email = email.toLowerCase();
    } else {
      throw new ValidationError("Please provide a valid email address");
    }

    const pluginStore = await strapi.store({
      type: "plugin",
      name: "users-permissions",
    });

    // Find the user by email.
    const user = await strapi
      .query("plugin::users-permissions.user")
      .findOne({ where: { email: email.toLowerCase() } });

    // User not found.
    if (!user) {
      throw new ApplicationError("This email does not exist");
    }

    // User blocked
    if (user.blocked) {
      throw new ApplicationError("This user is disabled");
    }

    // Generate random token.
    const resetPasswordToken = crypto.randomBytes(64).toString("hex");

    const settings = await pluginStore
      .get({ key: "email" })
      .then((storeEmail) => {
        try {
          return storeEmail["reset_password"].options;
        } catch (error) {
          return {};
        }
      });

    const advanced = await pluginStore.get({
      key: "advanced",
    });

    const userInfo = await sanitizeUser(user, ctx);

    settings.message = reset.html;

    settings.message = await getService("users-permissions").template(
      settings.message,
      {
        URL: advanced.email_reset_password,
        USER: userInfo,
        TOKEN: resetPasswordToken,
      }
    );

    // console.log(settings.message);

    settings.object = await getService("users-permissions").template(
      settings.object,
      {
        USER: userInfo,
      }
    );

    const emailTemplate = {
      to: `${user.email}`, // recipient
      from: "Talentkids.io <noreply@talentkids.io>", // Change to verified sender
      template_id: "d-2d1c3546ff9e4eea9eab196625725a2a",
      dynamic_template_data: {
        subject: `Reset Password`,
        username: `${user.username}`,
        url: `${advanced.email_reset_password}/?code=${resetPasswordToken}`, //`"<%= URL %>?code=<%= TOKEN %>`,
        firstLine: "We heard that you lost your password. Sorry about that!.",
        secondLine: `But don’t worry! You can use the button above to reset
                        your password.`,
        buttonText: "Reset Password",
      },
    };

    try {
      await sgMail
        .send(emailTemplate)
        .then((res) => {
          console.log("Email sent", res[0].statusCode);
        })
        .catch((error) => {
          console.log(`Sending the verify email produced this error: ${error}`);
        });
      // Send an email to the user.
      // await strapi
      //   .plugin("email")
      //   .service("email")
      //   .send({
      //     to: user.email,
      //     from:
      //       settings.from.email || settings.from.name
      //         ? `${settings.from.name} <${settings.from.email}>`
      //         : undefined,
      //     replyTo: settings.response_email,
      //     subject: settings.object,
      //     text: settings.message,
      //     html: settings.message,
      //   });
    } catch (err) {
      throw new ApplicationError(err.message);
    }

    // Update the user.
    await strapi
      .query("plugin::users-permissions.user")
      .update({ where: { id: user.id }, data: { resetPasswordToken } });

    ctx.send({ ok: true });
  };

  plugin.controllers.auth.register = async (ctx) => {
    const pluginStore = await strapi.store({
      type: "plugin",
      name: "users-permissions",
    });

    const settings = await pluginStore.get({
      key: "advanced",
    });

    if (!settings.allow_register) {
      throw new ApplicationError("Register action is currently disabled");
    }

    const params = {
      ..._.omit(ctx.request.body, [
        "confirmed",
        "blocked",
        "confirmationToken",
        "resetPasswordToken",
        "provider",
      ]),
      provider: "local",
    };

    await validateRegisterBody(params);

    const role = await strapi
      .query("plugin::users-permissions.role")
      .findOne({ where: { type: settings.default_role } });

    if (!role) {
      throw new ApplicationError("Impossible to find the default role");
    }

    const { email, username, provider } = params;

    const identifierFilter = {
      $or: [
        { email: email.toLowerCase() },
        { username: email.toLowerCase() },
        { username },
        { email: username },
      ],
    };

    const conflictingUserCount = await strapi
      .query("plugin::users-permissions.user")
      .count({
        where: { ...identifierFilter, provider },
      });

    if (conflictingUserCount > 0) {
      throw new ApplicationError("Email or Username are already taken");
    }

    if (settings.unique_email) {
      const conflictingUserCount = await strapi
        .query("plugin::users-permissions.user")
        .count({
          where: { ...identifierFilter },
        });

      if (conflictingUserCount > 0) {
        throw new ApplicationError("Email or Username are already taken");
      }
    }

    const newUser = {
      ...params,
      role: role.id,
      email: email.toLowerCase(),
      username,
      confirmed: !settings.email_confirmation,
    };

    const user = await getService("user").add(newUser);

    const sanitizedUser = await sanitizeUser(user, ctx);

    if (sanitizedUser.userType === "candidate") {
      await createCandidate(sanitizedUser.id);
      // , createOrganisation
    } else {
      const { id, avatar, username } = sanitizedUser;
      await createOrganisation(id, username, avatar);
    }

    if (settings.email_confirmation) {
      try {
        await sendConfirmationEmail(sanitizedUser);
      } catch (err) {
        throw new ApplicationError(err.message);
      }

      return ctx.send({ user: sanitizedUser });
    }

    const jwt = getService("jwt").issue(_.pick(user, ["id"]));

    return ctx.send({
      jwt,
      user: sanitizedUser,
    });

  };

  const sendConfirmationEmail = async (user) => {
    // console.log(user, "I am in this bitch");

    const userPermissionService = getService("users-permissions");
    const pluginStore = await strapi.store({
      type: "plugin",
      name: "users-permissions",
    });

    const userSchema = strapi.getModel("plugin::users-permissions.user");

    const settings = await pluginStore
      .get({ key: "email" })
      .then((storeEmail) => storeEmail["email_confirmation"].options);

    // Sanitize the template's user information
    const sanitizedUserInfo = await sanitize.sanitizers.defaultSanitizeOutput(
      userSchema,
      user
    );

    const confirmationToken = crypto.randomBytes(20).toString("hex");

    await edit(user.id, { confirmationToken });

    const apiPrefix = strapi.config.get("api.rest.prefix");

    settings.message = confirm_email.html;
    // console.log(settings.message);

    settings.message = await userPermissionService.template(settings.message, {
      URL: urlJoin(
        getAbsoluteServerUrl(strapi.config),
        apiPrefix,
        "/auth/email-confirmation"
      ),
      USER: sanitizedUserInfo,
      CODE: confirmationToken,
    });

    settings.object = await userPermissionService.template(settings.object, {
      USER: sanitizedUserInfo,
    });

    // console.log(settings.message.URL);

    const emailTemplate = {
      to: `${user.email}`, // recipient
      from: "Talentkids.io <noreply@talentkids.io>", // Change to verified sender
      template_id: "d-2d1c3546ff9e4eea9eab196625725a2a",
      dynamic_template_data: {
        // subject: `Verify Email`,
        subject: settings.object,
        username: `${user.username}`,
        url: `${process.env.APP_URL}/api/auth/email-confirmation?confirmation=${confirmationToken}`,
        firstLine: "Thank you for registering!",
        secondLine:
          "You have to confirm your email address. Please click on the button above.",
        buttonText: "Verify Email",
      },
    };

    console.log("fever stuff", user.email);

    await sgMail
      .send(emailTemplate)
      .then((res) => {
        console.log("Email sent", res[0].statusCode);
      })
      .catch((error) => {
        console.log(`Sending the verify email produced this error: ${error}`);
      });

    // Send an email to the user.
    // await strapi
    //   .plugin("email")
    //   .service("email")
    //   .send({
    //     to: user.email,
    //     from:
    //       settings.from.email && settings.from.name
    //         ? `${settings.from.name} <${settings.from.email}>`
    //         : undefined,
    //     replyTo: settings.response_email,
    //     subject: settings.object,
    //     text: settings.message,
    //     html: settings.message,
    //   });
  };

  const edit = async (userId, params = {}) => {
    return strapi.entityService.update(
      "plugin::users-permissions.user",
      userId,
      {
        data: params,
        populate: ["role"],
      }
    );
  };

  plugin.controllers.auth.sendEmailConfirmation = async (ctx) => {
    console.log("I am going ta rass", ctx.req.data);

    const params = _.assign(ctx.request.body);

    await validateSendEmailConfirmationBody(params);

    const isEmail = emailRegExp.test(params.email);

    if (isEmail) {
      params.email = params.email.toLowerCase();
    } else {
      throw new ValidationError("wrong.email");
    }

    const user = await strapi.query("plugin::users-permissions.user").findOne({
      where: { email: params.email },
    });

    if (!user) {
      throw new ApplicationError("This email address is not registered");
    }

    if (user.confirmed) {
      throw new ApplicationError("already.confirmed");
    }

    if (user.blocked) {
      throw new ApplicationError("blocked.user");
    }

    try {
      await sendConfirmationEmail(user);
      ctx.send({
        email: user.email,
        sent: true,
      });
    } catch (err) {
      throw new ApplicationError(err.message);
    }
  };

  return plugin;
};
