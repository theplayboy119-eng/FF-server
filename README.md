# FF-Server (prototype)

Prototype authoritative game server scaffold (independent). This repository contains a basic Node.js + WebSocket authoritative server with a plugin/module system, a simple matchmaker/room implementation, and helper infra to run locally.

Important: This project is independent and must not be used to connect to proprietary/official services. Designed to work with your independent client.

What is included
- Express HTTP gateway + WebSocket realtime server
- Room implementation with authoritative tick loop
- Plugin manager (hot-reloadable) and HTTP endpoints to register client modules
- Example web client to test realtime behavior
- Dockerfile + docker-compose for local testing

Run locally (dev)
1. Install dependencies:
   npm install
2. Start server in dev mode:
   npm run dev
3. Open client in browser: client/web-client.html

Run with Docker
1. docker-compose up --build

Branch: feature/initial-scaffold
