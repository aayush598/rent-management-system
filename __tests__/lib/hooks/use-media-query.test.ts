import { renderHook, act } from "@testing-library/react";
import { useMediaQuery } from "@/lib/hooks/use-media-query";

describe("useMediaQuery", () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  });

  it("returns false as initial value", () => {
    renderHook(() => useMediaQuery("(min-width: 768px)"));
  });

  it("updates when change event fires with matches=true", () => {
    const listeners: Record<string, (event: MediaQueryListEvent) => void> = {};
    const addEventListener = vi.fn((event: string, cb: (event: MediaQueryListEvent) => void) => {
      listeners[event] = cb;
    });

    const mediaQueryList = {
      matches: false,
      media: "(min-width: 768px)",
      addEventListener,
      removeEventListener: vi.fn(),
    } as MediaQueryList;

    vi.mocked(window.matchMedia).mockReturnValue(mediaQueryList);

    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(false);

    act(() => {
      listeners.change({ matches: true } as MediaQueryListEvent);
    });

    expect(result.current).toBe(true);
  });

  it("updates when change event fires with matches=false", () => {
    const listeners: Record<string, (event: MediaQueryListEvent) => void> = {};
    const addEventListener = vi.fn((event: string, cb: (event: MediaQueryListEvent) => void) => {
      listeners[event] = cb;
    });

    const mediaQueryList = {
      matches: true,
      media: "(min-width: 768px)",
      addEventListener,
      removeEventListener: vi.fn(),
    } as MediaQueryList;

    vi.mocked(window.matchMedia).mockReturnValue(mediaQueryList);

    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));

    act(() => {
      listeners.change({ matches: false } as MediaQueryListEvent);
    });

    expect(result.current).toBe(false);
  });

  it("cleans up event listener on unmount", () => {
    const removeEventListener = vi.fn();
    const mediaQueryList = {
      matches: false,
      media: "(min-width: 768px)",
      addEventListener: vi.fn(),
      removeEventListener,
    } as MediaQueryList;

    vi.mocked(window.matchMedia).mockReturnValue(mediaQueryList);

    const { unmount } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    unmount();
    expect(removeEventListener).toHaveBeenCalled();
  });
});
