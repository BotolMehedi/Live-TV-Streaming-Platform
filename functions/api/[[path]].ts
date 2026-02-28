export interface Env {
  DB: D1Database;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

async function verifyAuth(request: Request, db: D1Database) {
  const auth = request.headers.get("Authorization");
  if (!auth?.startsWith("Basic ")) return false;

  const decoded = atob(auth.slice(6));
  const [username, password] = decoded.split(":");

  const row = await db
    .prepare("SELECT * FROM admin WHERE id = 1")
    .first<{ username: string; password: string }>();

  if (!row) return false;
  return row.username === username && row.password === password;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  if (request.method === "OPTIONS") {
    return json({}, 200);
  }

  // ================= PUBLIC =================

  if (path === "/api/playlists" && request.method === "GET") {
    const type = url.searchParams.get("type") || "tv";

    const rows = await env.DB.prepare(
      "SELECT url FROM playlists WHERE type = ? ORDER BY sort_order ASC"
    )
      .bind(type)
      .all<{ url: string }>();

    return json({ urls: rows.results.map((r) => r.url) });
  }

  if (path === "/api/admin/login" && request.method === "POST") {
    const body = await request.json<{ username: string; password: string }>();

    const row = await env.DB.prepare(
      "SELECT * FROM admin WHERE id = 1"
    ).first<{ username: string; password: string }>();

    if (row && row.username === body.username && row.password === body.password) {
      const token = btoa(`${body.username}:${body.password}`);
      return json({ success: true, token });
    }

    return json({ error: "Invalid credentials" }, 401);
  }

  // ================= ADMIN =================

  if (path === "/api/admin/playlists" && request.method === "GET") {
    if (!(await verifyAuth(request, env.DB)))
      return json({ error: "Unauthorized" }, 401);

    const type = url.searchParams.get("type") || "tv";

    const rows = await env.DB.prepare(
      "SELECT id, url, sort_order FROM playlists WHERE type = ? ORDER BY sort_order ASC"
    )
      .bind(type)
      .all();

    return json({ playlists: rows.results });
  }

  if (path === "/api/admin/playlists" && request.method === "PUT") {
    if (!(await verifyAuth(request, env.DB)))
      return json({ error: "Unauthorized" }, 401);

    const body = await request.json<{ type: string; urls: string[] }>();

    await env.DB.prepare("DELETE FROM playlists WHERE type = ?")
      .bind(body.type)
      .run();

    const stmt = env.DB.prepare(
      "INSERT INTO playlists (url, type, sort_order) VALUES (?, ?, ?)"
    );

    const batch = body.urls.map((u, i) =>
      stmt.bind(u, body.type, i + 1)
    );

    if (batch.length) await env.DB.batch(batch);

    return json({ success: true });
  }

  return json({ error: "Not found" }, 404);
};
