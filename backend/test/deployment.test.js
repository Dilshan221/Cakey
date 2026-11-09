import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import mongoose from "mongoose";

// Never load local credentials or contact a real database in deployment tests.
process.env.DOTENV_CONFIG_PATH = "test/no-local-env";
process.env.NODE_ENV = "production";
process.env.CLIENT_ORIGIN = "https://cakey.example.com";
delete process.env.MONGO_URI;
delete process.env.TWILIO_SID;
delete process.env.TWILIO_AUTH;
delete process.env.TWILIO_FROM;

const { default: app } = await import("../index.js");
const { connectDatabase } = await import("../utils/database.js");

test("exported Vercel app handles health, CORS and database failure", async (t) => {
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;

  const health = await fetch(`${base}/api/health`);
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), { ok: true });

  const allowed = await fetch(`${base}/api/health`, {
    headers: { Origin: process.env.CLIENT_ORIGIN },
  });
  assert.equal(allowed.headers.get("access-control-allow-origin"), process.env.CLIENT_ORIGIN);

  const blocked = await fetch(`${base}/api/health`, {
    headers: { Origin: "https://untrusted.example.com" },
  });
  assert.equal(blocked.status, 403);
  assert.equal(blocked.headers.get("access-control-allow-origin"), null);

  const preflight = await fetch(`${base}/api/products`, {
    method: "OPTIONS",
    headers: {
      Origin: process.env.CLIENT_ORIGIN,
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": "Content-Type,Authorization",
    },
  });
  assert.equal(preflight.status, 204);

  const unavailable = await fetch(`${base}/api/products`);
  assert.equal(unavailable.status, 503);
  assert.match((await unavailable.json()).error, /Database unavailable/);

  const missing = await fetch(`${base}/missing`);
  assert.equal(missing.status, 404);
  assert.match((await missing.json()).error, /Route not found/);
});

test("database connection retries failures and shares concurrent and warm calls", async (t) => {
  process.env.MONGO_URI = "mongodb://unused.example.com/test";
  t.after(() => {
    delete process.env.MONGO_URI;
    mongoose.connection.readyState = 0;
  });

  const connect = t.mock.method(mongoose, "connect", async () => {
    throw new Error("Simulated connection failure");
  });
  await assert.rejects(connectDatabase(), /Simulated connection failure/);
  assert.equal(connect.mock.callCount(), 1);

  connect.mock.mockImplementation(async () => {
    mongoose.connection.readyState = 1;
    return mongoose;
  });
  await Promise.all([connectDatabase(), connectDatabase(), connectDatabase()]);
  assert.equal(connect.mock.callCount(), 2);
  await connectDatabase();
  assert.equal(connect.mock.callCount(), 2);
});
