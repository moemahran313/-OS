import { createApp } from "./server/app.js";

const PORT = 3000;

async function start() {
  try {
    const app = await createApp();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Mudarij OS running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
