const APPEND_TO_RESPONSE = new Set(["images", "videos", "credits", "recommendations", "similar"]);

/** Rebuilds the query string from allowed params only, in a fixed order. */
export const sanitizeParams = (searchParams: URLSearchParams): URLSearchParams | null => {
  const params = new URLSearchParams();

  const page = searchParams.get("page");
  if (page !== null) {
    const n = Number(page);
    if (!Number.isInteger(n) || n < 1 || n > 500) return null;
    params.set("page", String(n));
  }

  const query = searchParams.get("query");
  if (query !== null) {
    const q = query.trim();
    if (!q || q.length > 100) return null;
    params.set("query", q);
  }

  const genres = searchParams.get("with_genres");
  if (genres !== null) {
    if (!/^[\d,|]*$/.test(genres)) return null;
    if (genres) params.set("with_genres", genres);
  }

  const originCountry = searchParams.get("with_origin_country");
  if (originCountry !== null) {
    if (!/^[A-Z]{2}(,[A-Z]{2})*$/.test(originCountry)) return null;
    params.set("with_origin_country", originCountry);
  }

  const append = searchParams.get("append_to_response");
  if (append !== null) {
    const values = append.split(",").filter(Boolean);
    if (!values.every((v) => APPEND_TO_RESPONSE.has(v))) return null;
    if (values.length) params.set("append_to_response", values.join(","));
  }

  const imageLanguage = searchParams.get("include_image_language");
  if (imageLanguage !== null) {
    if (!/^[a-z]{2}(,[a-z]{2}|,null)*$|^null$/.test(imageLanguage)) return null;
    params.set("include_image_language", imageLanguage);
  }

  return params;
};

const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

const sleep = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

export const fetchWithRetry = async (
  url: string,
  init: RequestInit,
  options: { attempts?: number; baseDelayMs?: number } = {},
): Promise<Response> => {
  const attempts = options.attempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 250;
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetch(url, init);
      if (attempt === attempts || !RETRYABLE_STATUS.has(response.status)) return response;

      const retryAfter = Number(response.headers.get("retry-after"));
      const delay =
        Number.isFinite(retryAfter) && retryAfter > 0
          ? retryAfter * 1000
          : baseDelayMs * 2 ** (attempt - 1);
      await sleep(delay);
    } catch (error) {
      lastError = error;
      if (attempt === attempts) throw error;
      await sleep(baseDelayMs * 2 ** (attempt - 1));
    }
  }

  throw lastError instanceof Error ? lastError : new Error("TMDB request failed");
};
