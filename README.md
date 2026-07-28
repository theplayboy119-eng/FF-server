# FF-server

Prototype authoritative game server (independent). This branch contains a more complete stack (Postgres, Redis, Auth, WebSocket server).

Quick start (local with docker-compose):

1. Copy env and edit if needed:
   cp .env.example .env

2. Start services:
   docker-compose up --build

3. Apply DB migrations (inside the server container or locally with Node):
   # from host (requires node & deps installed):
   npm install
   npm run migrate

4. Server will be available at http://localhost:3000 and WebSocket at ws://localhost:3000

API highlights:
- POST /auth/register { username, password }
- POST /auth/login { username, password }
- GET /health
- WebSocket protocol: JSON messages for join/input/snapshot

Notes:
- This is a prototype. Data persistence uses Postgres; Redis is used for future features (matchmaking, sessions).
