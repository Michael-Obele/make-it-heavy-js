import { runAgent } from "./agent";
import config from "../config";

async function decomposeTask(
  userInput: string,
  numAgents: number
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
        `Expected ${numAgents} questions, got ${questions.length}`
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
  const numAgents = config.orchestrator.parallel_agents;
  const subtasks = await decomposeTask(userInput, numAgents);

  const agentPromises = subtasks.map((subtask, i) =>
    runAgent(subtask, true)
      .then((response) => ({ agent_id: i, status: "success", response }))
      .catch((error) => ({
        agent_id: i,
        status: "error",
        response: (error as Error).message,
      }))
  );

  const agentResults = await Promise.all(agentPromises);
  return await aggregateResults(agentResults);
}
