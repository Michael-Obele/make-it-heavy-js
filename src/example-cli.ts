import { logSuccess, logError, logWarning, logInfo, statusIndicator } from './utils/cli-styling/colors';
import { withSpinner, ProcessSpinner, createLoadingSpinner } from './utils/cli-styling/spinner';
import {
  successBox,
  errorBox,
  resultsBox,
  configBox,
  headerBox,
  progressBox,
  statusBox
} from './utils/cli-styling/boxes';
import {
  createApiResponseTable,
  createSummaryTable,
  createProgressTable,
  createConfigTable,
  createResultsTable
} from './utils/cli-styling/tables';
import {
  createHeader,
  centerText,
  formatTime,
  createProgressBar,
  createBanner,
  clearScreen,
  getTerminalCapabilities
} from './utils/cli-styling/layout';

interface ApiResponse {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'inactive';
  value: number;
  lastUpdated: string;
}

interface AgentResult {
  agent: string;
  result: string;
  duration: number;
  status: 'success' | 'error' | 'warning';
}

// Mock API function
async function fetchApiData(): Promise<ApiResponse[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Simulate occasional failures
  if (Math.random() < 0.1) {
    throw new Error('Network timeout - please try again');
  }

  return [
    { id: '001', name: 'Alpha Service', status: 'active', value: 142, lastUpdated: '2024-01-15 14:30' },
    { id: '002', name: 'Beta Process', status: 'pending', value: 89, lastUpdated: '2024-01-15 14:25' },
    { id: '003', name: 'Gamma Handler', status: 'active', value: 256, lastUpdated: '2024-01-15 14:35' },
    { id: '004', name: 'Delta Monitor', status: 'inactive', value: 0, lastUpdated: '2024-01-15 12:15' },
    { id: '005', name: 'Epsilon Tracker', status: 'active', value: 178, lastUpdated: '2024-01-15 14:40' },
  ];
}

// Mock agent orchestration simulation
async function simulateAgentWork(agentId: string): Promise<AgentResult> {
  const duration = Math.random() * 3000 + 1000; // 1-4 seconds
  await new Promise(resolve => setTimeout(resolve, duration));

  const results = [
    'Data processing completed successfully',
    'Analysis reveals positive trends',
    'Optimization recommendations generated',
    'Pattern recognition completed',
    'Anomaly detection finished'
  ];

  const statuses: ('success' | 'error' | 'warning')[] = ['success', 'success', 'success', 'warning', 'error'];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

  return {
    agent: agentId,
    result: results[Math.floor(Math.random() * results.length)],
    duration: Math.round(duration),
    status: randomStatus
  };
}

