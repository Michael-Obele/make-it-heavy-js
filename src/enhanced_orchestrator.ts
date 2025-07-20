import { runAgent } from "./agent";
import config from "../config";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";

export type TaskType =
  | "research"
  | "development"
  | "analysis"
  | "automation"
  | "creative"
  | "integration"
  | "planning"
  | "optimization";

export type AgentRole =
  | "researcher"
  | "analyst"
  | "developer"
  | "architect"
  | "tester"
  | "specialist"
  | "validator"
  | "synthesizer";

export type DeepResearchPhase =
  | "initial_exploration"
  | "focused_investigation"
  | "cross_validation"
  | "gap_analysis"
  | "deep_dive"
  | "synthesis";

export interface TaskClassification {
  type: TaskType;
  complexity: "simple" | "moderate" | "complex" | "expert";
  domain: string;
  requiredRoles: AgentRole[];
  estimatedDepth: number;
  contextRequirements: number; // Token estimate
}

export interface AgentContext {
  id: string;
  role: AgentRole;
  specialization?: string;
  previousFindings: string[];
  contextMemory: string;
  tokenUsage: number;
}

export interface ResearchSession {
  id: string;
  query: string;
  classification: TaskClassification;
  phases: DeepResearchPhase[];
  currentPhase: DeepResearchPhase;
  agents: AgentContext[];
  findings: { [phase: string]: any };
  knowledgeBase: string;
  sources: string[];
  iterations: number;
  startTime: Date;
  totalTokensUsed: number;
}

export interface TaskExecution {
  id: string;
  originalQuery: string;
  classification: TaskClassification;
  executionPlan: string[];
  currentStep: number;
  results: { [step: string]: any };
  context: string;
  agents: AgentContext[];
  startTime: Date;
  estimatedCompletion: Date;
}

// Module-level state
const activeSessions: { [sessionId: string]: ResearchSession | TaskExecution } =
  {};
const contextDatabase: { [sessionId: string]: string } = {};
const knowledgeGraphs: { [sessionId: string]: any } = {};

// Enhanced progress tracking for display
const sessionProgress: { [sessionId: string]: AgentProgressStatus[] } = {};
const currentActiveSession: { sessionId: string | null } = { sessionId: null };

