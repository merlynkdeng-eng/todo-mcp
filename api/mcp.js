import { Server } from "@modelcontextprotocol/sdk/server";

let tasks = [];
let nextId = 1;

const server = new Server({
  name: "todo-mcp",
  version: "1.0.0"
});

// ---- TOOL: add_task ----
server.addTool({
  name: "add_task",
  description: "Add a task with title, notes, and due date.",
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
      status: "pending"
    };
    tasks.push(task);
    return task;
  }
});

// ---- TOOL: get_tasks ----
server.addTool({
  name: "get_tasks",
  description: "Get all tasks",
  inputSchema: { type: "object", properties: {} },
  handler: async () => tasks
});

// ---- TOOL: update_task_status ----
server.addTool({
  name: "update_task_status",
  description: "Update a task’s status by ID.",
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

// Export for Vercel
export default async function handler(req, res) {
  const response = await server.handleHTTP(req, { url: "/mcp" });
  res.status(response.status).send(response.body);
}
