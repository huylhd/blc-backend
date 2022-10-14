export const appConfig = () => ({
  database: {
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    database: process.env.DB_NAME || "test",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "123456",
    entities: ["dist/**/*.entity.js"],
    synchronize: true,
    logging: ["query"],
  },
  post: {
    commentsPerPost: 2,
  },
});