export function classifyTask(userInput: string): TaskClassification {
  // Enhanced task classification using multiple indicators
  const indicators = {
    research: [
      "research",
      "investigate",
      "study",
      "explore",
      "analyze",
      "what is",
      "how does",
      "why",
      "explain",
      "compare",
      "find information",
      "learn about",
      "understand",
      "developments",
      "latest",
      "trends",
      "technologies",
      "advances",
      "innovations",
      "progress",
      "breakthroughs",
      "findings",
      "discoveries",
      "status",
      "current",
      "recent",
      "emerging",
      "future",
      "potential",
      "impact",
      "benefits",
      "challenges",
      "opportunities",
      "review",
      "overview",
      "summary",
      "comprehensive",
      "detailed",
    ],
    development: [
      "build",
      "create",
      "develop",
      "implement",
      "code",
      "program",
      "write",
      "make",
      "construct",
      "design",
      "application",
      "website",
      "system",
      "software",
    ],
    analysis: [
      "analyze",
      "evaluate",
      "assess",
      "review",
      "examine",
      "performance",
      "data",
      "metrics",
      "statistics",
      "trends",
      "patterns",
      "insights",
    ],
    automation: [
      "automate",
      "streamline",
      "optimize",
      "script",
      "workflow",
      "process",
      "pipeline",
      "deploy",
      "ci/cd",
      "testing",
      "monitoring",
    ],
    creative: [
      "design",
      "create content",
      "write",
      "generate",
      "brainstorm",
      "ideate",
      "creative",
      "artistic",
      "marketing",
      "copy",
      "content",
    ],
    integration: [
      "connect",
      "integrate",
      "api",
      "database",
      "sync",
      "merge",
      "combine",
      "interface",
      "third-party",
      "service",
    ],
    planning: [
      "plan",
      "strategy",
      "roadmap",
      "timeline",
      "project",
      "manage",
      "organize",
      "schedule",
      "estimate",
      "budget",
    ],
    optimization: [
      "optimize",
      "improve",
      "enhance",
      "performance",
      "speed up",
      "efficiency",
      "refactor",
      "scale",
      "bottleneck",
    ],
  };

  const lowerInput = userInput.toLowerCase();
  const scores: { [key in TaskType]: number } = {
    research: 0,
    development: 0,
    analysis: 0,
    automation: 0,
    creative: 0,
    integration: 0,
    planning: 0,
    optimization: 0,
  };

  // Score based on keyword matches
  Object.entries(indicators).forEach(([type, keywords]) => {
    keywords.forEach((keyword) => {
      if (lowerInput.includes(keyword)) {
        scores[type as TaskType] += 1;
      }
    });
  });

  // Add weight to research type for research-focused queries
  if (
    lowerInput.includes("research") ||
    lowerInput.includes("analyze") ||
    lowerInput.includes("study") ||
    lowerInput.includes("investigate") ||
    lowerInput.includes("developments") ||
    lowerInput.includes("latest") ||
    lowerInput.includes("trends")
  ) {
    scores.research += 3;
  }

  // Determine primary task type
  const primaryType = Object.entries(scores).reduce((a, b) =>
    scores[a[0] as TaskType] > scores[b[0] as TaskType] ? a : b,
  )[0] as TaskType;

  // Determine complexity based on length, technical terms, and scope
  let complexity: "simple" | "moderate" | "complex" | "expert" = "simple";

  if (lowerInput.length > 200) complexity = "moderate";
  if (lowerInput.length > 500) complexity = "complex";
  if (lowerInput.length > 1000) complexity = "expert";

  // Research complexity indicators (not just technical development)
  const researchComplexityTerms = [
    "comprehensive analysis",
    "meta-analysis",
    "systematic review",
    "literature review",
    "comparative study",
    "longitudinal study",
    "cross-sectional",
    "multivariate",
    "interdisciplinary",
    "emerging technologies",
    "recent developments",
    "latest research",
    "cutting-edge",
    "state-of-the-art",
  ];

  const researchComplexityCount = researchComplexityTerms.filter((term) =>
    lowerInput.includes(term),
  ).length;

  // Technical complexity indicators
  const technicalTerms = [
    "architecture",
    "framework",
    "algorithm",
    "optimization",
    "machine learning",
    "artificial intelligence",
    "blockchain",
    "microservices",
    "scalability",
    "performance",
    "renewable energy",
    "storage technologies",
    "battery systems",
    "energy density",
    "grid integration",
  ];

  const technicalCount = technicalTerms.filter((term) =>
    lowerInput.includes(term),
  ).length;

  // Adjust complexity based on research or technical indicators
  if (researchComplexityCount >= 2 || technicalCount >= 3)
    complexity = "expert";
  else if (researchComplexityCount >= 1 || technicalCount >= 2)
    complexity = "complex";
  else if (technicalCount >= 1) complexity = "moderate";

  // Determine domain
  const domains = {
    "web development": [
      "web",
      "frontend",
      "backend",
      "html",
      "css",
      "javascript",
    ],
    "data science": [
      "data",
      "analytics",
      "machine learning",
      "ai",
      "statistics",
    ],
    devops: ["deploy", "ci/cd", "docker", "kubernetes", "aws", "cloud"],
    mobile: ["mobile", "ios", "android", "app"],
    security: ["security", "authentication", "encryption", "vulnerability"],
    business: ["business", "strategy", "market", "customer", "revenue"],
  };

  let domain = "general";
  let maxDomainScore = 0;

  Object.entries(domains).forEach(([domainName, keywords]) => {
    const domainScore = keywords.filter((keyword) =>
      lowerInput.includes(keyword),
    ).length;

    if (domainScore > maxDomainScore) {
      maxDomainScore = domainScore;
      domain = domainName;
    }
  });

  // Determine required roles based on task type
  const roleMapping: { [key in TaskType]: AgentRole[] } = {
    research: ["researcher", "analyst", "validator", "synthesizer"],
    development: ["researcher", "analyst", "specialist", "validator"], // Changed to research-focused roles
    analysis: ["analyst", "researcher", "specialist", "validator"],
    automation: ["researcher", "analyst", "specialist", "validator"], // Changed to research-focused roles
    creative: ["specialist", "analyst", "synthesizer"],
    integration: ["researcher", "analyst", "specialist", "validator"], // Changed to research-focused roles
    planning: ["analyst", "researcher", "specialist", "synthesizer"], // Made research-focused
    optimization: ["specialist", "analyst", "researcher", "validator"], // Made research-focused
  };

  // Estimate context requirements (tokens)
  const contextMultipliers = {
    simple: 10000,
    moderate: 30000,
    complex: 80000,
    expert: 150000,
  };

  return {
    type: primaryType,
    complexity,
    domain,
    requiredRoles: roleMapping[primaryType],
    estimatedDepth:
      complexity === "expert"
        ? 5
        : complexity === "complex"
          ? 4
          : complexity === "moderate"
            ? 3
            : 2,
    contextRequirements: contextMultipliers[complexity],
  };
}

export async function enhancedOrchestrate(userInput: string): Promise<string> {
  const sessionId = randomUUID();
  const classification = classifyTask(userInput);

  // Set as current active session for progress tracking
  currentActiveSession.sessionId = sessionId;

  console.log(
    `🎯 Task Classification: ${classification.type} (${classification.complexity})`,
  );
  console.log(`📋 Domain: ${classification.domain}`);
  console.log(`👥 Required Roles: ${classification.requiredRoles.join(", ")}`);

  try {
    if (classification.type === "research") {
      return await executeDeepResearch(userInput, classification, sessionId);
    } else {
      return await executeComplexTask(userInput, classification, sessionId);
    }
  } catch (error) {
    console.error(`❌ Orchestration failed: ${(error as Error).message}`);
    return `Orchestration failed: ${(error as Error).message}`;
  } finally {
    // Cleanup session if needed
    delete activeSessions[sessionId];
    delete sessionProgress[sessionId];
    currentActiveSession.sessionId = null;
  }
}

