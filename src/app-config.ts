export const appConfig = () => ({
  database: {
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    database: process.env.DB_NAME || "test",
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "123456",
    entities: ["dist/**/*.entity.js"],
    synchronize: true,
    logging: ["query"],
  },
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || "",
  },
  bucket: process.env.BUCKET_NAME,
  post: {
    commentsPerPost: 2,
  },
  queues: {
    images: "images",
  },
});
