import { z } from "zod";

const configSchema = z.object({
  openrouter: z.object({
    api_key: z.string(),
    base_url: z.url(),
    model: z.string(),
  }),
  system_prompt: z.string(),
  agent: z.object({
    max_iterations: z.number().int().positive(),
  }),
  orchestrator: z.object({
    parallel_agents: z.number().int().positive(),
    task_timeout: z.number().int().positive(),
    aggregation_strategy: z.string(),
    question_generation_prompt: z.string(),
    synthesis_prompt: z.string(),
  }),
  search: z.object({
    max_results: z.number().int().positive(),
    user_agent: z.string(),
  }),
});

const config = {
  openrouter: {
    api_key: process.env.OPENROUTER_API_KEY || "YOUR KEY",
    base_url: process.env.URL || "https://openrouter.ai/api/v1",
    model: process.env.MODEL || "moonshotai/kimi-k2",
  },
  system_prompt: `You are a helpful research assistant. When users ask questions that require current information or web search, use the search_web tool first to get relevant links.

If the search results from search_web are insufficient or if you need more detailed information from a specific link, you MUST then use the browse_link tool with the URL of the relevant page to retrieve its full content.

IMPORTANT: When you have fully satisfied the user's request and provided a complete answer, you MUST call the mark_task_complete tool with a concise, factual summary of what was accomplished in the 'task_summary' argument, and a clear, user-friendly message indicating task completion in the 'completion_message' argument. The 'completion_message' should directly address the user and be suitable for final output. This signals that the task is finished.`,
  agent: {
    max_iterations: 10,
  },
  orchestrator: {
    parallel_agents: 4,
    task_timeout: 300,
    aggregation_strategy: "consensus",
    question_generation_prompt:
      'You are an orchestrator that needs to create {num_agents} different questions to thoroughly analyze this topic from multiple angles.\n\nOriginal user query: {user_input}\n\nGenerate exactly {num_agents} different, specific questions that will help gather comprehensive information about this topic.\nEach question should approach the topic from a different angle (research, analysis, verification, alternatives, etc.).\n\nReturn your response as a JSON array of strings, like this:\n["question 1", "question 2", "question 3", "question 4"]\n\nOnly return the JSON array, nothing else.',
    synthesis_prompt:
      "You have {num_responses} different AI agents that analyzed the same query from different perspectives. \nYour job is to synthesize their responses into ONE comprehensive final answer.\n\nHere are all the agent responses:\n\n{agent_responses}\n\nIMPORTANT: Just synthesize these into ONE final comprehensive answer that combines the best information from all agents. \nDo NOT call mark_task_complete or any other tools. Do NOT mention that you are synthesizing multiple responses. \nSimply provide the final synthesized answer directly as your response.",
  },
  search: {
    max_results: 5,
    user_agent: "Mozilla/5.0 (compatible; OpenRouter Agent)",
  },
};

export default configSchema.parse(config);
