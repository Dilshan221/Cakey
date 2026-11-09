import app from "./index.js";
import mongoose from "mongoose";
import { connectDatabase } from "./utils/database.js";

const port = process.env.PORT || 8000;
let server;

try {
  await connectDatabase();
  server = app.listen(port, () => {
    console.log(`Cake & Bake API listening on http://localhost:${port}`);
  });
} catch (_error) {
  console.error("Startup failed. Check MONGO_URI and MongoDB network access.");
  process.exit(1);
}

async function shutdown() {
  if (server) await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => {
    shutdown().catch(() => { process.exitCode = 1; });
  });
}
