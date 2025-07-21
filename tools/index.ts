import { Tool } from "./base.tool";
import { browseLinkTool } from "./browse.tool";
import { calculatorTool } from "./calculator.tool";
import { searchWebTool } from "./search.tool";
import { taskDoneTool } from "./task_done.tool";

// Research-focused tool configuration
// Removed: code execution, project management, file operations, data analysis (had errors)
// Focus: web research, content analysis, basic calculations
export const tools: Tool[] = [
  browseLinkTool, // For deep web content research
  searchWebTool, // For comprehensive web search
  calculatorTool, // For research calculations and statistics
  taskDoneTool, // For marking research completion
];

export function discoverTools(): { [key: string]: Tool } {
  const allTools: { [key: string]: Tool } = {};
  for (const tool of tools) {
    allTools[tool.name] = tool;
  }
  return allTools;
}
