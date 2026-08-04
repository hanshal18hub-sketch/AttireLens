­r‡^Ñf¥–Ø¦{^,yÊ'vÃ®¶›­import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("https://attirelens.test/", { headers: { accept: "text/html" } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
}

test("renders the AttireLens production surface", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /AttireLens/);
  assert.match(html, /Every layer/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|prototype/i);
});

test("enforces security headers at the worker boundary", async () => {
  const response = await render();
  assert.match(response.headers.get("content-security-policy") ?? "", /frame-ancestors 'none'/);
  assert.match(response.headers.get("strict-transport-security") ?? "", /max-age=63072000/);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.equal(response.headers.get("cross-origin-opener-policy"), "same-origin");
  assert.equal(response.headers.get("cache-control"), "no-store, max-age=0");
});

test("keeps risky inputs fail-closed", async () => {
  const [page, security] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("SECURITY.md", root), "utf8"),
  ]);
  assert.match(page, /MAX_IMAGE_BYTES/);
  assert.match(page, /createImageBitmap/);
  assert.match(page, /canvas\.toBlob/);
  assert.match(page, /Automatic importing is locked until the isolated retailer gateway is connected/);
  assert.match(security, /Client validation is defence in depth, never the trust boundary/);
});

test("labels lab evaluation as test-only and computes against ground truth", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("lab-test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const request = new Request("https://attirelens.test/api/lab/evaluate", { method: "POST", headers: { "content-type": "application/json", "oai-authenticated-user-id": "test-operator", "oai-authenticated-user-email": "operator@example.test" }, body: JSON.stringify({ environment: "test", source: "simulated", caseId: "FIT-TEST01", consentRecorded: true, groundTruth: { chest: 90, waist: 75, hip: 98, inseam: 78 }, prediction: { values: { chest: 91, waist: 77, hip: 97, inseam: 79 }, ranges: { chest: { low: 88, high: 93 }, waist: { low: 74, high: 79 }, hip: { low: 95, high: 100 }, inseam: { low: 77, high: 81 } } }, fit: { groundTruth: "regular", predicted: "regular" } }) });
  const response = await worker.fetch(request, { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
  const report = await response.json();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("x-attirelens-environment"), "test");
  assert.equal(report.testOnly, true);
  assert.equal(report.summary.meanAbsoluteErrorCm, 1.3);
  assert.equal(report.summary.passed, true);
});

test("rejects unauthenticated lab evaluation", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("lab-auth-test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const response = await worker.fetch(new Request("https://attirelens.test/api/lab/evaluate", { method: "POST" }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
  assert.equal(response.status, 401);
});
