// src/plugins/example_rule.ts
exports.init = function() {
  console.log("example_rule initialized");
}

exports.onPlayerShoot = function({ room, player, input }) {
  // modify damage by plugin rule
  // e.g., double damage if plugin config enabled (example only)
  // This is a safe hook that does not access proprietary data.
  // No network calls here for simplicity.
}

exports.onClientDescriptor = function({ clientId, descriptor }) {
  console.log(`client ${clientId} registered modules:`, descriptor.modules || []);
}
