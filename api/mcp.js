import { Server } from "@modelcontextprotocol/sdk/server";

const server = new Server({
  name: "todo-mcp",
  version: "1.0.0",
});

// In-memory task list
let tasks = [];
let nextId = 1;

// Add task
server.addTool({
  name: "add_task",
  description: "Add a new task",
  inputSchema: {
    type: "object",
    properties: {
      title: { type: "string" },
      notes: { type: "string" },
      due_date: { type: "string" }
    },
    required: ["title", "due_date"]
  },
  handler: async ({ title, notes, due_date }) => {
    const task = {
      task_id: String(nextId++),
      title,
      notes: notes ?? "",
      due_date,
      status: "pending",
    };
    tasks.push(task);
    return task;
  }
});

// Get tasks
server.addTool({
  name: "get_tasks",
  description: "Get all tasks",
  inputSchema: { type: "object", properties: {} },
  handler: async () => tasks
});

// Update task status
server.addTool({
  name: "update_task_status",
  description: "Update a task",
  inputSchema: {
    type: "object",
    properties: {
      task_id: { type: "string" },
      status: { type: "string", enum: ["pending", "done"] }
    },
    required: ["task_id", "status"]
  },
  handler: async ({ task_id, status }) => {
    const task = tasks.find(t => t.task_id === task_id);
    if (!task) throw new Error("Task not found");
    task.status = status;
    return task;
  }
});

// Node Serverless handler
export default async function handler(req, res) {
  const response = await server.handleHTTP(req, { url: "/mcp" });

  res.status(response.status);
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(response.body));
}
