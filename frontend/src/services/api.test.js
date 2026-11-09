const originalApiUrl = process.env.REACT_APP_API_URL;

afterEach(() => {
  if (originalApiUrl === undefined) delete process.env.REACT_APP_API_URL;
  else process.env.REACT_APP_API_URL = originalApiUrl;
  delete window.__API_BASE__;
  localStorage.clear();
  jest.restoreAllMocks();
  delete global.fetch;
});

test("local development uses the same-origin API proxy", () => {
  delete process.env.REACT_APP_API_URL;
  jest.resetModules();
  const { API_BASE_URL } = require("./api");
  expect(API_BASE_URL).toBe("/api");
});

test("Vercel API requests use the configured HTTPS backend and stored token", async () => {
  process.env.REACT_APP_API_URL = "https://cakey-backend.example.com/api/";
  jest.resetModules();
  const { apiService } = require("./api");
  localStorage.setItem("cb_token", "test-token");
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    headers: { get: () => "application/json" },
    json: async () => [{ id: "cake" }],
  });

  const products = await apiService.listProducts({ category: "Birthday Cakes" });
  expect(global.fetch).toHaveBeenCalledWith(
    "https://cakey-backend.example.com/api/products?category=Birthday+Cakes",
    expect.objectContaining({
      headers: expect.objectContaining({ Authorization: "Bearer test-token" }),
    })
  );
  expect(products).toEqual([{ id: "cake" }]);
});

test("an explicit browser API override takes precedence", () => {
  process.env.REACT_APP_API_URL = "https://build.example.com/api";
  window.__API_BASE__ = "https://runtime.example.com/api/";
  jest.resetModules();
  const { API_BASE_URL } = require("./api");
  expect(API_BASE_URL).toBe("https://runtime.example.com/api");
});
