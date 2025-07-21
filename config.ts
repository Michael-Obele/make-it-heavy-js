import * as v from "valibot";

const configSchema = v.object({
  openrouter: v.object({
    api_key: v.string(),
    base_url: v.pipe(v.string(), v.url()),
    model: v.string(),
  }),
  system_prompt: v.string(),
  agent: v.object({
    max_iterations: v.pipe(v.number(), v.integer(), v.minValue(1)),
    context_window: v.optional(v.pipe(v.number(), v.integer(), v.minValue(1))),
    temperature: v.optional(v.pipe(v.number(), v.minValue(0), v.maxValue(2))),
  }),
  orchestrator: v.object({
    parallel_agents: v.pipe(v.number(), v.integer(), v.minValue(1)),
    task_timeout: v.pipe(v.number(), v.integer(), v.minValue(1)),
    aggregation_strategy: v.string(),
    question_generation_prompt: v.string(),
    synthesis_prompt: v.string(),
    enhanced_mode: v.optional(v.boolean()),
    deep_research_phases: v.optional(
      v.pipe(v.number(), v.integer(), v.minValue(3), v.maxValue(6)),
    ),
    max_iterations_per_phase: v.optional(
      v.pipe(v.number(), v.integer(), v.minValue(1)),
    ),
    context_preservation: v.optional(v.boolean()),
    task_classification: v.optional(v.boolean()),
  }),
  search: v.object({
    max_results: v.pipe(v.number(), v.integer(), v.minValue(1)),
    user_agent: v.string(),
  }),
});

