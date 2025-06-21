export default async function handler(req, res) {
  const { API_URL, BACKEND_API_KEY } = process.env;
  const route = req.query.route;

  if (!API_URL || !route) {
    return res.status(400).json({ error: "Missing API_URL or route" });
  }

  try {
    const response = await fetch(`${API_URL}/${route}`, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": BACKEND_API_KEY, 
      },
      ...(req.method === "POST" && { body: JSON.stringify(req.body) }),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error("API proxy error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
