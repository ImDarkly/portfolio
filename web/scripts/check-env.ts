const requiredEnv = [
  "PUBLIC_GITHUB",
  "PUBLIC_LINKEDIN",
  "PUBLIC_EMAIL",
] as const

export function checkEnv(env: Record<string, string | undefined>): string[] {
  return requiredEnv
    .filter((name) => !env[name]?.trim())
    .map((name) => `${name} is missing or empty`)
}
