module.exports = ({ env }) => ({
  host: env("HOST"),
  port: env.int("PORT"),
  // url: env("APP_URL"),
  app: {
    keys: env.array("APP_KEYS"),
  },
  url: "https://1101-83-146-9-36.eu.ngrok.io",
});