async function executeDeepResearch(
  query: string,
  classification: TaskClassification,
  sessionId: string,
): Promise<string> {
  const phases: DeepResearchPhase[] = [
    "initial_exploration",
    "focused_investigation",
    "cross_validation",
    "gap_analysis",
    "deep_dive",
    "synthesis",
  ];

  const session: ResearchSession = {
    id: sessionId,
    query,
    classification,
    phases: phases.slice(0, classification.estimatedDepth),
    currentPhase: "initial_exploration",
    agents: [],
    findings: {},
    knowledgeBase: "",
    sources: [],
    iterations: 0,
    startTime: new Date(),
    totalTokensUsed: 0,
  };

  activeSessions[sessionId] = session;

  // Initialize progress tracking for this session
  sessionProgress[sessionId] = Array.from(
    { length: config.orchestrator.parallel_agents },
    () => "QUEUED",
  );

  console.log(`🔬 Starting Deep Research Session: ${sessionId}`);
  console.log(`📊 Planned Phases: ${session.phases.join(" → ")}`);

  // Phase 1: Initial Exploration
  console.log(`\n🚀 Phase 1: Initial Exploration`);

  let explorationQueries: string[];
  try {
    explorationQueries = await generateExplorationQueries(
      query,
      classification,
    );
  } catch (error) {
    console.warn(
      `Failed to generate queries, using fallback: ${(error as Error).message}`,
    );
    explorationQueries = [
      `Provide comprehensive background and current state analysis of: ${query}`,
      `Research latest developments, trends, and innovations related to: ${query}`,
      `Analyze challenges, limitations, and opportunities in: ${query}`,
      `Investigate practical applications and future prospects of: ${query}`,
    ];
  }

  const explorationResults = await executeResearchPhase(
    session,
    "initial_exploration",
    explorationQueries,
  );

  session.findings.initial_exploration = explorationResults;
  session.knowledgeBase += `\n\n=== INITIAL EXPLORATION FINDINGS ===\n${JSON.stringify(explorationResults, null, 2)}`;

  // Phase 2: Focused Investigation
  console.log(`\n🎯 Phase 2: Focused Investigation`);
  const focusAreas = identifyFocusAreas(explorationResults);
  const investigationResults = await executeResearchPhase(
    session,
    "focused_investigation",
    await generateFocusedQueries(query, focusAreas, classification),
  );

  session.findings.focused_investigation = investigationResults;
  session.knowledgeBase += `\n\n=== FOCUSED INVESTIGATION FINDINGS ===\n${JSON.stringify(investigationResults, null, 2)}`;

  // Phase 3: Cross Validation (if complexity warrants it)
  if (classification.complexity !== "simple") {
    console.log(`\n✅ Phase 3: Cross Validation`);
    const validationResults = await executeValidationPhase(session);
    session.findings.cross_validation = validationResults;
    session.knowledgeBase += `\n\n=== CROSS VALIDATION RESULTS ===\n${JSON.stringify(validationResults, null, 2)}`;
  }

  // Phase 4: Gap Analysis (for complex/expert tasks)
  if (["complex", "expert"].includes(classification.complexity)) {
    console.log(`\n🔍 Phase 4: Gap Analysis`);
    const gaps = await identifyKnowledgeGaps(session);
    if (gaps.length > 0) {
      console.log(`📊 Knowledge Gaps Identified: ${gaps.length}`);
      const gapResults = await executeGapFilling(session, gaps);
      session.findings.gap_analysis = gapResults;
      session.knowledgeBase += `\n\n=== GAP ANALYSIS RESULTS ===\n${JSON.stringify(gapResults, null, 2)}`;
    }
  }

  // Phase 5: Deep Dive (for expert tasks)
  if (classification.complexity === "expert") {
    console.log(`\n🏊 Phase 5: Deep Dive`);
    const deepDiveResults = await executeDeepDive(session);
    session.findings.deep_dive = deepDiveResults;
    session.knowledgeBase += `\n\n=== DEEP DIVE RESULTS ===\n${JSON.stringify(deepDiveResults, null, 2)}`;
  }

  // Final Phase: Synthesis
  console.log(`\n🧬 Final Phase: Synthesis`);
  const finalReport = await synthesizeResearchFindings(session);

  // Save research session for future reference
  await saveResearchSession(session);

  return finalReport;
}

async function generateExplorationQueries(
  originalQuery: string,
  classification: TaskClassification,
): Promise<string[]> {
  const explorationPrompt = `You are an expert research coordinator. Your task is to break down a research query into ${config.orchestrator.parallel_agents} comprehensive exploration questions that will provide broad coverage of the topic.

Original Query: "${originalQuery}"
Domain: ${classification.domain}
Complexity: ${classification.complexity}

Generate exactly ${config.orchestrator.parallel_agents} exploration questions that:
1. Cover different aspects/angles of the topic
2. Include both foundational and current information
3. Consider practical applications and theoretical background
4. Address potential controversies or debates
5. Explore related technologies/concepts
6. Include historical context and future implications

Each question should be detailed enough to guide comprehensive research but distinct enough to avoid overlap.

Return as a JSON array of strings: ["question1", "question2", "question3", "question4"]
Only return the JSON array, nothing else.`;

  try {
    console.log(`🤖 Generating exploration queries for: ${originalQuery}`);
    const response = await runAgent(explorationPrompt, true);
    const queries = JSON.parse(response.trim());
    console.log(`✅ Generated ${queries.length} exploration queries`);
    return queries;
  } catch (error) {
    console.warn(
      `Failed to generate exploration queries: ${(error as Error).message}`,
    );
    console.log(`🔄 Using fallback exploration queries`);
    return [
      `Provide comprehensive background information about: ${originalQuery}`,
      `Analyze current trends and developments related to: ${originalQuery}`,
      `Explore practical applications and use cases for: ${originalQuery}`,
      `Investigate challenges and limitations of: ${originalQuery}`,
    ];
  }
}

