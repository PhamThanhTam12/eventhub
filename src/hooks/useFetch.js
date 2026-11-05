import { useEffect, useState } from "react";
import { apiRequest } from "../services/apiClient";

// Reusable GET with cleanup. The request key also prevents stale data on URL changes.
export default function useFetch(path, { allowNotFound = false, collection = false } = {}) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState({ key: null, data: null, error: "" });
  const requestKey = path + ":" + allowNotFound + ":" + collection + ":" + attempt;

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const data = await apiRequest(path, {
          signal: controller.signal,
          allowNotFound,
        });

        if (collection && !Array.isArray(data)) {
          throw new Error("Danh sách dữ liệu không hợp lệ. Vui lòng kiểm tra MockAPI.");
        }

        if (!controller.signal.aborted) {
          setResult({ key: requestKey, data, error: "" });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setResult({ key: requestKey, data: null, error: error.message });
        }
      }
    }

    load();
    return () => controller.abort();
  }, [path, allowNotFound, collection, requestKey]);

  const isLoading = result.key !== requestKey;

  return {
    data: isLoading ? null : result.data,
    error: isLoading ? "" : result.error,
    isLoading,
    retry: () => setAttempt((current) => current + 1),
  };
}
