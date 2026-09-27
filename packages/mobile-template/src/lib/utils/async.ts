export type Debounced<A extends unknown[]> = ((...args: A) => void) & { cancel: () => void; flush: () => void };

export function debounce<A extends unknown[]>(fn: (...args: A) => void, waitMs: number): Debounced<A> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: A | null = null;

  function invoke(): void {
    if (pending === null) return;
    const args = pending;
    pending = null;
    fn(...args);
  }

  const debounced = ((...args: A) => {
    pending = args;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      invoke();
    }, waitMs);
  }) as Debounced<A>;

  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
    pending = null;
  };
  debounced.flush = () => {
    if (timer) clearTimeout(timer);
    timer = null;
    invoke();
  };
  return debounced;
}

export function throttle<A extends unknown[]>(fn: (...args: A) => void, waitMs: number): (...args: A) => void {
  let last = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: A | null = null;

  return (...args: A) => {
    const now = Date.now();
    const remaining = waitMs - (now - last);
    pending = args;
    if (remaining <= 0) {
      last = now;
      const current = pending;
      pending = null;
      fn(...current);
    } else if (!timer) {
      timer = setTimeout(() => {
        last = Date.now();
        timer = null;
        const current = pending;
        pending = null;
        if (current) fn(...current);
      }, remaining);
    }
  };
}
