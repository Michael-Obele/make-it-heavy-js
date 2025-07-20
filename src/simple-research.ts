import { runAgent } from "./agent";
import config from "../config";
import {
  enhancedUpdateDisplay,
  enhancedStartupDisplay,
  displayFinalResults,
  startProgressMonitor,
} from "./utils/enhanced-cli-display";
import { logError, logInfo, statusIndicator } from "./utils/cli-styling";

export type SimpleProgressStatus = "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";

// Simple progress tracking for display
const agentProgress: SimpleProgressStatus[] = [];
let currentNumAgents: number = 4;

export function updateSimpleProgress(
  agentId: number,
  status: SimpleProgressStatus,
): void {
  // Ensure array is large enough
  while (agentProgress.length <= agentId) {
    agentProgress.push("QUEUED");
  }
  agentProgress[agentId] = status;
}

export function getSimpleProgressStatus(): SimpleProgressStatus[] {
  return [...agentProgress];
}

// Simplified research orchestration
export async function simpleResearchOrchestrate(query: string): Promise<string> {
  console.log(`🔬 Starting Simple Research Mode for: ${query}`);

  // Reset progress tracking
  agentProgress.length = 0;
  currentNumAgents = config.orchestrator.parallel_agents;

  // Initialize progress tracking
  for (let i = 0; i < currentNumAgents; i++) {
    updateSimpleProgress(i, "QUEUED");
  }

  // Create focused research queries
  const researchQueries = generateSimpleResearchQueries(query, currentNumAgents);

  console.log(`📋 Generated ${researchQueries.length} research queries:`);
  researchQueries.forEach((q, i) => {
    console.log(`  ${i + 1}. ${q.slice(0, 80)}...`);
  });

  // Execute research queries in parallel
  const researchPromises = researchQueries.map((researchQuery, index) => {
    return executeSimpleResearch(researchQuery, index);
  });

  console.log(`🚀 Executing ${researchPromises.length} research tasks...`);

  const results = await Promise.allSettled(researchPromises);

  // Process results
  const successfulResults: any[] = [];
  const failedResults: any[] = [];

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      successfulResults.push({
        index,
        query: researchQueries[index],
        result: result.value,
        status: "success"
      });
    } else {
      failedResults.push({
        index,
        query: researchQueries[index],
        error: result.reason?.message || "Unknown error",
        status: "failed"
      });
    }
  });

  console.log(`✅ Research completed: ${successfulResults.length} successful, ${failedResults.length} failed`);

  // Synthesize results
  if (successfulResults.length === 0) {
    return "All research tasks failed. Please check your configuration and try again.";
  }

  if (successfulResults.length === 1) {
    return successfulResults[0].result;
  }

  // Combine multiple results
  const synthesisInput = successfulResults
    .map((r, i) => `=== RESEARCH FINDING ${i + 1} ===\nQuery: ${r.query}\nFindings: ${r.result}`)
    .join("\n\n");

  try {
    console.log(`🧠 Synthesizing ${successfulResults.length} research findings...`);
    const synthesisPrompt = `You are a research synthesizer. Create a comprehensive research report from the following findings.

RESEARCH TOPIC: ${query}

RESEARCH FINDINGS:
${synthesisInput}

Instructions:
- Create a well-structured, comprehensive research report
- Integrate all findings into a cohesive analysis
- Highlight key insights and patterns across the research
- Provide actionable conclusions and recommendations
- Cite different research perspectives where relevant
- Focus on accuracy and evidence-based insights

Provide a complete, professional research report:`;

    const finalReport = await runAgent(synthesisPrompt, true);
    return finalReport;
  } catch (error) {
    console.warn(`Synthesis failed: ${(error as Error).message}`);
    return `Research completed with ${successfulResults.length} findings:\n\n${synthesisInput}`;
  }
}

