module.exports = ({ env }) => ({
  // all plugins goes here
  graphql: {
    config: {
      endpoint: "/graphql",
      shadowCRUD: true,
      playgroundAlways: false,
      depthLimit: 7,
      amountLimit: 100,
      apolloServer: {
        tracing: false,
      },
    },
  },

  // EMAILS
  email: {
    config: {
      provider: "sendgrid",
      providerOptions: {
        apiKey: env("SENDGRID_API_KEY"),
      },
      settings: {
        defaultFrom: "noreply@talentkids.io",
        defaultReplyTo: "noreply@talentkids.io",
        // testAddress: "baremetals16@gmail.com",
      },
    },
  },
});