export async function runComprehensiveExample(): Promise<void> {
  const capabilities = getTerminalCapabilities();

  try {
    // Clear screen and show header
    clearScreen();

    console.log(createBanner('🚀 Make It Heavy CLI Demo', 'double'));
    console.log();
    console.log(centerText('Comprehensive CLI Styling Demonstration'));
    console.log();

    // Display environment info
    const envInfo = {
      'Terminal Width': capabilities.width,
      'Terminal Height': capabilities.height,
      'Supports Color': capabilities.supportsColor ? 'Yes' : 'No',
      'Supports Unicode': capabilities.supportsUnicode ? 'Yes' : 'No',
      'Interactive Mode': capabilities.isInteractive ? 'Yes' : 'No',
    };

    console.log(configBox(envInfo));
    console.log();

    // Show configuration
    const config = {
      'API Endpoint': 'https://api.example.com/data',
      'Timeout': '30s',
      'Retry Attempts': '3',
      'Output Format': 'table',
      'Parallel Agents': '5',
      'Max Iterations': '10'
    };

    console.log(createConfigTable(config));
    console.log();

    // Phase 1: Basic logging examples
    console.log(createHeader('Phase 1: Basic Logging', 'Demonstrating different message types'));
    console.log();

    logInfo('Initializing system components...');
    await new Promise(resolve => setTimeout(resolve, 500));
    logSuccess('System components initialized successfully');

    logWarning('This is a warning message - deprecated API detected');
    logInfo('Switching to newer API version...');
    await new Promise(resolve => setTimeout(resolve, 300));
    logSuccess('API migration completed');

    console.log();
    console.log(statusIndicator('success', 'All basic operations completed'));
    console.log();

    // Phase 2: Spinner demonstrations
    console.log(createHeader('Phase 2: Loading States', 'Various spinner and loading examples'));
    console.log();

    // Simple spinner example
    console.log('🔄 Simple Spinner Example:');
    const simpleData = await withSpinner(
      { text: 'Fetching configuration data...', color: 'cyan' },
      () => new Promise<string>(resolve => setTimeout(() => resolve('Config loaded'), 1500))
    );
    console.log(`Result: ${simpleData}`);
    console.log();

    // Multi-step process
    console.log('🔄 Multi-Step Process Example:');
    const processSpinner = new ProcessSpinner([
      'Establishing connection...',
      'Authenticating credentials...',
      'Loading user profile...',
      'Initializing workspace...',
      'Finalizing setup...'
    ]);

    processSpinner.start();

    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      if (i < 4) processSpinner.nextStep();
    }

    processSpinner.succeed('Multi-step process completed successfully!');
    console.log();

    // Phase 3: Data fetching with comprehensive error handling
    console.log(createHeader('Phase 3: Data Operations', 'Fetching and displaying data'));
    console.log();

    let apiData: ApiResponse[];
    const fetchSpinner = createLoadingSpinner({
      text: 'Fetching data from API endpoint...',
      color: 'blue'
    });

    fetchSpinner.start();

    try {
      apiData = await fetchApiData();
      fetchSpinner.succeed(`Successfully fetched ${apiData.length} records`);
    } catch (error) {
      fetchSpinner.fail('Failed to fetch data from API');
      console.log();
      console.log(errorBox(
        `API Error: ${(error as Error).message}\n\nThis could be due to:\n• Network connectivity issues\n• API rate limiting\n• Server maintenance`,
        '❌ Fetch Failed'
      ));
      throw error;
    }

    console.log();

    // Display fetched data in a beautiful table
    console.log('📊 Fetched Data:');
    const tableOutput = createApiResponseTable(apiData);
    console.log(resultsBox(tableOutput));

    // Phase 4: Multi-agent simulation
    console.log(createHeader('Phase 4: Multi-Agent Processing', 'Simulating parallel agent execution'));
    console.log();

    const agentIds = ['AGENT-01', 'AGENT-02', 'AGENT-03', 'AGENT-04', 'AGENT-05'];
    const agentPromises = agentIds.map(id => simulateAgentWork(id));

    // Show initial progress
    let agentProgress = agentIds.map(id => ({
      id,
      status: 'QUEUED',
      progress: 0,
      message: 'Waiting to start...'
    }));

    console.log('📋 Agent Progress:');
    console.log(createProgressTable(agentProgress));

    // Update progress simulation
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      // Simulate some agents progressing
      agentProgress = agentProgress.map(agent => {
        if (agent.status === 'QUEUED' && Math.random() < 0.3) {
          return { ...agent, status: 'PROCESSING', message: 'Analyzing data...' };
        }
        if (agent.status === 'PROCESSING') {
          const newProgress = Math.min(100, agent.progress + Math.random() * 20);
          return { ...agent, progress: newProgress };
        }
        return agent;
      });

      // Clear previous output and show updated progress
      console.log('\x1b[' + (agentIds.length + 3) + 'A'); // Move cursor up
      console.log(createProgressTable(agentProgress));
    }, 500);

    // Wait for all agents to complete
    const agentResults = await Promise.all(agentPromises);
    clearInterval(progressInterval);

    // Final progress update
    agentProgress = agentIds.map((id, index) => ({
      id,
      status: 'COMPLETED',
      progress: 100,
      message: 'Analysis complete'
    }));

    console.log('\x1b[' + (agentIds.length + 3) + 'A'); // Move cursor up
    console.log(createProgressTable(agentProgress));

    const totalTime = (Date.now() - startTime) / 1000;
    console.log();
    logSuccess(`All ${agentIds.length} agents completed in ${formatTime(totalTime)}`);
    console.log();

    // Display agent results
    console.log('📈 Agent Results:');
    console.log(createResultsTable(agentResults));
    console.log();

    // Phase 5: Summary and statistics
    console.log(createHeader('Phase 5: Summary & Statistics', 'Final results and analysis'));
    console.log();

    const stats = {
      'Total Records Processed': apiData.length,
      'Active Services': apiData.filter(item => item.status === 'active').length,
      'Pending Services': apiData.filter(item => item.status === 'pending').length,
      'Inactive Services': apiData.filter(item => item.status === 'inactive').length,
      'Total Value': apiData.reduce((sum, item) => sum + item.value, 0),
      'Successful Agents': agentResults.filter(r => r.status === 'success').length,
      'Failed Agents': agentResults.filter(r => r.status === 'error').length,
      'Warning Agents': agentResults.filter(r => r.status === 'warning').length,
      'Average Processing Time': Math.round(agentResults.reduce((sum, r) => sum + r.duration, 0) / agentResults.length) + 'ms',
      'Total Execution Time': formatTime(totalTime)
    };

    console.log('📊 Summary Statistics:');
    console.log(createSummaryTable(stats));
    console.log();

    // Progress overview
    const completedAgents = agentResults.filter(r => r.status === 'success').length;
    console.log(progressBox(completedAgents, agentResults.length, 'Multi-agent processing complete'));
    console.log();

    // Status overview
    const overallStatus = agentResults.every(r => r.status === 'success') ? 'completed' :
                         agentResults.some(r => r.status === 'error') ? 'failed' : 'completed';

    const statusDetails = {
      'Total Execution Time': formatTime(totalTime),
      'Records Processed': apiData.length.toString(),
      'Agents Deployed': agentResults.length.toString(),
      'Success Rate': Math.round((completedAgents / agentResults.length) * 100) + '%'
    };

    console.log(statusBox(overallStatus, statusDetails));
    console.log();

    // Final success message with comprehensive summary
    const successMessage = [
      '🎉 Demo completed successfully!',
      '',
      'This demonstration showcased:',
      '• Semantic color coding and message types',
      '• Interactive loading spinners and progress indicators',
      '• Beautiful data tables with automatic formatting',
      '• Responsive terminal layout and boxes',
      '• Multi-agent progress tracking',
      '• Comprehensive error handling and user feedback',
      '',
      'All styling utilities are environment-aware and will',
      'gracefully degrade in non-color terminals.'
    ].join('\n');

    console.log(successBox(successMessage, '✨ Demonstration Complete'));

  } catch (error) {
    console.log();
    console.log(errorBox(
      `Demonstration failed: ${(error as Error).message}\n\nThis is a simulated error to show error handling capabilities.\nIn a real application, you would implement appropriate recovery strategies.`,
      '❌ Demo Failed'
    ));

    logError('CLI demonstration terminated due to error');
    process.exit(1);
  }
}