// Execute individual research task
async function executeSimpleResearch(query: string, agentIndex: number): Promise<string> {
  updateSimpleProgress(agentIndex, "PROCESSING");

  try {
    console.log(`🤖 Agent ${agentIndex + 1}: Starting research...`);

    // Create focused research prompt
    const researchPrompt = `You are an expert researcher conducting comprehensive analysis.

Research Query: ${query}

Instructions:
- Conduct thorough research on this specific query
- Use web search to find current, authoritative information
- Analyze multiple sources for comprehensive coverage
- Focus on facts, data, and evidence-based insights
- Provide detailed findings with source references
- Ensure accuracy and reliability of information

Use your available research tools to provide a comprehensive analysis of this query. Be thorough and evidence-based in your research.`;

    // Add timeout to prevent hanging
    const response = await Promise.race([
      runAgent(researchPrompt, true),
      new Promise<string>((_, reject) =>
        setTimeout(
          () => reject(new Error("Research timeout after 120 seconds")),
          120000,
        ),
      ),
    ]);

    updateSimpleProgress(agentIndex, "COMPLETED");
    console.log(`✅ Agent ${agentIndex + 1}: Research completed successfully`);
    return response;

  } catch (error) {
    updateSimpleProgress(agentIndex, "FAILED");
    console.error(`❌ Agent ${agentIndex + 1}: Research failed - ${(error as Error).message}`);
    throw error;
  }
}

// Generate simple research queries
function generateSimpleResearchQueries(originalQuery: string, numAgents: number): string[] {
  const baseQueries = [
    `Research comprehensive background information and current state of: ${originalQuery}`,
    `Analyze latest developments, trends, and innovations related to: ${originalQuery}`,
    `Investigate practical applications, use cases, and real-world implementations of: ${originalQuery}`,
    `Examine challenges, limitations, and potential solutions regarding: ${originalQuery}`,
    `Study future prospects, emerging opportunities, and strategic implications of: ${originalQuery}`,
    `Compare different approaches, methodologies, and perspectives on: ${originalQuery}`,
  ];

  return baseQueries.slice(0, numAgents);
}

// Progress monitoring for simple research
export function getSimpleResearchProgress() {
  return {
    running: true,
    startTime: Date.now(),
    progress: getSimpleProgressStatus(),
    numAgents: currentNumAgents,
    modelDisplay: "RESEARCH HEAVY"
  };
}

// Run simple research with enhanced display
export async function runSimpleResearchWithDisplay(query: string): Promise<string> {
  const modelFull = config.openrouter.model;
  const modelName = modelFull.includes("/") ? modelFull.split("/").pop() : modelFull;
  const modelParts = modelName?.split("-") || [];
  const cleanName = modelParts.length >= 3 ? modelParts.slice(0, 3).join("-") : modelName;
  const modelDisplay = (cleanName || "RESEARCH").toUpperCase() + " HEAVY";

  // Enhanced startup display
  enhancedStartupDisplay(
    config.orchestrator.parallel_agents,
    config.openrouter.model,
    {
      "Research Mode": "Simple & Reliable",
      "Task Timeout": `${config.orchestrator.task_timeout}s`,
      "API Key": config.openrouter.api_key ? "Configured" : "Missing",
    },
  );

  console.log();
  logInfo("Starting simplified research analysis...");
  console.log();

  const startTime = Date.now();
  let running = true;

  // Start enhanced progress monitoring
  const stopProgressMonitor = startProgressMonitor(
    () => ({
      running,
      startTime,
      progress: getSimpleProgressStatus(),
      numAgents: config.orchestrator.parallel_agents,
      modelDisplay,
    }),
    null,
    { compactMode: false, showConfig: false },
  );

  try {
    const result = await simpleResearchOrchestrate(query);
    running = false;

    if (stopProgressMonitor) {
      stopProgressMonitor();
    }

    // Calculate final statistics
    const executionTime = startTime ? (Date.now() - startTime) / 1000 : 0;
    const progressStatuses = getSimpleProgressStatus();
    const successfulAgents = progressStatuses.filter((s) => s === "COMPLETED").length;
    const failedAgents = progressStatuses.filter((s) => s === "FAILED").length;

    // Display enhanced final results
    displayFinalResults(query, result, {
      executionTime,
      agentsUsed: config.orchestrator.parallel_agents,
      successfulAgents,
      failedAgents,
    });

    return result;
  } catch (error) {
    running = false;
    if (stopProgressMonitor) {
      stopProgressMonitor();
    }

    console.log();
    logError(`Research failed: ${(error as Error).message}`);
    throw error;
  }
}
