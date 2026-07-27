// scripts/admin-cli.js
const axios = require('axios');
const base = process.env.SERVER_URL || 'http://localhost:3000';

async function reloadPlugins() {
  const r = await axios.post(base + '/admin/plugin/reload');
  console.log(r.data);
}

if (require.main === module) {
  const cmd = process.argv[2];
  if (cmd === 'reload') reloadPlugins();
}
