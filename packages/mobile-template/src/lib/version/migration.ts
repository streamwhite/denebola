export type MigrationKind = "config" | "dependency" | "template";

export type MigrationFile = {
  path: string;
  previousChecksum: string;
  transform: (content: string) => string;
};

export type FrameworkMigration = {
  id: string;
  kind: MigrationKind;
  description: string;
  breaking: boolean;
  files: MigrationFile[];
};

// A codemod is a named, pure text transform reused by migrations.
export type Codemod = { id: string; description: string; apply: (content: string) => string };

export const DEFAULT_CODEMODS: readonly Codemod[] = [
  { id: "rename-import", description: "Rename an imported symbol", apply: (content) => content },
];

export function codemodById(id: string, codemods: readonly Codemod[] = DEFAULT_CODEMODS): Codemod | null {
  return codemods.find((codemod) => codemod.id === id) ?? null;
}

export function migrationSummary(migrations: readonly FrameworkMigration[]): { total: number; breaking: number; byKind: Record<MigrationKind, number> } {
  const byKind: Record<MigrationKind, number> = { config: 0, dependency: 0, template: 0 };
  for (const migration of migrations) byKind[migration.kind] += 1;
  return { total: migrations.length, breaking: migrations.filter((migration) => migration.breaking).length, byKind };
}
