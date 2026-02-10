import axios from "axios";

// Determine backend API base. Expect it to be something like http://host:port/api
const rawBase = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";

// Normalize common misconfigurations like including a resource segment (e.g. /api/auth)
// This ensures service calls like "/auth/me" become "<base>/auth/me" rather than duplicating segments.
let normalizedBase = rawBase
  // Strip trailing slashes
  .replace(/\/+$/, "")
  // If someone set base to /api/<resource>..., collapse to just /api
  .replace(/\/api\/(auth|contracts|disputes|freelancer)(?=\/|$).*$/, "/api");

export const api = axios.create({ baseURL: normalizedBase });

export const registerApi = api; // kept for compatibility

let onUnauthorized = null;
export const setOnUnauthorized = (handler) => {
  onUnauthorized = handler;
};

const attachAuth = (instance) => {
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  // Simple port failover: if base is localhost:8000 and we get a 404/Network error,
  // retry once against localhost:5000 (and vice versa). Prevents misconfigured envs from breaking UX.
  const retried = new WeakSet();
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error?.response?.status;
      if (status === 401 && typeof onUnauthorized === "function") {
        onUnauthorized();
      }

      const cfg = error?.config;
      if (!cfg || retried.has(cfg)) {
        return Promise.reject(error);
      }
      const isNetworkErr = !error.response;
      const isRetryable =
        isNetworkErr || status === 404 || status === 502 || status === 503;
      if (!isRetryable) return Promise.reject(error);

      try {
        const currentBase = new URL(instance.defaults.baseURL);
        if (currentBase.hostname !== "localhost") return Promise.reject(error);

        let altPort;
        if (currentBase.port === "8000") altPort = "5000";
        else if (currentBase.port === "5000" || currentBase.port === "")
          altPort = "8000";
        else return Promise.reject(error);

        const altBase =
          `${currentBase.protocol}//${currentBase.hostname}:${altPort}${currentBase.pathname}`.replace(
            /\/+$/,
            "",
          );
        retried.add(cfg);

        // Try request against alternate base
        const newCfg = { ...cfg, baseURL: altBase };
        const res = await axios.request(newCfg);
        // If success, switch default base for future calls
        instance.defaults.baseURL = altBase;
        return res;
      } catch (e) {
        return Promise.reject(error);
      }
    },
  );
};

attachAuth(api);

export default api;
