// In-memory state resets on isolate recycling/redeploy — expected, no persistence required.
let todos = [];
let nextId = 1;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export default {
  async fetch(request) {
    const { pathname } = new URL(request.url);
    const method = request.method;

    if (method === "GET" && pathname === "/todos") {
      return json(todos);
    }

    if (method === "POST" && pathname === "/todos") {
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "Invalid JSON body" }, 400);
      }

      const title = typeof body?.title === "string" ? body.title.trim() : "";
      if (!title) {
        return json({ error: "title is required" }, 400);
      }

      const todo = { id: nextId++, title, done: false };
      todos.push(todo);
      return json(todo, 201);
    }

    const doneMatch = pathname.match(/^\/todos\/([^/]+)\/done$/);
    if (method === "POST" && doneMatch) {
      const id = Number(doneMatch[1]);
      const todo = todos.find((t) => t.id === id);
      if (!todo) {
        return json({ error: "Todo not found" }, 404);
      }
      todo.done = true;
      return json(todo);
    }

    return json({ error: "Not found" }, 404);
  },
};
