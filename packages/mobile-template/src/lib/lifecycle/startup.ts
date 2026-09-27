export type StartupStep = {
  name: string;
  run: () => Promise<void> | void;
  dependsOn?: readonly string[];
  optional?: boolean;
};

export type StartupError = { name: string; error: unknown };

export type StartupResult = { steps: string[]; errors: StartupError[]; durationMs: number };

export type StartupOptions = {
  onStep?: (name: string) => void;
  onError?: (name: string, error: unknown) => void;
};

// Dependency-ordered startup pipeline (auth restore, i18n, storage, query client, ...). Steps
// declare `dependsOn`; unknown or circular dependencies fail fast instead of running blindly.
export function orderStartupSteps(steps: readonly StartupStep[]): StartupStep[] {
  const byName = new Map(steps.map((step) => [step.name, step]));
  const ordered: StartupStep[] = [];
  const done = new Set<string>();
  const visiting = new Set<string>();

  function visit(step: StartupStep): void {
    if (done.has(step.name)) return;
    if (visiting.has(step.name)) throw new Error(`Circular startup dependency at ${step.name}`);
    visiting.add(step.name);
    for (const dependency of step.dependsOn ?? []) {
      const target = byName.get(dependency);
      if (!target) throw new Error(`Unknown startup dependency: ${dependency}`);
      visit(target);
    }
    visiting.delete(step.name);
    done.add(step.name);
    ordered.push(step);
  }

  for (const step of steps) visit(step);
  return ordered;
}

export async function runStartup(steps: readonly StartupStep[], options: StartupOptions = {}): Promise<StartupResult> {
  const started = Date.now();
  const completed: string[] = [];
  const errors: StartupError[] = [];

  for (const step of orderStartupSteps(steps)) {
    try {
      await step.run();
      completed.push(step.name);
      options.onStep?.(step.name);
    } catch (error) {
      errors.push({ name: step.name, error });
      options.onError?.(step.name, error);
      if (!step.optional) break;
    }
  }

  return { steps: completed, errors, durationMs: Date.now() - started };
}
