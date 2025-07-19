import { Tool } from "./base.tool";
import { write } from "bun";

export const writeFileTool: Tool = {
  name: "write_file",
  description:
    "Create a new file or completely overwrite an existing file with new content.",
  parameters: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "The file path to write to",
      },
      content: {
        type: "string",
        description: "The content to write to the file",
      },
    },
    required: ["path", "content"],
  },
  execute: async ({ path, content }) => {
    try {
      await write(path, content);
      return { success: true, message: `Successfully wrote to ${path}` };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },
};
