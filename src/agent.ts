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
      tool_choice: "auto",
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

    // Always add the assistant's message to the conversation history
    messages.push(assistantMessage);

    if (assistantMessage.content) {
      fullResponseContent.push(assistantMessage.content);
    }

    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      if (!silent) {
        console.log(
          `🔧 Agent making ${assistantMessage.tool_calls.length} tool call(s)`
        );
      }

      const toolResponses = [];
      for (const toolCall of assistantMessage.tool_calls) {
        if (!silent) {
          console.log(`   📞 Calling tool: ${toolCall.function.name}`);
        }
        let toolResult = await handleToolCall(toolCall);

        // If search_web fails, try browse_link as a fallback
        if (
          toolCall.function.name === "search_web" &&
          toolResult.content.includes("Search tool failed")
        ) {
          const parsedArgs = JSON.parse(toolCall.function.arguments);
          const query = parsedArgs.query;
          console.warn(
            `Search tool failed for query: "${query}". Attempting to browse for relevant information.`
          );

          // Here, the agent would typically decide which URL to browse.
          // For simplicity, let's assume it would pick the first search result URL if search_web had returned any.
          // Since search_web is returning an error, we can't rely on its results for URLs.
          // This part requires the agent (LLM) to be smart enough to call browse_link.
          // The current setup means the LLM needs to be prompted to do this.
          // We'll rely on the updated system prompt to guide the LLM to use browse_link if search_web fails.
          // The LLM should then call browse_link with a URL it determines relevant.
          // For now, we'll just log the failure and let the LLM decide the next step.
          // If we wanted to force a browse, we'd need to modify the toolResult here or force a browse call.
        }

        toolResponses.push(toolResult);

        if (toolCall.function.name === "mark_task_complete") {
          if (!silent) {
            console.log("✅ Task completion tool called - exiting loop");
          }
          // If mark_task_complete is called, we return immediately after processing its result
          messages.push(toolResult); // Ensure this last tool result is added
          return fullResponseContent.join("\n\n");
        }
      }
      // Add all tool responses to the messages array
      messages.push(...toolResponses);

      if (!silent) {
        console.log(
          "🔄 Agent processed tool calls and continuing with new response"
        );
      }
      // Continue the loop to let the LLM respond to the tool outputs
    } else {
      // If no tool calls, and there's content, or no content (meaning it's done or stuck)
      if (!silent) {
        console.log("💭 Agent responded without tool calls - exiting loop");
      }
      break; // Exit loop if no tool calls and no further action is implied
    }
  }

  return (
    fullResponseContent.join("\n\n") ||
    "Maximum iterations reached. The agent may be stuck in a loop."
  );
}
