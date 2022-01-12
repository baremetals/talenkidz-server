module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', '35e13ca216d4217e19e40bde4bf8edaa'),
  },
});
