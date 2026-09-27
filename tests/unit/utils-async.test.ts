import { afterEach, describe, expect, it, vi } from "vitest";
import { debounce, throttle } from "@/lib/utils/async";

afterEach(() => {
  vi.useRealTimers();
});

describe("debounce", () => {
  it("invokes once with the latest args after the wait", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced("a");
    debounced("b");
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith("b");
  });

  it("supports cancel and flush", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced("a");
    debounced.cancel();
    vi.advanceTimersByTime(100);
    expect(fn).not.toHaveBeenCalled();

    debounced("b");
    debounced.flush();
    expect(fn).toHaveBeenCalledWith("b");
  });
});

describe("throttle", () => {
  it("invokes immediately then at most once per window", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled(1);
    throttled(2);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(1);

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith(2);
  });
});
