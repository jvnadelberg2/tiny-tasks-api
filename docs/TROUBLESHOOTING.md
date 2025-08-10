# Troubleshooting

**Hanging curl**
- Run the server and wait for: “Tiny Tasks API listening on http://localhost:3000”
- Use a second terminal: `curl -v http://127.0.0.1:3000/health`

**400 on POST /tasks**
- Send JSON with header: `Content-Type: application/json`
- Body must include non-empty `"title"`

**404 on /tasks/{id}**
- Task doesn’t exist or was deleted; check `/tasks`

**Port in use**
- Try: `PORT=3001 npm start`
