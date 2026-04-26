const serverless = require("serverless-http");
const connectDB = require("../../backend/config/db");
const seedDefaultAdmin = require("../../backend/utils/seedAdmin");
const app = require("../../backend/server");

let isReady = false;

const bootstrap = async () => {
  if (!isReady) {
    await connectDB();
    await seedDefaultAdmin();
    isReady = true;
  }
};

exports.handler = async (event, context) => {
  await bootstrap();
  const handler = serverless(app);
  return handler(event, context);
};
