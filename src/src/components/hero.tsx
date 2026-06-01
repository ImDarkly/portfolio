export function Hero() {
  return (
    <section className="flex w-full flex-col items-start gap-2">
      <h1 className="max-w-full break-words font-heading text-4xl font-medium leading-none tracking-tight text-foreground sm:text-6xl">
        Alex Morgan
      </h1>
      <p className="lowercase text-sm text-muted-foreground sm:text-base">
        frontend developer
      </p>
      <p className="lowercase max-w-prose font-sans text-sm leading-6 text-white sm:text-base">
        I build clean, responsive interfaces with a focus on clarity, speed,
        and a calm visual rhythm. Right now I&apos;m shaping simple portfolio
        experiences that feel direct, readable, and easy to scan.
      </p>
    </section>
  )
}
