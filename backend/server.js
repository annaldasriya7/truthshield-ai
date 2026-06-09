app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend is healthy"
  });
});