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
