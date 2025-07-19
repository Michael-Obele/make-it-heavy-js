import { Tool } from "./base.tool";

export const taskDoneTool: Tool = {
  name: "mark_task_complete",
  description:
    "REQUIRED: Call this tool when the user's original request has been fully satisfied and you have provided a complete answer. This signals task completion and exits the agent loop.",
  parameters: {
    type: "object",
    properties: {
      task_summary: {
        type: "string",
        description: "Brief summary of what was accomplished",
      },
      completion_message: {
        type: "string",
        description: "Message to show the user indicating the task is complete",
      },
    },
    required: ["task_summary", "completion_message"],
  },
  execute: async ({ task_summary, completion_message }) => {
    return {
      status: "completed",
      task_summary,
      completion_message,
      timestamp: new Date().toISOString(),
    };
  },
};
