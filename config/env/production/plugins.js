module.exports = ({ env }) => ({
  // all plugins goes here
  upload: {
    config: {
      provider: env("UPLOAD_PROVIDER"),
      providerOptions: {
        bucketName: env("GCS_BUCKET_NAME"),
        publicFiles: env("GCS_PUBLIC_FILES"),
        uniform: env("GCS_UNIFORM"),
        basePath: env("GCS_BASE_PATH"),
      },
    },
  },
  graphql: {
    config: {
      endpoint: "/graphql",
      shadowCRUD: true,
      playgroundAlways: false,
      amountLimit: 100,
      apolloServer: {
        tracing: false,
      },
    },
  },

  // EMAILS
  email: {
    config: {
      provider: env("EMAIL_PROVIDER"),
      providerOptions: {
        apiKey: env("SENDGRID_API_KEY"),
      },
      settings: {
        defaultFrom: env("EMAIL_FROM"),
        defaultReplyTo: env("EMAIL_FROM"),
        // testAddress: "baremetals16@gmail.com",
      },
    },
  },
  ckeditor: true,
  "users-permissions": {
    config: {
      jwtSecret: env("JWT_SECRET"),
    },
  },
});
