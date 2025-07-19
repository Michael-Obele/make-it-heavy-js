export interface ToolParameter {
  type: string;
  description: string;
  default?: any;
  // Allow 'enum' for string types, which is common in OpenAPI/JSON schema for tool parameters
  enum?: string[];
}

export interface ToolParameters {
  type: "object";
  properties: {
    [key: string]: ToolParameter;
  };
  required: string[];
  // Allow additional properties for more flexible schema definitions
  [key: string]: any;
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
