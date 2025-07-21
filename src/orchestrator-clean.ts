import OpenAI from "openai";
import { discoverTools } from "../tools";
import { toOpenRouterSchema, Tool } from "../tools/base.tool";
import config from "../config";
import pRetry from "p-retry";

export type AgentProgressStatus =
  | "QUEUED"
  | "INITIALIZING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export class TaskOrchestrator {
  private client: OpenAI;
  private tools: any[];
  private toolMapping: { [key: string]: (args: any) => Promise<any> };
  private numAgents: number;
  private agentProgress: AgentProgressStatus[] = [];
  private debugMode: boolean = false;

  constructor() {
    this.client = new OpenAI({
      baseURL: config.openrouter.base_url,
      apiKey: config.openrouter.api_key,
    });

    const discoveredTools = discoverTools();
    this.tools = Object.values(discoveredTools).map(toOpenRouterSchema);
    this.toolMapping = Object.fromEntries(
      Object.values(discoveredTools).map((tool: Tool) => [
        tool.name,
        tool.execute,
      ]),
    );

    this.numAgents = config.orchestrator.parallel_agents;
    this.debugMode =
      process.env.DEBUG === "true" || process.argv.includes("--debug");

    if (this.debugMode) {
      console.log(
        `[DEBUG] Orchestrator initialized with ${this.numAgents} agents`,
      );
      console.log(`[DEBUG] Model: ${config.openrouter.model}`);
      console.log(
        `[DEBUG] Max iterations per agent: ${config.agent.max_iterations}`,
      );
    }
  }

  public getNumAgents(): number {
    return this.numAgents;
  }

  public getProgressStatus(): AgentProgressStatus[] {
    return [...this.agentProgress];
  }

  private updateAgentProgress(
    agentId: number,
    status: AgentProgressStatus,
  ): void {
    // Ensure array is large enough
    while (this.agentProgress.length <= agentId) {
      this.agentProgress.push("QUEUED");
    }
    this.agentProgress[agentId] = status;

    if (this.debugMode) {
      console.log(`[DEBUG] Agent ${agentId}: ${status}`);
    }
  }

  private async decomposeTask(userInput: string): Promise<string[]> {
    // Use a simpler, more reliable approach for task decomposition
    const systemPrompt = `You are a task decomposition expert.
Your task is to create exactly ${this.numAgents} different research questions about the user's query.

CRITICAL: You must return exactly ${this.numAgents} questions, no more, no less.
Return ONLY a JSON array of strings, nothing else.

Example format: ["question1", "question2", "question3", "question4"]`;

    const userPrompt = `Break down this query into exactly ${this.numAgents} different research questions: "${userInput}"

Each question should focus on a different aspect:
1. Basic definition and overview
2. Current trends and developments
3. Different perspectives and applications
4. Future implications and analysis

Return ONLY the JSON array of ${this.numAgents} questions.`;

    try {
      const response = await this.callLLM([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ]);

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No content in decomposition response");
      }

      // Try to extract JSON from the response
      let questions;
      try {
        // Clean the content - remove any markdown formatting or extra text
        const cleanContent = content.trim();
        const jsonMatch = cleanContent.match(/\[.*\]/s);
        const jsonStr = jsonMatch ? jsonMatch[0] : cleanContent;
        questions = JSON.parse(jsonStr);
      } catch (parseError) {
        throw new Error(`Failed to parse JSON: ${content}`);
      }

      if (!Array.isArray(questions)) {
        throw new Error("Response is not an array");
      }

      // Ensure we have exactly the right number of questions
      if (questions.length !== this.numAgents) {
        if (questions.length > this.numAgents) {
          questions = questions.slice(0, this.numAgents);
        } else {
          // Pad with fallback questions if needed
          while (questions.length < this.numAgents) {
            questions.push(`Additional research on: ${userInput}`);
          }
        }
      }

      if (this.debugMode) {
        console.log("[DEBUG] Task decomposed successfully into:", questions);
      }

      return questions;
    } catch (error) {
      console.error(
        `[ERROR] Failed to decompose task: ${(error as Error).message}`,
      );
      if (this.debugMode) {
        console.error(`[DEBUG] Full decomposition error:`, error);
      }
      // Fallback to simple variations
      const fallbacks = [
        `Research comprehensive information about: ${userInput}`,
        `Analyze and provide insights about: ${userInput}`,
        `Find alternative perspectives on: ${userInput}`,
        `Verify and cross-check facts about: ${userInput}`,
        `Explore practical applications of: ${userInput}`,
        `Investigate future implications of: ${userInput}`,
      ];
      return fallbacks.slice(0, this.numAgents);
    }
  }

  private async callLLM(messages: any[]): Promise<any> {
    return await pRetry(
      async () => {
        const response = await this.client.chat.completions.create({
          model: config.openrouter.model,
          messages,
          tools: this.tools,
          tool_choice: "auto",
          temperature: config.agent.temperature || 0.7,
        });

        if (!response || !response.choices || response.choices.length === 0) {
          throw new Error("Invalid LLM response received");
        }
        return response;
      },
      {
        retries: 3,
        minTimeout: 1000,
        maxTimeout: 30000,
        onFailedAttempt: (error: any) => {
          console.warn(`[RETRY] LLM call failed, retrying: ${error.message}`);
          if (this.debugMode) {
            console.log(`[DEBUG] Retry attempt details:`, error);
          }
        },
      },
    );
  }

  private async handleToolCall(toolCall: any): Promise<any> {
    try {
      const toolName = toolCall.function.name;
      const toolArgs = JSON.parse(toolCall.function.arguments);

      if (this.debugMode) {
        console.log(`[DEBUG] Executing tool: ${toolName} with args:`, toolArgs);
      }

      if (this.toolMapping[toolName]) {
        const toolResult = await this.toolMapping[toolName](toolArgs);
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
      if (this.debugMode) {
        console.log(
          `[DEBUG] Tool execution failed: ${(error as Error).message}`,
        );
      }
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

  private async runAgent(
    agentId: number,
    subtask: string,
  ): Promise<{
    agent_id: number;
    status: string;
    response: string;
  }> {
    try {
      this.updateAgentProgress(agentId, "INITIALIZING");

      const messages = [
        { role: "system", content: config.system_prompt },
        { role: "user", content: subtask },
      ];

      const fullResponseContent: string[] = [];
      const maxIterations = config.agent.max_iterations;
      let iteration = 0;

      this.updateAgentProgress(agentId, "PROCESSING");

      while (iteration < maxIterations) {
        iteration++;

        if (this.debugMode) {
          console.log(
            `[DEBUG] Agent ${agentId} iteration ${iteration}/${maxIterations}`,
          );
        }

        const response = await this.callLLM(messages);
        const assistantMessage = response.choices[0].message;

        messages.push(assistantMessage);

        if (assistantMessage.content) {
          fullResponseContent.push(assistantMessage.content);
        }

        if (
          assistantMessage.tool_calls &&
          assistantMessage.tool_calls.length > 0
        ) {
          const toolResponses = [];
          for (const toolCall of assistantMessage.tool_calls) {
            const toolResult = await this.handleToolCall(toolCall);
            toolResponses.push(toolResult);

            if (toolCall.function.name === "mark_task_complete") {
              this.updateAgentProgress(agentId, "COMPLETED");
              return {
                agent_id: agentId,
                status: "success",
                response: fullResponseContent.join("\n\n"),
              };
            }
          }
          messages.push(...toolResponses);
        } else {
          // No tool calls, agent finished naturally
          break;
        }
      }

      if (iteration >= maxIterations) {
        this.updateAgentProgress(agentId, "FAILED");
        return {
          agent_id: agentId,
          status: "error",
          response: `Agent ${agentId}: Maximum iterations reached`,
        };
      } else {
        this.updateAgentProgress(agentId, "COMPLETED");
        return {
          agent_id: agentId,
          status: "success",
          response: fullResponseContent.join("\n\n"),
        };
      }
    } catch (error) {
      this.updateAgentProgress(agentId, "FAILED");
      console.error(
        `[ERROR] Agent ${agentId} failed: ${(error as Error).message}`,
      );
      if (this.debugMode) {
        console.error(`[DEBUG] Agent ${agentId} full error:`, error);
      }
      return {
        agent_id: agentId,
        status: "error",
        response: `Agent execution failed: ${(error as Error).message}`,
      };
    }
  }

  private async aggregateResults(agentResults: any[]): Promise<string> {
    const successfulResults = agentResults.filter(
      (r) => r.status === "success",
    );

    if (successfulResults.length === 0) {
      return "All agents failed to provide results. Please try again.";
    }

    const responses = successfulResults.map((r) => r.response);
    if (responses.length === 1) {
      return responses[0];
    }

    let agentResponsesText = "";
    for (let i = 0; i < responses.length; i++) {
      agentResponsesText += `=== AGENT ${i + 1} RESPONSE ===\n${responses[i]}\n\n`;
    }

    const synthesisPromptTemplate = config.orchestrator.synthesis_prompt;
    const synthesisPrompt = synthesisPromptTemplate
      .replace("{num_responses}", responses.length.toString())
      .replace("{total_context_tokens}", "200000")
      .replace("{domain}", "general")
      .replace("{complexity}", "medium")
      .replace("{agent_responses}", agentResponsesText);

    try {
      const response = await this.callLLM([
        {
          role: "system",
          content:
            "You are an expert synthesizer. Create a comprehensive response.",
        },
        { role: "user", content: synthesisPrompt },
      ]);

      const finalResult = response.choices[0].message.content;
      if (!finalResult) {
        throw new Error("No content in synthesis response");
      }

      return finalResult;
    } catch (error) {
      console.error(`[ERROR] Synthesis failed: ${(error as Error).message}`);
      if (this.debugMode) {
        console.error(`[DEBUG] Synthesis full error:`, error);
      }
      return `Synthesis failed. Raw responses:\n\n${agentResponsesText}`;
    }
  }

  public async orchestrate(userInput: string): Promise<string> {
    // Reset progress tracking
    this.agentProgress = [];
    for (let i = 0; i < this.numAgents; i++) {
      this.updateAgentProgress(i, "QUEUED");
    }

    if (this.debugMode) {
      console.log(
        `[DEBUG] Starting orchestration with ${this.numAgents} agents`,
      );
    }

    // Decompose task
    const subtasks = await this.decomposeTask(userInput);

    // Run agents in parallel
    const agentPromises = subtasks.map((subtask, index) =>
      this.runAgent(index, subtask),
    );

    const agentResults = await Promise.all(agentPromises);

    // Log completion status
    const successfulAgents = agentResults.filter(
      (r) => r.status === "success",
    ).length;
    const failedAgents = agentResults.filter(
      (r) => r.status === "error",
    ).length;

    console.log(
      `[INFO] Agents completed - Success: ${successfulAgents}, Failed: ${failedAgents}`,
    );

    if (this.debugMode) {
      console.log("[DEBUG] All agents completed with detailed results:");
      agentResults.forEach((result) => {
        console.log(`[DEBUG] Agent ${result.agent_id}: ${result.status}`);
        if (result.status === "error") {
          console.log(
            `[DEBUG] Agent ${result.agent_id} error: ${result.response}`,
          );
        }
      });
    }

    // Aggregate results
    const finalReport = await this.aggregateResults(agentResults);

    return finalReport;
  }
}
