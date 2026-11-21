import https from "https";
import http from "http";

// 14 minutes in milliseconds (Render free tier sleeps after 15 minutes of inactivity)
const KEEP_ALIVE_INTERVAL_MS = 14 * 60 * 1000;

let keepAliveTimer = null;

/**
 * Pings the given health check URL using native Node http/https modules.
 */
export const pingHealthEndpoint = (healthUrl) => {
  return new Promise((resolve) => {
    try {
      const client = healthUrl.startsWith("https") ? https : http;
      const req = client.get(healthUrl, { timeout: 15000 }, (res) => {
        // Consume response data to free up memory
        res.resume();
        resolve({ ok: res.statusCode >= 200 && res.statusCode < 400, statusCode: res.statusCode });
      });

      req.on("error", (err) => {
        console.warn(`[Keep-Alive Cron] Ping warning: ${err.message}`);
        resolve({ ok: false, error: err.message });
      });

      req.on("timeout", () => {
        req.destroy();
        resolve({ ok: false, error: "Request timed out" });
      });
    } catch (error) {
      resolve({ ok: false, error: error.message });
    }
  });
};

/**
 * Starts a periodic self-ping cron job in production so Render Free Tier stays warm 24/7.
 * Render automatically injects RENDER_EXTERNAL_URL (e.g. https://your-service.onrender.com).
 */
export const startKeepAliveCron = () => {
  if (keepAliveTimer) return keepAliveTimer;

  const baseUrl = (process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL || "").trim();

  if (!baseUrl) {
    if (process.env.NODE_ENV === "production") {
      console.log(
        "ℹ️ [Keep-Alive Cron] Set RENDER_EXTERNAL_URL or BACKEND_URL to enable automatic 14-minute self-ping."
      );
    }
    return null;
  }

  const normalizedUrl = `${baseUrl.replace(/\/+$/, "")}/api/health`;
  console.log(`⏰ [Keep-Alive Cron] Active — pinging ${normalizedUrl} every 14 minutes.`);

  keepAliveTimer = setInterval(async () => {
    const result = await pingHealthEndpoint(normalizedUrl);
    if (result.ok) {
      console.log(`✅ [Keep-Alive Cron] Heartbeat OK (${result.statusCode}) at ${new Date().toISOString()}`);
    }
  }, KEEP_ALIVE_INTERVAL_MS);

  // Allow process to exit cleanly during tests or graceful shutdowns
  if (typeof keepAliveTimer.unref === "function") {
    keepAliveTimer.unref();
  }

  return keepAliveTimer;
};

export const stopKeepAliveCron = () => {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
};