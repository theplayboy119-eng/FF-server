# Design notes

Architecture (prototype)
- HTTP Gateway (Express) for auth, client module registration, admin APIs
- WebSocket server for realtime inputs & snapshots
- Room workers (in-process for prototype) authoritative tick loop
- PluginManager loads server-side plugins and receives client module descriptors so the server can adapt behavior per-client

Module adaptation
- Clients (APK) can POST module descriptors to /modules/register to inform server which modules/features they support.
- Server-side plugins can listen to the "onClientDescriptor" hook and adapt logic (e.g., enable/disable per-client flows, route requests to different handlers).

Extending to UDP/ENet & protobuf
- A proto file is included (src/proto/game.proto) as a starting point for binary serialization.
- For high performance and smaller packets, integrate protobufjs or a native protobuf implementation and swap JSON messages for binary.

Security & anti-cheat (next steps)
- Add auth flows (JWT, refresh tokens), device fingerprinting
- Server authoritative validation of all actions
- Telemetry + anomaly detection for anti-cheat

