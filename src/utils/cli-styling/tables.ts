import Table from "cli-table3";
import pc from "picocolors";

export interface TableColumn {
  key: string;
  label: string;
  width?: number;
  align?: "left" | "center" | "right";
}

export interface TableOptions {
  title?: string;
  columns: TableColumn[];
  data: Record<string, any>[];
  colorHeaders?: boolean;
  alternateRows?: boolean;
}

export function createTable(options: TableOptions): string {
  const { columns, data, colorHeaders = true, alternateRows = true } = options;

  const table = new Table({
    head: columns.map((col) =>
      colorHeaders ? pc.bold(pc.cyan(col.label)) : col.label,
    ),
    colWidths: columns.map((col) => col.width || null),
    colAligns: columns.map((col) => col.align || "left"),
    style: {
      head: [],
      border: ["gray"],
    },
  });

  data.forEach((row, index) => {
    const tableRow = columns.map((col) => {
      const value = String(row[col.key] || "");
      return alternateRows && index % 2 === 1 ? pc.dim(value) : value;
    });
    table.push(tableRow);
  });

  return table.toString();
}

// Specialized table for API responses
export function createApiResponseTable(data: any[]): string {
  if (!data || data.length === 0) {
    return pc.yellow("No data to display");
  }

  // Auto-detect columns from first item
  const firstItem = data[0];
  const columns: TableColumn[] = Object.keys(firstItem).map((key) => ({
    key,
    label: key.toUpperCase(),
    width: Math.max(key.length + 2, 15),
  }));

  return createTable({
    columns,
    data,
    colorHeaders: true,
    alternateRows: true,
  });
}

// Summary table for statistics
export function createSummaryTable(
  stats: Record<string, string | number>,
): string {
  const table = new Table({
    style: {
      head: [],
      border: ["cyan"],
    },
  });

  Object.entries(stats).forEach(([key, value]) => {
    table.push([pc.bold(key), pc.green(String(value))]);
  });

  return table.toString();
}

// Progress table for multi-agent status
export function createProgressTable(
  agents: Array<{
    id: string;
    status: string;
    progress?: number;
    message?: string;
  }>,
): string {
  const table = new Table({
    head: [
      pc.bold(pc.cyan("Agent")),
      pc.bold(pc.cyan("Status")),
      pc.bold(pc.cyan("Progress")),
      pc.bold(pc.cyan("Message")),
    ],
    colWidths: [10, 12, 12, 40],
    style: {
      head: [],
      border: ["gray"],
    },
  });

  agents.forEach((agent) => {
    const statusColor =
      agent.status === "COMPLETED"
        ? pc.green
        : agent.status === "FAILED"
          ? pc.red
          : agent.status === "PROCESSING"
            ? pc.yellow
            : pc.dim;

    const progressBar =
      agent.progress !== undefined
        ? `${"█".repeat(Math.floor(agent.progress / 10))}${"░".repeat(10 - Math.floor(agent.progress / 10))} ${agent.progress}%`
        : "N/A";

    table.push([
      pc.bold(agent.id),
      statusColor(agent.status),
      pc.cyan(progressBar),
      pc.dim(agent.message || ""),
    ]);
  });

  return table.toString();
}

// Configuration table for displaying settings
export function createConfigTable(config: Record<string, any>): string {
  const table = new Table({
    head: [pc.bold(pc.cyan("Setting")), pc.bold(pc.cyan("Value"))],
    colWidths: [25, 50],
    style: {
      head: [],
      border: ["blue"],
    },
  });

  Object.entries(config).forEach(([key, value]) => {
    let displayValue = String(value);

    // Color code different value types
    if (typeof value === "number") {
      displayValue = pc.cyan(displayValue);
    } else if (typeof value === "boolean") {
      displayValue = value ? pc.green(displayValue) : pc.red(displayValue);
    } else if (typeof value === "string") {
      displayValue = pc.white(displayValue);
    }

    table.push([pc.yellow(key), displayValue]);
  });

  return table.toString();
}

// Simple two-column table
export function createSimpleTable(
  data: Array<[string, string | number]>,
  headers?: [string, string],
): string {
  const table = new Table({
    head: headers
      ? [pc.bold(pc.cyan(headers[0])), pc.bold(pc.cyan(headers[1]))]
      : [],
    style: {
      head: [],
      border: ["gray"],
    },
  });

  data.forEach(([key, value]) => {
    table.push([pc.yellow(key), pc.white(String(value))]);
  });

  return table.toString();
}

// Results table with custom formatting
export function createResultsTable(
  results: Array<{
    agent: string;
    result: string;
    duration: number;
    status: "success" | "error" | "warning";
  }>,
): string {
  const table = new Table({
    head: [
      pc.bold(pc.cyan("Agent")),
      pc.bold(pc.cyan("Result")),
      pc.bold(pc.cyan("Duration")),
      pc.bold(pc.cyan("Status")),
    ],
    colWidths: [12, 40, 12, 10],
    style: {
      head: [],
      border: ["magenta"],
    },
  });

  results.forEach((result) => {
    const statusColor =
      result.status === "success"
        ? pc.green
        : result.status === "error"
          ? pc.red
          : pc.yellow;

    const durationFormatted = `${result.duration}ms`;
    const resultTruncated =
      result.result.length > 35
        ? result.result.substring(0, 35) + "..."
        : result.result;

    table.push([
      pc.bold(result.agent),
      pc.white(resultTruncated),
      pc.cyan(durationFormatted),
      statusColor(result.status.toUpperCase()),
    ]);
  });

  return table.toString();
}

// Compact status table for dashboard view
export function createStatusTable(
  items: Array<{
    name: string;
    status: "online" | "offline" | "pending" | "error";
    lastUpdate?: Date;
  }>,
): string {
  const table = new Table({
    head: [
      pc.bold(pc.cyan("Service")),
      pc.bold(pc.cyan("Status")),
      pc.bold(pc.cyan("Last Update")),
    ],
    colWidths: [20, 12, 20],
    style: {
      head: [],
      border: ["gray"],
    },
  });

  items.forEach((item) => {
    const statusIcon = {
      online: "🟢",
      offline: "🔴",
      pending: "🟡",
      error: "🔴",
    };

    const statusColor = {
      online: pc.green,
      offline: pc.red,
      pending: pc.yellow,
      error: pc.red,
    };

    const lastUpdate = item.lastUpdate
      ? item.lastUpdate.toLocaleTimeString()
      : "Never";

    table.push([
      pc.bold(item.name),
      `${statusIcon[item.status]} ${statusColor[item.status](item.status.toUpperCase())}`,
      pc.dim(lastUpdate),
    ]);
  });

  return table.toString();
}
