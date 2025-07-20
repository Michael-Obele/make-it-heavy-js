import { Tool } from "./base.tool";
import { browseLinkTool } from "./browse.tool";
import { calculatorTool } from "./calculator.tool";
import { searchWebTool } from "./search.tool";
import { taskDoneTool } from "./task_done.tool";
import { dataAnalysisTool } from "./data_analysis.tool";

// Research-focused tool configuration
// Removed: code execution, project management, file operations
// Focus: web research, data analysis, content synthesis
export const tools: Tool[] = [
  browseLinkTool, // For deep web content research
  searchWebTool, // For comprehensive web search
  dataAnalysisTool, // For research data analysis (trends, insights)
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
