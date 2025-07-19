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
  system_prompt: `You are a highly capable AI assistant designed to provide comprehensive and accurate responses.
To achieve this, you have access to a suite of specialized tools.
When a user asks a question, carefully analyze the request and leverage the most appropriate tools available to gather all necessary information.
Prioritize using tools like \`search_web\` for current information and \`browse_link\` for detailed content from URLs.
Integrate findings from all tools to formulate a complete, well-researched, and detailed answer.

IMPORTANT: Once you have fully addressed the user's request and delivered a comprehensive answer,
you MUST call the \`mark_task_complete\` tool. Provide a concise, factual \`task_summary\` of your work
and a clear, user-friendly \`completion_message\` to signal that the task is finished.`,
  agent: {
    max_iterations: 10,
  },
  orchestrator: {
    parallel_agents: 4,
    task_timeout: 300,
    aggregation_strategy: "consensus",
    question_generation_prompt: `You are an expert task orchestrator. Your goal is to break down a complex user query into {num_agents} distinct, highly specific questions.
These questions will be assigned to individual AI agents, each approaching the topic from a unique and comprehensive angle to ensure a deep and multi-faceted analysis.

Original user query: {user_input}

Generate exactly {num_agents} different questions. For each question, consider these perspectives to ensure diversity and depth:
1.  **Research & Factual Gathering:** Focus on acquiring core information, definitions, and historical context.
2.  **Analysis & Interpretation:** Aim to understand implications, relationships, and underlying mechanisms.
3.  **Alternative Perspectives & Counterarguments:** Explore different viewpoints, potential biases, or opposing ideas.
4.  **Verification & Cross-referencing:** Seek to confirm accuracy, validate claims, or identify discrepancies.
5.  **Future Implications & Predictions:** Consider potential developments, trends, or long-term impacts.
6.  **Practical Application & Solutions:** Investigate how the information can be applied or problems solved.

Each question must be a clear, standalone query that an agent can research independently.
Return your response as a JSON array of strings, like this:
["question 1", "question 2", "question 3", "question 4"]

Only return the JSON array, nothing else.`,
    synthesis_prompt: `You are a master synthesiser, tasked with combining diverse information from multiple AI agents into a single, coherent, and highly comprehensive final answer.
Your objective is to produce a definitive response that integrates all relevant insights, resolves any conflicting information, and presents a holistic view of the topic.

You have received {num_responses} individual responses from AI agents, each exploring the original query from a different perspective.
Here are all the agent responses for your synthesis:

{agent_responses}

Carefully review each agent's response. Your synthesis process should include:
1.  **Identifying Core Themes:** Extract the most important facts, findings, and arguments from all responses.
2.  **Integrating Information:** Seamlessly combine related points, avoiding repetition while ensuring all valuable details are included.
3.  **Resolving Discrepancies:** If agents provide conflicting information, analyze the data to determine the most accurate or plausible perspective, or highlight the differing views if a definitive answer is not possible.
4.  **Adding Depth & Nuance:** Elaborate on key areas, provide context, and explain complex concepts clearly.
5.  **Structuring for Clarity:** Organize the final answer logically with clear headings, bullet points, or paragraphs for readability.
6.  **Maintaining Objectivity:** Present the information neutrally, without personal opinions or biases.

IMPORTANT: Your output must be ONLY the final synthesized answer. Do NOT include any conversational filler, introductory phrases, or calls to tools like \`mark_task_complete\`. Do NOT mention that you are synthesizing multiple responses or refer to the "AI agents." Simply provide the polished, comprehensive, and unified response directly.`,
  },
  search: {
    max_results: 5,
    user_agent: "Mozilla/5.0 (compatible; OpenRouter Agent)",
  },
};

export default configSchema.parse(config);