async function executeResearchPhase(
  session: ResearchSession,
  phase: DeepResearchPhase,
  queries: string[],
): Promise<any> {
  const phaseResults: any = {
    phase,
    queries,
    findings: [],
    sources: [],
    keyInsights: [],
    executionTime: 0,
  };

  const startTime = Date.now();
  session.currentPhase = phase;

  // Update progress tracking - mark agents as processing
  if (
    currentActiveSession.sessionId &&
    sessionProgress[currentActiveSession.sessionId]
  ) {
    queries.forEach((_, index) => {
      if (index < sessionProgress[currentActiveSession.sessionId].length) {
        sessionProgress[currentActiveSession.sessionId][index] = "PROCESSING";
      }
    });
  }

  // Create specialized agents for this phase
  const agents: AgentContext[] = queries.map((query, index) => ({
    id: `${session.id}-${phase}-agent-${index}`,
    role: session.classification.requiredRoles[
      index % session.classification.requiredRoles.length
    ],
    specialization: session.classification.domain,
    previousFindings: Object.values(session.findings)
      .map((f) => JSON.stringify(f))
      .slice(-2),
    contextMemory: session.knowledgeBase.slice(-10000), // Last 10k characters
    tokenUsage: 0,
  }));

  // Execute queries in parallel with specialized context
  const agentPromises = queries.map(async (query, index) => {
    const agent = agents[index];
    const contextualQuery = buildContextualQuery(query, agent, session);

    try {
      console.log(
        `  🤖 Agent ${index + 1} (${agent.role}): Starting research...`,
      );

      // Add timeout to prevent hanging
      const response = await Promise.race([
        runAgent(contextualQuery, true),
        new Promise<string>((_, reject) =>
          setTimeout(
            () => reject(new Error("Agent timeout after 60 seconds")),
            60000,
          ),
        ),
      ]);

      agent.tokenUsage = response.length; // Rough token estimate
      session.totalTokensUsed += agent.tokenUsage;

      // Update progress tracking - mark agent as completed
      if (
        currentActiveSession.sessionId &&
        sessionProgress[currentActiveSession.sessionId]
      ) {
        if (index < sessionProgress[currentActiveSession.sessionId].length) {
          sessionProgress[currentActiveSession.sessionId][index] = "COMPLETED";
        }
      }

      console.log(`  ✅ Agent ${index + 1} completed successfully`);

      return {
        agentId: agent.id,
        role: agent.role,
        query,
        response,
        tokenUsage: agent.tokenUsage,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(
        `  ❌ Agent ${index + 1} failed: ${(error as Error).message}`,
      );

      // Update progress tracking - mark agent as failed
      if (
        currentActiveSession.sessionId &&
        sessionProgress[currentActiveSession.sessionId]
      ) {
        if (index < sessionProgress[currentActiveSession.sessionId].length) {
          sessionProgress[currentActiveSession.sessionId][index] = "FAILED";
        }
      }

      return {
        agentId: agent.id,
        role: agent.role,
        query,
        response: `Error: ${(error as Error).message}`,
        error: true,
        timestamp: new Date().toISOString(),
      };
    }
  });

  const results = await Promise.all(agentPromises);
  phaseResults.findings = results;
  phaseResults.executionTime = Date.now() - startTime;

  // Extract key insights and sources
  results.forEach((result) => {
    if (!result.error) {
      // Simple insight extraction (in production, use more sophisticated NLP)
      const insights = extractKeyInsights(result.response);
      phaseResults.keyInsights.push(...insights);

      const sources = extractSources(result.response);
      phaseResults.sources.push(...sources);
    }
  });

  // Update session
  session.agents.push(...agents);
  session.sources.push(...phaseResults.sources);
  session.iterations++;

  console.log(
    `  ✅ Phase ${phase} completed in ${phaseResults.executionTime}ms`,
  );
  console.log(
    `  📊 Generated ${phaseResults.keyInsights.length} insights from ${results.length} agents`,
  );
  console.log(`  🔗 Found ${phaseResults.sources.length} sources`);

  return phaseResults;
}

function buildContextualQuery(
  query: string,
  agent: AgentContext,
  session: ResearchSession,
): string {
  return `You are a specialized ${agent.role} with expertise in ${agent.specialization}.

RESEARCH CONTEXT:
Original Research Question: "${session.query}"
Current Phase: ${session.currentPhase}
Your Specific Query: "${query}"

PREVIOUS FINDINGS SUMMARY:
${agent.contextMemory}

PREVIOUS RELATED FINDINGS:
${agent.previousFindings.join("\n---\n")}

INSTRUCTIONS:
As a ${agent.role}, provide comprehensive, detailed analysis for the specific query above.

Your response should:
1. Leverage your specialization in ${agent.specialization}
2. Build upon previous findings without repeating them
3. Provide specific, actionable insights
4. Include relevant sources and references
5. Be thorough and detailed (aim for comprehensive coverage)
6. Identify any gaps or areas needing further investigation
7. Consider multiple perspectives and potential counterarguments

RESPONSE REQUIREMENTS:
- Use clear headings and structure
- Include specific examples and case studies where relevant
- Cite sources and provide URLs when possible
- Highlight key takeaways and actionable insights
- Maintain objectivity while being thorough
- Connect findings to the broader research context

Begin your detailed analysis:`;
}

function identifyFocusAreas(explorationResults: any): string[] {
  const focusAreas: string[] = [];

  // Extract focus areas from exploration findings
  explorationResults.keyInsights.forEach((insight: string) => {
    // Simple keyword extraction (in production, use more sophisticated NLP)
    const keywords = insight.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
    focusAreas.push(...keywords.slice(0, 2)); // Top 2 keywords per insight
  });

  // Remove duplicates and return top areas
  const uniqueAreas = [...new Set(focusAreas)];
  return uniqueAreas.slice(0, 6); // Top 6 focus areas
}

async function generateFocusedQueries(
  originalQuery: string,
  focusAreas: string[],
  classification: TaskClassification,
): Promise<string[]> {
  const focusPrompt = `Generate ${config.orchestrator.parallel_agents} highly focused, detailed research questions based on the original query and identified focus areas.

Original Query: "${originalQuery}"
Focus Areas: ${focusAreas.join(", ")}
Domain: ${classification.domain}

Each question should:
1. Dive deep into one specific aspect
2. Be more targeted than broad exploration
3. Seek detailed, technical information
4. Address practical implementation or application
5. Consider edge cases and limitations

Return as JSON array: ["question1", "question2", "question3", "question4"]`;

  try {
    const response = await runAgent(focusPrompt, true);
    return JSON.parse(response.trim());
  } catch (error) {
    // Fallback focused queries
    return focusAreas
      .slice(0, config.orchestrator.parallel_agents)
      .map(
        (area) =>
          `Provide detailed technical analysis of ${area} in the context of: ${originalQuery}`,
      );
  }
}

async function executeValidationPhase(session: ResearchSession): Promise<any> {
  const validationPrompt = `You are a expert fact-checker and research validator.

RESEARCH SESSION SUMMARY:
${JSON.stringify(session.findings, null, 2)}

TASK: Cross-validate the key claims, facts, and conclusions from the research findings above.

For each significant finding:
1. Assess credibility and reliability of sources
2. Check for consistency across different findings
3. Identify potential biases or limitations
4. Flag any contradictory information
5. Verify factual claims where possible
6. Rate confidence level for each major conclusion

Provide a detailed validation report with:
- Verified facts (high confidence)
- Questionable claims (needs more verification)
- Contradictions found (if any)
- Missing validation for key claims
- Overall reliability assessment
- Recommendations for additional verification

Be thorough and objective in your validation analysis.`;

  try {
    const validation = await runAgent(validationPrompt, true);
    return {
      validationReport: validation,
      timestamp: new Date().toISOString(),
      validator: "expert-fact-checker",
    };
  } catch (error) {
    return {
      error: `Validation failed: ${(error as Error).message}`,
      timestamp: new Date().toISOString(),
    };
  }
}

async function identifyKnowledgeGaps(
  session: ResearchSession,
): Promise<string[]> {
  const gapAnalysisPrompt = `Analyze the research findings to identify significant knowledge gaps that need to be addressed.

CURRENT FINDINGS:
${JSON.stringify(session.findings, null, 2)}

ORIGINAL QUERY: "${session.query}"
DOMAIN: ${session.classification.domain}

Identify gaps in:
1. Technical details or specifications
2. Recent developments or updates
3. Practical implementation challenges
4. Comparative analysis with alternatives
5. Performance benchmarks or metrics
6. Real-world case studies or examples
7. Future trends or predictions
8. Potential risks or limitations

Return a JSON array of specific questions that would address these gaps:
["gap question 1", "gap question 2", ...]`;

  try {
    const response = await runAgent(gapAnalysisPrompt, true);
    const gaps = JSON.parse(response.trim());
    return Array.isArray(gaps) ? gaps : [];
  } catch (error) {
    console.warn(`Gap analysis failed: ${(error as Error).message}`);
    return [];
  }
}

async function executeGapFilling(
  session: ResearchSession,
  gaps: string[],
): Promise<any> {
  console.log(`  🔧 Addressing ${gaps.length} knowledge gaps`);

  const gapResults = await executeResearchPhase(session, "gap_analysis", gaps);
  return gapResults;
}

async function executeDeepDive(session: ResearchSession): Promise<any> {
  const deepDivePrompt = `Based on all previous research phases, identify the 2-3 most critical aspects that require deep, expert-level investigation.

COMPREHENSIVE RESEARCH CONTEXT:
${session.knowledgeBase}

ORIGINAL QUERY: "${session.query}"

Select the most important areas that would benefit from expert-level deep dive analysis. These should be:
1. Highly technical or specialized aspects
2. Areas with significant complexity or nuance
3. Critical success factors or major challenges
4. Cutting-edge developments or emerging trends

Return a JSON array of 2-3 expert-level deep dive questions:
["expert question 1", "expert question 2", "expert question 3"]`;

  try {
    const response = await runAgent(deepDivePrompt, true);
    const deepDiveQuestions = JSON.parse(response.trim());

    return await executeResearchPhase(session, "deep_dive", deepDiveQuestions);
  } catch (error) {
    return {
      error: `Deep dive failed: ${(error as Error).message}`,
      timestamp: new Date().toISOString(),
    };
  }
}

async function synthesizeResearchFindings(
  session: ResearchSession,
): Promise<string> {
  const synthesisPrompt = `You are a master research synthesizer. Create a comprehensive, authoritative report from extensive multi-phase research.

COMPLETE RESEARCH SESSION:
Research Query: "${session.query}"
Domain: ${session.classification.domain}
Complexity: ${session.classification.complexity}
Phases Completed: ${Object.keys(session.findings).join(", ")}
Total Agents: ${session.agents.length}
Sources Found: ${session.sources.length}
Total Context: ~${session.totalTokensUsed} tokens

COMPREHENSIVE FINDINGS:
${session.knowledgeBase}

FULL RESEARCH DATA:
${JSON.stringify(session.findings, null, 2)}

Create a definitive, expert-level research report with:

1. **EXECUTIVE SUMMARY** (3-4 paragraphs)
   - Key findings and conclusions
   - Critical insights and implications
   - Actionable recommendations

2. **COMPREHENSIVE ANALYSIS** (Main body - be thorough)
   - Detailed exploration of all major aspects
   - Technical specifications and requirements
   - Current state and recent developments
   - Comparative analysis and alternatives
   - Best practices and recommendations
   - Challenges and limitations
   - Future outlook and trends

3. **DEEP INSIGHTS & IMPLICATIONS**
   - Strategic implications
   - Technical considerations
   - Business impact
   - Risk assessment
   - Opportunity analysis

4. **PRACTICAL RECOMMENDATIONS**
   - Specific, actionable steps
   - Implementation guidance
   - Resource requirements
   - Timeline considerations
   - Success metrics

5. **KNOWLEDGE VALIDATION**
   - Source credibility assessment
   - Confidence levels for major claims
   - Areas requiring further research
   - Potential limitations

6. **COMPREHENSIVE REFERENCE LIST**
   - All sources and references cited
   - Further reading recommendations

REQUIREMENTS:
- Utilize the FULL context and research depth available
- Be comprehensive, authoritative, and detailed
- Provide specific, actionable insights
- Maintain objectivity while being thorough
- Connect findings to practical applications
- Include specific examples and case studies
- Address the original query completely and thoroughly

This is the culmination of extensive research - make it comprehensive and valuable.`;

  try {
    const finalReport = await runAgent(synthesisPrompt, true);

    // Add session metadata
    const metadata = `
===========================================
RESEARCH SESSION METADATA
===========================================
Session ID: ${session.id}
Duration: ${((new Date().getTime() - session.startTime.getTime()) / 1000 / 60).toFixed(2)} minutes
Phases Executed: ${Object.keys(session.findings).length}
Total Agents: ${session.agents.length}
Total Context Used: ~${session.totalTokensUsed} tokens
Sources Discovered: ${session.sources.length}
Domain: ${session.classification.domain}
Complexity: ${session.classification.complexity}
===========================================

`;

    return metadata + finalReport;
  } catch (error) {
    return `Synthesis failed: ${(error as Error).message}`;
  }
}

async function executeComplexTask(
  userInput: string,
  classification: TaskClassification,
  sessionId: string,
): Promise<string> {
  const execution: TaskExecution = {
    id: sessionId,
    originalQuery: userInput,
    classification,
    executionPlan: [],
    currentStep: 0,
    results: {},
    context: "",
    agents: [],
    startTime: new Date(),
    estimatedCompletion: new Date(
      Date.now() + (classification.complexity === "expert" ? 3600000 : 1800000),
    ),
  };

  activeSessions[sessionId] = execution;

  // Initialize progress tracking for task execution
  sessionProgress[sessionId] = Array.from(
    { length: config.orchestrator.parallel_agents },
    () => "QUEUED",
  );

  // Generate execution plan
  execution.executionPlan = await generateExecutionPlan(
    userInput,
    classification,
  );

  console.log(`🏗️  Task Execution Plan Generated:`);
  execution.executionPlan.forEach((step, index) => {
    console.log(`   ${index + 1}. ${step}`);
  });

  // Execute each step with specialized agents
  for (let i = 0; i < execution.executionPlan.length; i++) {
    execution.currentStep = i;
    const step = execution.executionPlan[i];

    console.log(`\n⚡ Executing Step ${i + 1}: ${step}`);

    const stepResult = await executeTaskStep(step, execution, i);
    execution.results[`step_${i}`] = stepResult;
    execution.context += `\nStep ${i + 1} Result: ${JSON.stringify(stepResult)}\n`;

    console.log(`✅ Step ${i + 1} completed`);
  }

  // Generate final deliverable
  const finalResult = await synthesizeTaskResults(execution);

  return finalResult;
}

async function generateExecutionPlan(
  userInput: string,
  classification: TaskClassification,
): Promise<string[]> {
  const planningPrompt = `You are an expert project planner and architect. Create a detailed execution plan for this task.

TASK: "${userInput}"
TYPE: ${classification.type}
COMPLEXITY: ${classification.complexity}
DOMAIN: ${classification.domain}

Create a step-by-step execution plan with 4-8 steps that:
1. Breaks down the task logically
2. Ensures proper sequencing and dependencies
3. Considers the task type and complexity
4. Includes validation and quality assurance
5. Provides clear, actionable steps

Each step should be specific and achievable by a specialized AI agent.

Return as JSON array: ["step1", "step2", "step3", ...]
Only return the JSON array.`;

  try {
    const response = await runAgent(planningPrompt, true);
    return JSON.parse(response.trim());
  } catch (error) {
    // Fallback plan based on task type
    const fallbackPlans: { [key in TaskType]: string[] } = {
      research: [
        "Gather initial information",
        "Deep dive analysis",
        "Validation",
        "Synthesis",
      ],
      development: [
        "Requirements analysis",
        "Architecture design",
        "Implementation",
        "Testing",
        "Deployment",
      ],
      analysis: [
        "Data collection",
        "Processing",
        "Analysis",
        "Insights generation",
      ],
      automation: [
        "Process mapping",
        "Tool selection",
        "Implementation",
        "Testing",
        "Deployment",
      ],
      creative: [
        "Brainstorming",
        "Concept development",
        "Creation",
        "Refinement",
      ],
      integration: [
        "Requirements analysis",
        "API design",
        "Implementation",
        "Testing",
        "Integration",
      ],
      planning: [
        "Requirement gathering",
        "Analysis",
        "Strategy formulation",
        "Implementation plan",
      ],
      optimization: [
        "Current state analysis",
        "Bottleneck identification",
        "Solution design",
        "Implementation",
        "Validation",
      ],
    };

    return fallbackPlans[classification.type];
  }
}

async function executeTaskStep(
  step: string,
  execution: TaskExecution,
  stepIndex: number,
): Promise<any> {
  const agent: AgentContext = {
    id: `${execution.id}-step-${stepIndex}`,
    role: execution.classification.requiredRoles[
      stepIndex % execution.classification.requiredRoles.length
    ],
    specialization: execution.classification.domain,
    previousFindings: Object.values(execution.results),
    contextMemory: execution.context.slice(-15000),
    tokenUsage: 0,
  };

  const stepPrompt = `You are a specialized ${agent.role} with expertise in ${agent.specialization}.

OVERALL TASK: "${execution.originalQuery}"
CURRENT STEP: "${step}" (Step ${stepIndex + 1} of ${execution.executionPlan.length})

PREVIOUS CONTEXT:
${agent.contextMemory}

PREVIOUS STEP RESULTS:
${agent.previousFindings.map((result, idx) => `Step ${idx + 1}: ${JSON.stringify(result)}`).join("\n")}

INSTRUCTIONS:
Execute this step comprehensively as a ${agent.role}. Your response should:
1. Address the specific step requirements thoroughly
2. Build upon previous step results
3. Provide detailed, actionable outputs
4. Include specific implementation details
5. Consider best practices for ${agent.specialization}
6. Identify any dependencies or prerequisites
7. Provide validation criteria for this step
8. Include relevant examples or code where appropriate

Be comprehensive and detailed in your response.`;

  try {
    const result = await runAgent(stepPrompt, true);
    agent.tokenUsage = result.length;

    execution.agents.push(agent);

    return {
      step,
      stepIndex,
      agent: agent.role,
      result,
      tokenUsage: agent.tokenUsage,
      timestamp: new Date().toISOString(),
      success: true,
    };
  } catch (error) {
    return {
      step,
      stepIndex,
      agent: agent.role,
      error: (error as Error).message,
      timestamp: new Date().toISOString(),
      success: false,
    };
  }
}

async function synthesizeTaskResults(
  execution: TaskExecution,
): Promise<string> {
  const synthesisPrompt = `You are a master deliverable synthesizer. Create a comprehensive final deliverable from multi-step task execution.

ORIGINAL TASK: "${execution.originalQuery}"
TASK TYPE: ${execution.classification.type}
COMPLEXITY: ${execution.classification.complexity}
DOMAIN: ${execution.classification.domain}

EXECUTION PLAN COMPLETED:
${execution.executionPlan.map((step, idx) => `${idx + 1}. ${step}`).join("\n")}

COMPLETE EXECUTION CONTEXT:
${execution.context}

DETAILED STEP RESULTS:
${JSON.stringify(execution.results, null, 2)}

Create a comprehensive final deliverable that:

1. **EXECUTIVE SUMMARY**
   - Task completion overview
   - Key deliverables and outcomes
   - Success metrics achieved

2. **DETAILED DELIVERABLES**
   - Complete solution/analysis/implementation
   - All components and artifacts created
   - Technical specifications and documentation
   - Code, configurations, or creative outputs

3. **IMPLEMENTATION GUIDANCE**
   - Step-by-step implementation instructions
   - Prerequisites and dependencies
   - Configuration requirements
   - Deployment procedures

4. **QUALITY ASSURANCE**
   - Validation performed
   - Testing procedures
   - Quality checks completed
   - Performance considerations

5. **MAINTENANCE & SUPPORT**
   - Ongoing maintenance requirements
   - Troubleshooting guide
   - Update procedures
   - Support resources

6. **APPENDICES**
   - Technical details
   - Reference materials
   - Additional resources

Make this a comprehensive, production-ready deliverable that fully addresses the original task.`;

  try {
    const finalDeliverable = await runAgent(synthesisPrompt, true);

    const metadata = `
===========================================
TASK EXECUTION METADATA
===========================================
Execution ID: ${execution.id}
Task Type: ${execution.classification.type}
Complexity: ${execution.classification.complexity}
Domain: ${execution.classification.domain}
Steps Completed: ${Object.keys(execution.results).length}
Total Agents: ${execution.agents.length}
Duration: ${((new Date().getTime() - execution.startTime.getTime()) / 1000 / 60).toFixed(2)} minutes
Success Rate: ${Object.values(execution.results).filter((r: any) => r.success).length}/${Object.values(execution.results).length}
===========================================

`;

    return metadata + finalDeliverable;
  } catch (error) {
    return `Task synthesis failed: ${(error as Error).message}`;
  }
}

function extractKeyInsights(text: string): string[] {
  // Simple insight extraction - in production, use more sophisticated NLP
  const insights: string[] = [];

  const sentences = text.split(/[.!?]+/);
  sentences.forEach((sentence) => {
    const trimmed = sentence.trim();
    if (
      trimmed.length > 50 &&
      (trimmed.includes("important") ||
        trimmed.includes("significant") ||
        trimmed.includes("key") ||
        trimmed.includes("critical") ||
        trimmed.includes("essential"))
    ) {
      insights.push(trimmed);
    }
  });

  return insights.slice(0, 10); // Top 10 insights
}

function extractSources(text: string): string[] {
  // Extract URLs and citations
  const sources: string[] = [];

  const urlRegex = /https?:\/\/[^\s]+/g;
  const urls = text.match(urlRegex) || [];
  sources.push(...urls);

  const citationRegex = /\([^)]+\d{4}[^)]*\)/g;
  const citations = text.match(citationRegex) || [];
  sources.push(...citations);

  return [...new Set(sources)]; // Remove duplicates
}

