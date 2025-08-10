docs/FAQ.md

```md
# FAQ

**Why no framework?**  
To keep it dependency-free and highlight core Node knowledge.

**Why in-memory tasks?**  
Simplicity for a demo. Swap to a real store if you extend it.

**Where’s update (PUT/PATCH)?**  
Omitted to keep the surface area small; easy follow-up exercise.

**How do I view the API docs nicely?**  
Open `docs/site/openapi.html` in a browser (renders the OpenAPI spec with Redoc).

**What Node version is required?**  
Node 18+ (uses the built-in test runner and modern APIs).

**How do I change the port?**  
Run with `PORT=8080 npm start`.

**Any known limitations?**  
No auth, rate limiting, or persistence. See `docs/SECURITY.md` for production guidance.
```
