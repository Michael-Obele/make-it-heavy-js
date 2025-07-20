import ora, { Ora } from "ora";

export interface SpinnerOptions {
  text: string;
  color?:
    | "black"
    | "red"
    | "green"
    | "yellow"
    | "blue"
    | "magenta"
    | "cyan"
    | "white"
    | "gray";
  spinner?: string;
}

export function createLoadingSpinner(options: SpinnerOptions): Ora {
  const spinner = ora({
    text: options.text,
    color: options.color || "cyan",
    spinner: (options.spinner as any) || "dots",
  });

  return spinner;
}

// Helper function for async operations with spinner
export async function withSpinner<T>(
  options: SpinnerOptions,
  operation: () => Promise<T>,
): Promise<T> {
  const spinner = createLoadingSpinner(options);
  spinner.start();

  try {
    const result = await operation();
    spinner.succeed(`${options.text} - Completed!`);
    return result;
  } catch (error) {
    spinner.fail(`${options.text} - Failed!`);
    throw error;
  }
}

// Multi-step process spinner
export class ProcessSpinner {
  private spinner: Ora;
  private steps: string[];
  private currentStep: number = 0;

  constructor(steps: string[]) {
    this.steps = steps;
    this.spinner = ora();
  }

  start(): void {
    if (this.steps.length > 0) {
      this.spinner.start(this.steps[0]);
    }
  }

  nextStep(): void {
    this.currentStep++;
    if (this.currentStep < this.steps.length) {
      this.spinner.text = this.steps[this.currentStep];
    }
  }

  succeed(message?: string): void {
    this.spinner.succeed(message || "Process completed successfully!");
  }

  fail(message?: string): void {
    this.spinner.fail(message || "Process failed!");
  }

  stop(): void {
    this.spinner.stop();
  }
}

// Simple function-based spinner creation
export function startSpinner(
  text: string,
  options?: Partial<SpinnerOptions>,
): () => void {
  const spinner = createLoadingSpinner({
    text,
    color: options?.color || "cyan",
    spinner: options?.spinner || "dots",
  });

  spinner.start();

  return () => {
    spinner.stop();
  };
}

// Spinner with timeout
export function createTimedSpinner(
  text: string,
  timeoutMs: number,
  onTimeout?: () => void,
): Ora {
  const spinner = createLoadingSpinner({ text });

  const timeoutId = setTimeout(() => {
    spinner.warn(`${text} - Timeout after ${timeoutMs}ms`);
    if (onTimeout) {
      onTimeout();
    }
  }, timeoutMs);

  // Override the original succeed/fail/stop methods to clear timeout
  const originalSucceed = spinner.succeed.bind(spinner);
  const originalFail = spinner.fail.bind(spinner);
  const originalStop = spinner.stop.bind(spinner);

  spinner.succeed = (text?: string) => {
    clearTimeout(timeoutId);
    return originalSucceed(text);
  };

  spinner.fail = (text?: string) => {
    clearTimeout(timeoutId);
    return originalFail(text);
  };

  spinner.stop = () => {
    clearTimeout(timeoutId);
    return originalStop();
  };

  return spinner;
}
