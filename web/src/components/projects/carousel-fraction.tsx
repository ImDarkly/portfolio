import { useEffect, useState } from "react"

import { useCarousel } from "@/components/ui/carousel"

export function CarouselFraction() {
  const { api } = useCarousel()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [totalSlides, setTotalSlides] = useState(0)

  useEffect(() => {
    if (!api) return

    const update = () => {
      setCurrentSlide(api.selectedScrollSnap() + 1)
      setTotalSlides(api.scrollSnapList().length)
    }

    update()
    api.on("select", update)
    api.on("reInit", update)

    return () => {
      api.off("select", update)
      api.off("reInit", update)
    }
  }, [api])

  return (
    <p className="font-heading text-xs text-muted-foreground sm:text-sm">
      {currentSlide} / {totalSlides}
    </p>
  )
}
