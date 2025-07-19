import { Tool } from "./base.tool";
import { browseLinkTool } from "./browse.tool";
import { calculatorTool } from "./calculator.tool";
import { readFileTool } from "./read_file.tool";
import { searchWebTool } from "./search.tool";
import { taskDoneTool } from "./task_done.tool";
import { writeFileTool } from "./write_file.tool";

export const tools: Tool[] = [
  browseLinkTool,
  calculatorTool,
  readFileTool,
  searchWebTool,
  taskDoneTool,
  writeFileTool,
];

export function discoverTools(): { [key: string]: Tool } {
  const allTools: { [key: string]: Tool } = {};
  for (const tool of tools) {
    allTools[tool.name] = tool;
  }
  return allTools;
}
