'use strict';

const { yup, validateYupSchema } = require('@strapi/utils');

const callbackBodySchema = yup.object().shape({
  identifier: yup.string().required(),
  password: yup.string().required(),
});

const registerBodySchema = yup.object().shape({
  email: yup
    .string()
    .email()
    .required(),
  password: yup.string().required(),
});

const sendEmailConfirmationBodySchema = yup.object().shape({
  email: yup
    .string()
    .email()
    .required(),
});

const validateEmailConfirmationSchema = yup.object({
  confirmation: yup.string().required(),
});

const changePasswordSchema = yup
  .object({
    password: yup.string().required(),
    passwordConfirmation: yup
      .string()
      .required()
      .oneOf([yup.ref("password")], "Passwords do not match"),
    currentPassword: yup.string().required(),
  })
  .noUnknown();

  const resetPasswordSchema = yup
    .object({
      password: yup.string().required(),
      passwordConfirmation: yup.string().required(),
      code: yup.string().required(),
    })
    .noUnknown();

    const forgotPasswordSchema = yup
      .object({
        email: yup.string().email().required(),
      })
      .noUnknown();

module.exports = {
  validateCallbackBody: validateYupSchema(callbackBodySchema),
  validateRegisterBody: validateYupSchema(registerBodySchema),
  validateSendEmailConfirmationBody: validateYupSchema(
    sendEmailConfirmationBodySchema
  ),
  validateEmailConfirmationBody: validateYupSchema(
    validateEmailConfirmationSchema
  ),
  validateChangePasswordBody: validateYupSchema(changePasswordSchema),
  validateResetPasswordBody: validateYupSchema(resetPasswordSchema),
  validateForgotPasswordBody: validateYupSchema(forgotPasswordSchema),
};
