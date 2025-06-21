export default async function handler(req, res) {
  const { API_URL, BACKEND_API_KEY } = process.env;

  if (!API_URL) {
    return res.status(500).json({ error: "API_URL not configured in environment" });
  }

  // Optional: Validate client API key
  const clientKey = req.headers["x-api-key"];
  if (BACKEND_API_KEY && clientKey !== BACKEND_API_KEY) {
    return res.status(403).json({ error: "Forbidden: Invalid API key" });
  }

  try {
    const response = await fetch(API_URL, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        ...(BACKEND_API_KEY && { "x-api-key": BACKEND_API_KEY })
      },
      ...(req.method === "POST" && { body: JSON.stringify(req.body) })
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error("API proxy error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