// Simple example for quick testing
export async function runSimpleExample(): Promise<void> {
  console.log(createHeader('Simple CLI Example', 'Quick demonstration of key features'));
  console.log();

  try {
    const data = await withSpinner(
      { text: 'Loading sample data...', color: 'green' },
      () => new Promise<ApiResponse[]>(resolve =>
        setTimeout(() => resolve([
          { id: '001', name: 'Test Service', status: 'active', value: 100, lastUpdated: '2024-01-15 15:00' }
        ]), 2000)
      )
    );

    console.log();
    logSuccess(`Successfully loaded ${data.length} record(s)`);
    console.log();
    console.log(createApiResponseTable(data));
    console.log();
    console.log(successBox('Simple example completed successfully!'));

  } catch (error) {
    logError(`Example failed: ${(error as Error).message}`);
  }
}

// Function to run based on command line argument
export async function runDemo(type: 'simple' | 'comprehensive' = 'comprehensive'): Promise<void> {
  if (type === 'simple') {
    await runSimpleExample();
  } else {
    await runComprehensiveExample();
  }
}

// CLI entry point
if (import.meta.main) {
  const args = process.argv.slice(2);
  const demoType = args.includes('--simple') ? 'simple' : 'comprehensive';

  console.log('Starting CLI styling demonstration...\n');

  runDemo(demoType).catch(error => {
    console.error('Demo failed:', error);
    process.exit(1);
  });
}
