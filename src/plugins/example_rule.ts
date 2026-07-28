// src/plugins/example_rule.ts
exports.init = function() {
  console.log("example_rule initialized");
}

// annotate destructured params to avoid implicit any errors during tsc
exports.onPlayerShoot = function({ room, player, input }: any) {
  // modify damage by plugin rule
  // e.g., double damage if plugin config enabled (example only)
  // This is a safe hook that does not access proprietary data.
  // No network calls here for simplicity.
}

exports.onClientDescriptor = function({ clientId, descriptor }: any) {
  console.log(`client ${clientId} registered modules:`, descriptor.modules || []);
}
