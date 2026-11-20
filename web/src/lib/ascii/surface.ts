export const CONTENT_SELECTOR = "[data-ascii-layout] > *, [data-ascii-block]"

export function isEmptySpace(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false

  return (
    target === document.documentElement ||
    target === document.body ||
    target.tagName === "MAIN" ||
    target.hasAttribute("data-ascii-layout")
  )
}
