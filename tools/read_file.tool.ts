import { Tool } from "./base.tool";
import { file } from "bun";

export const readFileTool: Tool = {
  name: "read_file",
  description: "Read the complete contents of a file from the file system.",
  parameters: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "The file path to read",
      },
    },
    required: ["path"],
  },
  execute: async ({ path }) => {
    try {
      const f = file(path);
      const content = await f.text();
      return { success: true, content };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },
};
