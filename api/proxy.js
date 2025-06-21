export default async function handler(req, res) {
  const { API_URL, BACKEND_API_KEY } = process.env;
  const route = req.query.route;

  if (!API_URL || !route) {
    return res.status(400).json({ error: "Missing API_URL or route" });
  }

  const targetUrl = `${API_URL.replace(/\/$/, "")}/${route}`;

  const clientKey = req.headers["x-api-key"];
  if (BACKEND_API_KEY && clientKey !== BACKEND_API_KEY) {
    return res.status(403).json({ error: "Forbidden: Invalid API key" });
  }

  try {
    const fetchOptions = {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        ...(BACKEND_API_KEY && { "x-api-key": BACKEND_API_KEY })
      }
    };

    if (req.method === "POST") {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error("API proxy error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
