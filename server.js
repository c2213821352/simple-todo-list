const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;
const dataFile = path.join(__dirname, "todos-data.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function loadTodos() {
  try {
    const raw = fs.readFileSync(dataFile, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function saveTodos(todos) {
  fs.writeFileSync(dataFile, JSON.stringify(todos, null, 2), "utf8");
}

function createId() {
  return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}

app.get("/api/todos", (req, res) => {
  const todos = loadTodos();
  res.json(todos);
});

app.post("/api/todos", (req, res) => {
  const text = (req.body && typeof req.body.text === "string" ? req.body.text : "").trim();
  if (!text) {
    res.status(400).json({ error: "empty_text" });
    return;
  }
  const todos = loadTodos();
  const todo = {
    id: createId(),
    text,
    done: false,
    createdAt: Date.now()
  };
  todos.unshift(todo);
  saveTodos(todos);
  res.status(201).json(todo);
});

app.patch("/api/todos/:id", (req, res) => {
  const id = req.params.id;
  const todos = loadTodos();
  const index = todos.findIndex(t => t.id === id);
  if (index === -1) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const todo = todos[index];
  if (typeof req.body.done === "boolean") {
    todo.done = req.body.done;
  }
  saveTodos(todos);
  res.json(todo);
});

app.delete("/api/todos/:id", (req, res) => {
  const id = req.params.id;
  const todos = loadTodos();
  const index = todos.findIndex(t => t.id === id);
  if (index === -1) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  todos.splice(index, 1);
  saveTodos(todos);
  res.status(204).end();
});

app.listen(port, () => {
  console.log("Todo server listening on port " + port);
});
