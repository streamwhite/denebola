# Offline Example

Offline support has two independent pieces, both exported by the runtime package:

- `createSyncQueue<T>()` — an in-memory queue with `enqueue`, `list` and `remove` for explicit sync work. Persist it through a `Storage` implementation if it must survive a restart.
- `migrate(database, migrations)` — ordered schema upgrades for whatever database the application adds.

```tsx
import { createSyncQueue, migrate, secureStorage } from "@your-scope/mobile-template";
import type { Migration } from "@your-scope/mobile-template";

const queue = createSyncQueue<{ orderId: string }>();
queue.enqueue({ orderId: "42" });

const migrations: Migration[] = [{ version: 1, up: async (database) => createOrdersTable(database) }];
const version = await migrate(database, migrations);   // database: { getVersion, setVersion }

await secureStorage.set("offline.queue", queue.list());
```

Native SQLite is deliberately not a dependency of the runtime. Add `expo-sqlite` in the application, open the database there and pass it to `migrate`, so the package never ships a native module the app did not ask for. Keep the queue payloads small and idempotent, and retry them from `subscribeToLifecycle` when the app returns to the foreground.

