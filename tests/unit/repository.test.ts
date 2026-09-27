import { describe, expect, it } from "vitest";
import { createMemoryTableAdapter, createRepository } from "@/lib/database/repository";

type Note = { id: string; title: string };

describe("createRepository", () => {
  it("saves, reads, lists and removes entities", async () => {
    const repository = createRepository<Note>(createMemoryTableAdapter<Note>());

    await repository.save({ id: "1", title: "a" });

    expect(await repository.get("1")).toEqual({ id: "1", title: "a" });
    expect(await repository.list()).toHaveLength(1);

    await repository.remove("1");
    expect(await repository.get("1")).toBeNull();
  });

  it("saves many entities and clears the table", async () => {
    const repository = createRepository<Note>(createMemoryTableAdapter<Note>());

    await repository.saveMany([
      { id: "1", title: "a" },
      { id: "2", title: "b" },
    ]);
    expect(await repository.list()).toHaveLength(2);

    await repository.clear();
    expect(await repository.list()).toEqual([]);
  });
});
