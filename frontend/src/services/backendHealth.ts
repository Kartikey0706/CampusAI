const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const HEALTH_CHECK_DELAYS_MS = [0, 2_000, 4_000, 6_000] as const;
const HEALTH_CHECK_TIMEOUT_MS = 10_000;

export type BackendStatus = "checking" | "ready" | "unavailable";

let backendStatus: BackendStatus = "checking";
let healthCheckStarted = false;

export function getBackendStatus(): BackendStatus {
  return backendStatus;
}

function wait(delayMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

async function checkHealth(): Promise<boolean> {
  const controller = new AbortController();
  const timeout = window.setTimeout(
    () => controller.abort(),
    HEALTH_CHECK_TIMEOUT_MS
  );

  try {
    const response = await fetch(
      `${API_BASE_URL.replace(/\/+$/, "")}/health`,
      { signal: controller.signal }
    );
    return response.ok;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeout);
  }
}

export function startBackendHealthCheck(): void {
  if (healthCheckStarted) {
    return;
  }

  healthCheckStarted = true;
  void (async () => {
    for (const [attempt, delayMs] of HEALTH_CHECK_DELAYS_MS.entries()) {
      if (attempt > 0) {
        await wait(delayMs);
      }

      if (await checkHealth()) {
        backendStatus = "ready";
        return;
      }
    }

    backendStatus = "unavailable";
  })();
}
