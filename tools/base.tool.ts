export interface ToolParameter {
  type: string;
  description: string;
  default?: any;
}

export interface ToolParameters {
  type: "object";
  properties: {
    [key: string]: ToolParameter;
  };
  required: string[];
}

export interface Tool {
  name: string;
  description: string;
  parameters: ToolParameters;
  execute: (args: any) => Promise<any>;
}

export function toOpenRouterSchema(tool: Tool) {
  return {
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  };
}
