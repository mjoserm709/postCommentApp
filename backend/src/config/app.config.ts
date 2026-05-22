export default () => ({
  app: {
    port: Number(process.env.PORT ?? 3000),
    corsOrigins: (process.env.CORS_ORIGIN ?? '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  },
  database: {
    mongoUri: process.env.MONGO_URI ?? '',
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET ?? '',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  },
});
