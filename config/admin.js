module.exports = ({ env }) => ({
  apiToken: {
    salt: env("API_TOKEN_SALT"),
  },
  auth: {
    secret: env("ADMIN_JWT_SECRET", "35e13ca216d4217e19e40bde4bf8edaa"),
  },
});