const config = {
  openrouter: {
    api_key: process.env.OPENROUTER_API_KEY || "YOUR KEY",
    base_url: process.env.URL || "https://openrouter.ai/api/v1",
    model: process.env.MODEL || "moonshotai/kimi-k2",
  },
  system_prompt: `You are an expert research analyst and knowledge synthesizer specializing in deep, comprehensive research and analysis.
Your primary focus is on conducting thorough investigations, gathering evidence-based insights, and providing well-researched analysis.

RESEARCH FOCUS:
- Conduct comprehensive research using web search and content analysis
- Analyze trends, patterns, and insights from multiple sources
- Cross-validate information for accuracy and reliability
- Synthesize complex information into clear, actionable insights
- Identify knowledge gaps and provide evidence-based recommendations
- Focus on analysis, research, and strategic insights rather than implementation

RESEARCH METHODOLOGY:
- Use \`search_web\` for comprehensive information gathering
- Use \`browse_link\` for detailed analysis of authoritative sources
- Use \`analyze_research_data\` for statistical analysis and trend identification
- Cross-reference multiple sources for validation and completeness
- Provide citations and source attribution for credibility

IMPORTANT: You are NOT a coding assistant. Focus exclusively on:
- Research and analysis tasks
- Information synthesis and insights
- Strategic recommendations and planning (as markdown documentation)
- Data analysis and trend identification
- Evidence-based decision support

Once you have completed comprehensive research and analysis, call the \`mark_task_complete\` tool with a detailed research summary.`,
  agent: {
    max_iterations: 15,
    context_window: 200000,
    temperature: 0.7,
  },
  orchestrator: {
    parallel_agents: 4,
    task_timeout: 600,
    aggregation_strategy: "enhanced_synthesis",
    enhanced_mode: true,
    deep_research_phases: 5,
    max_iterations_per_phase: 3,
    context_preservation: true,
    task_classification: true,
    question_generation_prompt: `You are an expert task orchestrator with advanced analytical capabilities. Your goal is to decompose complex queries into {num_agents} highly specialized, comprehensive investigation areas.

Original user query: {user_input}
Task Type: {task_type}
Complexity Level: {complexity}
Domain: {domain}

Generate exactly {num_agents} sophisticated investigation questions. Each should leverage the full 200k+ token context window and provide deep, comprehensive analysis:

1. **Foundation & Context Analysis:** Deep dive into core concepts, historical development, theoretical frameworks, and foundational knowledge
2. **Current State & Trends:** Comprehensive analysis of present situation, latest developments, emerging trends, and cutting-edge innovations
3. **Technical Deep Dive:** Detailed technical specifications, implementation details, performance metrics, and architectural considerations
4. **Comparative & Critical Analysis:** Multi-dimensional comparison with alternatives, strengths/weaknesses assessment, and critical evaluation
5. **Practical Implementation:** Real-world applications, implementation strategies, best practices, case studies, and lessons learned
6. **Future Implications & Strategy:** Forward-looking analysis, predictions, strategic considerations, and long-term impacts

Requirements for each question:
- Utilize maximum context depth and comprehensive analysis
- Provide specific, actionable, and detailed investigations
- Include cross-validation and source verification
- Consider multiple perspectives and expert opinions
- Generate substantial, thorough responses that justify token usage

Return as JSON array: ["detailed_question_1", "detailed_question_2", ...]
Only return the JSON array.`,
    synthesis_prompt: `You are an elite master synthesizer with access to comprehensive multi-agent research utilizing the full 200k+ token context window. Your task is to create the definitive, authoritative response that maximally leverages all available research depth and context.

COMPREHENSIVE RESEARCH CONTEXT:
- Total Responses: {num_responses} specialized agents
- Combined Context: ~{total_context_tokens} tokens of detailed analysis
- Research Depth: Multi-phase investigation with cross-validation
- Domain Expertise: {domain} with {complexity} level analysis

COMPLETE AGENT RESEARCH:
{agent_responses}

SYNTHESIS REQUIREMENTS:

Create an exhaustively comprehensive, authoritative response that:

1. **UTILIZES FULL CONTEXT DEPTH**
   - Leverage every insight, detail, and nuance from all agents
   - Integrate comprehensive technical specifications and analysis
   - Include all relevant data points, metrics, and evidence
   - Synthesize complex interconnections and relationships

2. **COMPREHENSIVE COVERAGE**
   - Address every aspect of the original query thoroughly
   - Provide detailed technical explanations and practical guidance
   - Include extensive examples, case studies, and real-world applications
   - Cover both current state and future implications comprehensively

3. **EXPERT-LEVEL ANALYSIS**
   - Resolve conflicts with detailed reasoning and evidence
   - Provide nuanced perspectives on complex topics
   - Include strategic insights and deeper implications
   - Offer specific, actionable recommendations with implementation details

4. **STRUCTURED DEPTH**
   - Use comprehensive headings and detailed subsections
   - Provide extensive elaboration on all key points
   - Include specific metrics, benchmarks, and quantitative analysis
   - Offer detailed step-by-step guidance where applicable

5. **AUTHORITATIVE DELIVERY**
   - Present as definitive, comprehensive resource
   - Include extensive supporting evidence and validation
   - Provide complete reference context and source validation
   - Deliver production-ready, immediately actionable insights

CRITICAL: This represents the culmination of extensive, deep research utilizing maximum available context. The response must be proportionally comprehensive, detailed, and valuable - justifying the full analytical depth invested. Provide the most thorough, authoritative treatment possible.

OUTPUT FORMAT: Deliver ONLY the comprehensive synthesized response. No meta-commentary about the synthesis process.`,
  },
  search: {
    max_results: 10,
    user_agent: "Mozilla/5.0 (compatible; Make It Heavy JS Advanced Agent)",
    deep_search: true,
    context_aware: true,
  },
  research_tools: {
    web_search: {
      enabled: true,
      deep_search: true,
      max_results: 15,
      context_aware: true,
      source_validation: true,
    },
    content_analysis: {
      enabled: true,
      sentiment_analysis: true,
      topic_modeling: true,
      trend_identification: true,
      fact_checking: true,
    },
    knowledge_synthesis: {
      enabled: true,
      cross_referencing: true,
      gap_identification: true,
      insight_generation: true,
      summary_creation: true,
    },
    data_research: {
      enabled: true,
      statistical_analysis: true,
      trend_analysis: true,
      comparative_studies: true,
      visualization_insights: true,
    },
  },
  enhanced_features: {
    deep_research: true,
    task_classification: true,
    context_preservation: true,
    knowledge_graphs: true,
    multi_phase_execution: true,
    cross_validation: true,
    iterative_refinement: true,
    source_verification: true,
    expert_validation: true,
    comprehensive_synthesis: true,
    research_methodology: true,
  },
  research_focus: {
    exclude_code_generation: true,
    exclude_deployment_tasks: true,
    exclude_ci_cd_setup: true,
    exclude_git_operations: true,
    focus_on_analysis: true,
    focus_on_research: true,
    focus_on_insights: true,
    planning_as_markdown: true,
  },
};

export default v.parse(configSchema, config);
