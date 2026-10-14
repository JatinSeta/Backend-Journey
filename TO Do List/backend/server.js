const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: [
    "https://backend-journey-frontend-76vz.vercel.app"
  ]
}));

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Add your existing task routes here.

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;