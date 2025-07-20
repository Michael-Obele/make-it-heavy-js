import { runAgent } from "./agent";
import config from "../config";
import {
  enhancedOrchestrate,
  classifyTask,
  getSessionProgress,
  listActiveSessions,
  getSessionSummary,
} from "./enhanced_orchestrator";
import {
  simpleResearchOrchestrate,
  getSimpleProgressStatus,
} from "./simple-research";

export type AgentProgressStatus =
  | "QUEUED"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

// Module-level state for agent progress
const agentProgress: AgentProgressStatus[] = [];
const agentResults: {
  [agentId: number]: { status: string; response: string };
} = {};
let currentNumAgents: number = 0;

export function updateAgentProgress(
  agentId: number,
  status: AgentProgressStatus,
  result?: string,
): void {
  // Ensure array is large enough
  while (agentProgress.length <= agentId) {
    agentProgress.push("QUEUED");
  }
  agentProgress[agentId] = status;
  if (result !== undefined) {
    agentResults[agentId] = { status, response: result };
  }
}

export function getProgressStatus(): AgentProgressStatus[] {
  // Check if enhanced mode is being used
  if (
    config.orchestrator.enhanced_mode &&
    config.orchestrator.task_classification
  ) {
    return getEnhancedProgressStatus();
  }
  return [...agentProgress];
}

async function decomposeTask(
  userInput: string,
  numAgents: number,
): Promise<string[]> {
  const promptTemplate = config.orchestrator.question_generation_prompt;
  const generationPrompt = promptTemplate
    .replace("{user_input}", userInput)
    .replace("{num_agents}", numAgents.toString());

  try {
    const response = await runAgent(generationPrompt, true);
    const questions = JSON.parse(response.trim());
    if (questions.length !== numAgents) {
      throw new Error(
        `Expected ${numAgents} questions, got ${questions.length}`,
      );
    }
    return questions;
  } catch (error) {
    console.error(`Failed to decompose task: ${(error as Error).message}`);
    // Fallback to simple variations
    return [
      `Research comprehensive information about: ${userInput}`,
      `Analyze and provide insights about: ${userInput}`,
      `Find alternative perspectives on: ${userInput}`,
      `Verify and cross-check facts about: ${userInput}`,
    ].slice(0, numAgents);
  }
}

async function aggregateResults(agentResults: any[]): Promise<string> {
  const successfulResults = agentResults.filter((r) => r.status === "success");
  if (successfulResults.length === 0) {
    return "All agents failed to provide results. Please try again.";
  }

  const responses = successfulResults.map((r) => r.response);
  if (responses.length === 1) {
    return responses[0];
  }

  let agentResponsesText = "";
  for (let i = 0; i < responses.length; i++) {
    agentResponsesText += `=== AGENT ${i + 1} RESPONSE ===\n${
      responses[i]
    }\n\n`;
  }

  const synthesisPromptTemplate = config.orchestrator.synthesis_prompt;
  const synthesisPrompt = synthesisPromptTemplate
    .replace("{num_responses}", responses.length.toString())
    .replace("{agent_responses}", agentResponsesText);

  try {
    return await runAgent(synthesisPrompt, true);
  } catch (error) {
    console.error(`Synthesis failed: ${(error as Error).message}`);
    return `Synthesis failed. Raw responses:\n\n${agentResponsesText}`;
  }
}

export async function orchestrate(userInput: string): Promise<string> {
  // Check if enhanced mode is enabled
  if (
    config.orchestrator.enhanced_mode &&
    config.orchestrator.task_classification
  ) {
    console.log(
      "🚀 Using Enhanced Orchestration with Deep Research Capabilities",
    );
    console.log(`📊 Context Window: ${config.agent.context_window} tokens`);
    console.log(
      `🔬 Deep Research Phases: ${config.orchestrator.deep_research_phases}`,
    );

    try {
      // Use enhanced orchestrator with timeout
      const enhancedResult = await Promise.race([
        enhancedOrchestrate(userInput),
        new Promise<string>((_, reject) =>
          setTimeout(
            () => reject(new Error("Enhanced orchestration timeout")),
            30000,
          ),
        ),
      ]);
      return enhancedResult;
    } catch (error) {
      console.warn(
        `Enhanced orchestration failed: ${(error as Error).message}`,
      );
      console.log("🔄 Falling back to Simple Research Mode");
      return await simpleResearchOrchestrate(userInput);
    }
  }

  // Use simple research mode for reliability
  console.log("🔬 Using Simple Research Mode");
  return await simpleResearchOrchestrate(userInput);
}

export async function legacyOrchestrate(userInput: string): Promise<string> {
  // Reset progress tracking for a new orchestration run
  agentProgress.length = 0;
  for (const key in agentResults) {
    delete agentResults[key];
  }

  const numAgents = config.orchestrator.parallel_agents;
  currentNumAgents = numAgents;
  const subtasks = await decomposeTask(userInput, numAgents);

  // Initialize progress tracking
  for (let i = 0; i < numAgents; i++) {
    updateAgentProgress(i, "QUEUED");
  }

  const agentPromises = subtasks.map((subtask, i) => {
    return new Promise<{
      agent_id: number;
      status: string;
      response: string;
    }>(async (resolve) => {
      updateAgentProgress(i, "PROCESSING");
      try {
        const response = await runAgent(subtask, true);
        updateAgentProgress(i, "COMPLETED", response);
        resolve({ agent_id: i, status: "success", response });
      } catch (error) {
        updateAgentProgress(i, "FAILED", (error as Error).message);
        resolve({
          agent_id: i,
          status: "error",
          response: (error as Error).message,
        });
      }
    });
  });

  const allAgentResults = await Promise.allSettled(agentPromises);

  const formattedResults = allAgentResults.map((result, i) => {
    if (result.status === "fulfilled") {
      return result.value;
    } else {
      // This case should ideally be caught by the individual promise's catch block,
      // but it's here for completeness in case of unexpected rejections.
      return {
        agent_id: i,
        status: "error",
        response: (result.reason as Error).message,
      };
    }
  });

  // Sort results by agent_id for consistent output
  formattedResults.sort((a, b) => a.agent_id - b.agent_id);

  return await aggregateResults(formattedResults);
}

// Enhanced orchestration utilities
export function getEnhancedProgressStatus(): AgentProgressStatus[] {
  try {
    const sessions = listActiveSessions();
    if (sessions.length === 0) {
      // Try to get simple research progress if available
      const simpleProgress = getSimpleProgressStatus();
      if (simpleProgress.length > 0) {
        return simpleProgress as AgentProgressStatus[];
      }
      // Return default progress for display consistency
      return Array.from({ length: currentNumAgents || 4 }, () => "QUEUED");
    }

    // Get progress from enhanced orchestrator
    const { getCurrentSessionProgress } = require("./enhanced_orchestrator");
    return getCurrentSessionProgress();
  } catch (error) {
    // Fallback to simple progress or default
    const simpleProgress = getSimpleProgressStatus();
    if (simpleProgress.length > 0) {
      return simpleProgress as AgentProgressStatus[];
    }
    return Array.from({ length: currentNumAgents || 4 }, () => "QUEUED");
  }
}

export function getActiveSessions(): any[] {
  const sessions = listActiveSessions();
  return sessions.map((sessionId) => getSessionSummary(sessionId));
}

export function analyzeTask(userInput: string): any {
  return classifyTask(userInput);
}
