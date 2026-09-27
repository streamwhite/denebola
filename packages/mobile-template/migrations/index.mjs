// Registry of migrations for framework-generated consumer files.
//
// A migration never touches business-owned files. Each entry declares the exact files the
// framework generated, the checksum of the content it shipped, and a transform. The runner
// refuses to write when the file no longer matches that pre-image, so a consumer edit is
// never overwritten silently.
//
// Entry shape:
// {
//   id: "2026-01-example",                 // sortable, unique
//   kind: "config",                        // "config" | "dependency" | "template"
//   description: "Why this migration exists",
//   breaking: false,                       // true when the change requires consumer action
//   files: [{ path: "src/app/_layout.tsx", previousChecksum: "<sha256>", transform: (content) => content }],
// }
//
// Kinds:
//   config      — app.config.ts, tsconfig/babel/metro, plugin options
//   dependency  — package.json scripts/ranges the framework owns
//   template    — generated source files the framework seeded (never business code)
export const migrations = [];
