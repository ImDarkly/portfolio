const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)"
const THEME_VALUES = ["dark", "light", "system"] as const

type Theme = (typeof THEME_VALUES)[number]
type ResolvedTheme = "dark" | "light"

function isTheme(value: string | null): value is Theme {
  return value !== null && (THEME_VALUES as readonly string[]).includes(value)
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia(COLOR_SCHEME_QUERY).matches ? "dark" : "light"
}

function disableTransitionsTemporarily() {
  const style = document.createElement("style")
  style.appendChild(
    document.createTextNode(
      "*,*::before,*::after{-webkit-transition:none!important;transition:none!important}"
    )
  )
  document.head.appendChild(style)

  return () => {
    window.getComputedStyle(document.body)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        style.remove()
      })
    })
  }
}

function applyTheme(nextTheme: Theme) {
  const root = document.documentElement
  const resolvedTheme = nextTheme === "system" ? getSystemTheme() : nextTheme
  const restoreTransitions = disableTransitionsTemporarily()

  root.classList.remove("light", "dark")
  root.classList.add(resolvedTheme)

  restoreTransitions()
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  if (target.isContentEditable) {
    return true
  }

  return Boolean(
    target.closest("input, textarea, select, [contenteditable='true']")
  )
}

export function startTheme(
  storageKey = "theme",
  defaultTheme: Theme = "system"
) {
  const storedTheme = localStorage.getItem(storageKey)
  let theme: Theme = isTheme(storedTheme) ? storedTheme : defaultTheme

  applyTheme(theme)

  const mediaQuery = window.matchMedia(COLOR_SCHEME_QUERY)
  mediaQuery.addEventListener("change", () => {
    if (theme === "system") {
      applyTheme("system")
    }
  })

  window.addEventListener("keydown", (event) => {
    if (event.repeat) {
      return
    }

    if (event.metaKey || event.ctrlKey || event.altKey) {
      return
    }

    if (isEditableTarget(event.target)) {
      return
    }

    if (event.key.toLowerCase() !== "d") {
      return
    }

    theme =
      theme === "dark"
        ? "light"
        : theme === "light"
          ? "dark"
          : getSystemTheme() === "dark"
            ? "light"
            : "dark"

    localStorage.setItem(storageKey, theme)
    applyTheme(theme)
  })

  window.addEventListener("storage", (event) => {
    if (event.storageArea !== localStorage) {
      return
    }

    if (event.key !== storageKey) {
      return
    }

    theme = isTheme(event.newValue) ? event.newValue : defaultTheme
    applyTheme(theme)
  })
}
