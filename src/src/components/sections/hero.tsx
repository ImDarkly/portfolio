export function Hero() {
  return (
    <section className="flex w-full flex-col items-start gap-2">
      <h1 className="max-w-full font-heading text-4xl leading-none font-medium tracking-tight break-words text-foreground sm:text-6xl">
        Oleksandr Hryhorchuk
      </h1>
      <p className="text-sm text-muted-foreground lowercase sm:text-base">
        frontend developer
      </p>
      <p className="max-w-prose font-sans text-sm leading-6 text-white lowercase sm:text-base">
        self-taught frontend developer who learns fast and ships polished React
        apps. i've built production-ready work both solo and with teams, and i'm
        looking for a role where i can contribute from day one and keep growing.
      </p>
    </section>
  )
}
