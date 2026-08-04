≠rá^—f•ñÿ¶{^,y 'v√Æ∂õ≠/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

const securityHeaders: Record<string, string> = {
  "Content-Security-Policy": "default-src 'self'; img-src 'self' blob: data:; media-src 'self' blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self'; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; manifest-src 'self'; upgrade-insecure-requests",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "camera=(self), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Origin-Agent-Cluster": "?1",
  "X-Permitted-Cross-Domain-Policies": "none",
};

function secure(response: Response): Response {
  const secured = new Response(response.body, response);
  for (const [name, value] of Object.entries(securityHeaders)) secured.headers.set(name, value);
  if (secured.headers.get("content-type")?.includes("text/html")) secured.headers.set("Cache-Control", "no-store, max-age=0");
  return secured;
}

function json(data: unknown, status = 200): Response {
  return secure(new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-attirelens-environment": "test" } }));
}

async function evaluateLabRequest(request: Request): Promise<Response> {
  if (!request.headers.get("oai-authenticated-user-id") || !request.headers.get("oai-authenticated-user-email")) return json({ environment: "test", testOnly: true, error: "Authenticated lab access required." }, 401);
  if (request.method !== "POST") return json({ environment: "test", testOnly: true, error: "Method not allowed" }, 405);
  let body: any;
  try { body = await request.json(); } catch { return json({ environment: "test", testOnly: true, error: "Invalid JSON" }, 400); }
  if (body?.environment !== "test" || !["simulated", "model-predicted"].includes(body?.source)) return json({ environment: "test", testOnly: true, error: "A declared test prediction source is required." }, 422);
  if (!body?.consentRecorded || !/^[A-Z0-9-]{4,40}$/.test(body?.caseId ?? "")) return json({ environment: "test", testOnly: true, error: "Consent and an anonymous case ID are required." }, 422);
  const fields = ["chest", "waist", "hip", "inseam"] as const;
  const measurements = [];
  for (const field of fields) {
    const truth = Number(body?.groundTruth?.[field]); const predicted = Number(body?.prediction?.values?.[field]); const low = Number(body?.prediction?.ranges?.[field]?.low); const high = Number(body?.prediction?.ranges?.[field]?.high);
    if (![truth, predicted, low, high].every((value) => Number.isFinite(value) && value > 0 && value <= 300) || low > high) return json({ environment: "test", testOnly: true, error: `Invalid ${field} measurement or confidence range.` }, 422);
    measurements.push({ field, absoluteErrorCm: Math.round(Math.abs(predicted - truth) * 10) / 10, withinRange: truth >= low && truth <= high });
  }
  const meanAbsoluteErrorCm = Math.round(measurements.reduce((sum, item) => sum + item.absoluteErrorCm, 0) / measurements.length * 10) / 10;
  const confidenceCoveragePercent = Math.round(measurements.filter((item) => item.withinRange).length / measurements.length * 100);
  const allowedFits = ["tight", "close", "regular", "loose", "unknown"];
  if (!allowedFits.includes(body?.fit?.groundTruth) || !allowedFits.includes(body?.fit?.predicted)) return json({ environment: "test", testOnly: true, error: "Invalid fit classification." }, 422);
  const fitAgreementPercent = body.fit.groundTruth === body.fit.predicted ? 100 : 0;
  const gates = [`Measurement MAE ${meanAbsoluteErrorCm <= 4 ? "passed" : "failed"} (‚â§ 4.0 cm)`, `Confidence coverage ${confidenceCoveragePercent >= 75 ? "passed" : "failed"} (‚â• 75% in this single case)`, `Fit classification ${fitAgreementPercent === 100 ? "matched" : "did not match"}`];
  return json({ environment: "test", testOnly: true, caseId: body.caseId, source: body.source, summary: { meanAbsoluteErrorCm, confidenceCoveragePercent, fitAgreementPercent, passed: meanAbsoluteErrorCm <= 4 && confidenceCoveragePercent >= 75 && fitAgreementPercent === 100 }, measurements, gates });
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/lab/evaluate") return evaluateLabRequest(request);

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return secure(await handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths));
    }

    return secure(await handler.fetch(request, env, ctx));
  },
};

export default worker;
