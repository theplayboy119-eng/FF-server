# Running the prototype

Prerequisites: Node 18+, npm, Docker (optional)

Dev
1. npm install
2. npm run dev
3. Open client/web-client.html in a browser (or serve it with a static server)

Docker
1. docker-compose up --build

Notes about client modules
- The server exposes an HTTP endpoint /modules/register where a client can POST a small JSON descriptor describing a module it supports. The server stores the descriptor and can route subsequent HTTP requests to server-side plugin hooks.
- This enables your APK/client to announce modules (features/plugins) during a handshake and for the server to adapt behavior accordingly.
