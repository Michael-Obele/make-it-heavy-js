import { Tool } from "./base.tool";
import { create, all } from "mathjs";

const math = create(all);

export const calculatorTool: Tool = {
  name: "calculate",
  description: "Perform mathematical calculations and evaluations",
  parameters: {
    type: "object",
    properties: {
      expression: {
        type: "string",
        description:
          "Mathematical expression to evaluate (e.g., '2 + 3 * 4', 'sqrt(16)', 'sin(pi/2)')",
      },
    },
    required: ["expression"],
  },
  execute: async ({ expression }) => {
    try {
      const result = math.evaluate(expression);
      return { success: true, result };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },
};
