import app from "./app";
import { initializeDatabase } from "./database/data-source";


async function startServer() {
  try {
    await initializeDatabase();
    console.log("Database connected");
  } catch (error) {
    console.error("Failed to start server:");
  }
}

startServer();

export default {
  port: Number(process.env.PORT ?? 3000),
  fetch: app.fetch,
};