async function saveResearchSession(session: ResearchSession): Promise<void> {
  try {
    const sessionsDir = join(process.cwd(), ".research-sessions");
    if (!existsSync(sessionsDir)) {
      mkdirSync(sessionsDir, { recursive: true });
    }

    const sessionFile = join(sessionsDir, `${session.id}.json`);
    writeFileSync(sessionFile, JSON.stringify(session, null, 2), "utf8");

    console.log(`💾 Research session saved: ${sessionFile}`);
  } catch (error) {
    console.warn(
      `Failed to save research session: ${(error as Error).message}`,
    );
  }
}

// Context management functions
export function preserveContext(sessionId: string, context: string): void {
  contextDatabase[sessionId] = context;
}

export function getContext(sessionId: string): string {
  return contextDatabase[sessionId] || "";
}

export function buildKnowledgeGraph(sessionId: string, findings: any): void {
  if (!knowledgeGraphs[sessionId]) {
    knowledgeGraphs[sessionId] = {
      nodes: [],
      edges: [],
      concepts: new Set(),
      relationships: [],
    };
  }

  // Simple knowledge graph construction
  const graph = knowledgeGraphs[sessionId];

  Object.entries(findings).forEach(([phase, data]: [string, any]) => {
    if (data.keyInsights) {
      data.keyInsights.forEach((insight: string) => {
        const concepts =
          insight.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
        concepts.forEach((concept) => graph.concepts.add(concept));
      });
    }
  });
}

