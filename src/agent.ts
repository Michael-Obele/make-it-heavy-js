import OpenAI from "openai";
import { discoverTools } from "@/tools";
import { toOpenRouterSchema, Tool } from "@/tools/base.tool";

// We will create this config file later
import config from "../config";

const client = new OpenAI({
  baseURL: config.openrouter.base_url,
  apiKey: config.openrouter.api_key,
});

const discoveredTools = discoverTools();
const tools: any = Object.values(discoveredTools).map(toOpenRouterSchema);
const toolMapping: { [key: string]: (args: any) => Promise<any> } =
  Object.fromEntries(
    Object.values(discoveredTools).map((tool: Tool) => [
      tool.name,
      tool.execute,
    ])
  );

async function callLLM(messages: any[]) {
  try {
    return await client.chat.completions.create({
      model: config.openrouter.model,
      messages,
      tools,
    });
  } catch (error) {
    throw new Error(`LLM call failed: ${(error as Error).message}`);
  }
}

async function handleToolCall(toolCall: any) {
  try {
    const toolName = toolCall.function.name;
    const toolArgs = JSON.parse(toolCall.function.arguments);

    if (toolMapping[toolName]) {
      const toolResult = await toolMapping[toolName](toolArgs);
      return {
        role: "tool",
        tool_call_id: toolCall.id,
        name: toolName,
        content: JSON.stringify(toolResult),
      };
    } else {
      return {
        role: "tool",
        tool_call_id: toolCall.id,
        name: toolName,
        content: JSON.stringify({ error: `Unknown tool: ${toolName}` }),
      };
    }
  } catch (error) {
    return {
      role: "tool",
      tool_call_id: toolCall.id,
      name: toolCall.function.name,
      content: JSON.stringify({
        error: `Tool execution failed: ${(error as Error).message}`,
      }),
    };
  }
}

export async function runAgent(userInput: string, silent = false) {
  const messages: any[] = [
    { role: "system", content: config.system_prompt },
    { role: "user", content: userInput },
  ];

  const fullResponseContent: string[] = [];
  const maxIterations = config.agent.max_iterations;
  let iteration = 0;

  while (iteration < maxIterations) {
    iteration++;
    if (!silent) {
      console.log(`🔄 Agent iteration ${iteration}/${maxIterations}`);
    }

    const response = await callLLM(messages);
    const assistantMessage = response.choices[0].message;

    messages.push({
      role: "assistant",
      content: assistantMessage.content,
      tool_calls: assistantMessage.tool_calls,
    });

    if (assistantMessage.content) {
      fullResponseContent.push(assistantMessage.content);
    }

    if (assistantMessage.tool_calls) {
      if (!silent) {
        console.log(
          `🔧 Agent making ${assistantMessage.tool_calls.length} tool call(s)`
        );
      }

      let taskCompleted = false;
      for (const toolCall of assistantMessage.tool_calls) {
        if (!silent) {
          console.log(`   📞 Calling tool: ${toolCall.function.name}`);
        }
        const toolResult = await handleToolCall(toolCall);
        messages.push(toolResult);

        if (toolCall.function.name === "mark_task_complete") {
          taskCompleted = true;
          if (!silent) {
            console.log("✅ Task completion tool called - exiting loop");
          }
          return fullResponseContent.join("\n\n");
        }
      }

      if (taskCompleted) {
        return fullResponseContent.join("\n\n");
      }
    } else {
      if (!silent) {
        console.log("💭 Agent responded without tool calls - continuing loop");
      }
    }
  }

  return (
    fullResponseContent.join("\n\n") ||
    "Maximum iterations reached. The agent may be stuck in a loop."
  );
}
