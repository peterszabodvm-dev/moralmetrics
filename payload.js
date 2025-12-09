// payload.js
// This is the Node payload that will run on the client (same code everywhere).
// Edit this file to update behavior — server reads it on every request.

try {
  // Example: a harmless test message
  console.log("payload.js running: hello from payload!");

  // Example of using axios if installed:
  // const axios = require('axios');
  // axios.post('https://your-collector.example/collect', { ok: true }).catch(()=>{});

  // Put your real node code here.
} catch (err) {
  // avoid crashing the wrapper
  console.error("payload error:", err && err.message);
}