export function getKnowledgeGraph(sessionId: string): any {
  return knowledgeGraphs[sessionId] || null;
}

// Utility functions for progress tracking
export function getSessionProgress(sessionId: string): any {
  const session = activeSessions[sessionId];
  if (!session) return null;

  if ("phases" in session) {
    // Research session
    const completedPhases = Object.keys(session.findings).length;
    return {
      type: "research",
      currentPhase: session.currentPhase,
      completedPhases,
      totalPhases: session.phases.length,
      progress: (completedPhases / session.phases.length) * 100,
      tokensUsed: session.totalTokensUsed,
      agentCount: session.agents.length,
    };
  } else {
    // Task execution
    return {
      type: "task",
      currentStep: session.currentStep + 1,
      totalSteps: session.executionPlan.length,
      progress:
        ((session.currentStep + 1) / session.executionPlan.length) * 100,
      agentCount: session.agents.length,
    };
  }
}

// Get current session progress for display
export function getCurrentSessionProgress(): AgentProgressStatus[] {
  if (!currentActiveSession.sessionId) {
    return Array.from(
      { length: config.orchestrator.parallel_agents || 4 },
      () => "QUEUED",
    );
  }

  return (
    sessionProgress[currentActiveSession.sessionId] ||
    Array.from(
      { length: config.orchestrator.parallel_agents || 4 },
      () => "QUEUED",
    )
  );
}

export function listActiveSessions(): string[] {
  return Object.keys(activeSessions);
}

export function getSessionSummary(sessionId: string): any {
  const session = activeSessions[sessionId];
  if (!session) return null;

  return {
    id: sessionId,
    startTime: session.startTime,
    type: "classification" in session ? "task" : "research",
    classification: session.classification,
    status: "active",
  };
}
