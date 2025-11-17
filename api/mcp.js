import { Server } from "@modelcontextprotocol/sdk/server";

export const config = {
  runtime: "edge", // Important!
};

// In-memory data
let tasks = [];
let nextId = 1;

const server = new Server({
  name: "todo-mcp",
  version: "1.0.0",
});

// Add a task
server.addTool({
  name: "add_task",
  description: "Add a task with title, notes, and due date.",
  inputSchema: {
    type: "object",
    properties: {
      title: { type: "string" },
      notes: { type: "string" },
      due_date: { type: "string" },
    },
    required: ["title", "due_date"],
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
  },
});

// Get tasks
server.addTool({
  name: "get_tasks",
  description: "Get all tasks.",
  inputSchema: { type: "object", properties: {} },
  handler: async () => tasks,
});

// Update task status
server.addTool({
  name: "update_task_status",
  description: "Update a task status.",
  inputSchema: {
    type: "object",
    properties: {
      task_id: { type: "string" },
      status: { type: "string", enum: ["pending", "done"] },
    },
    required: ["task_id", "status"],
  },
  handler: async ({ task_id, status }) => {
    const task = tasks.find((t) => t.task_id === task_id);
    if (!task) throw new Error("Task not found");
    task.status = status;
    return task;
  },
});

// Edge function handler
export default async function handler(request) {
  const response = await server.handleHTTP(request, { url: "/mcp" });

  return new Response(
    JSON.stringify(response.body),
    {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    }
  );
}
