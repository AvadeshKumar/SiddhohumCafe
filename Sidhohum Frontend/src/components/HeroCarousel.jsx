import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Zap, Phone, MapPin, Sparkles, Clock, CheckCircle2 } from 'lucide-react'
import { useCafe } from '../context/CafeContext'

{/* import cafeAmbience1 from '../assets/images/cafeAmbience1.jpg'
import cafeAmbience2 from '../assets/images/cafeAmbience2.jpg' */}
import cafeAmbience3 from '../assets/images/cafeAmbience3.jpg'
import cafeAmbience4 from '../assets/images/cafeAmbience4.jpg'
import cafeAmbience5 from '../assets/images/cafeAmbience5.jpg'
{/* import cafeAmbience6 from '../assets/images/cafeAmbience6.jpg' */}

export const HeroCarousel = () => {
  const { settings } = useCafe()
  const [currentSlide, setCurrentSlide] = useState(0)

  const heroImages = [
  cafeAmbience3,
  cafeAmbience4,
  cafeAmbience5
]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [heroImages.length])

  return (
    <section className="relative rounded-3xl overflow-hidden shadow-xl border border-amber-900/20 bg-stone-900 text-white min-h-[360px] md:min-h-[440px] flex items-end">
      {/* Background Images Carousel */}
      {heroImages.map((img, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentSlide ? 'opacity-85' : 'opacity-0'
          }`}
        >
          <img
            src={img}
            alt="Siddhohum Cafe Ambiance"
            className="w-full h-full object-cover scale-105 transform transition-transform duration-7000 ease-linear"
          />
        </div>
      ))}

      {/* Dark & Amber Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent" />
      <div className="absolute inset-0 bg-amber-950/20 mix-blend-multiply" />

      {/* Content Overlay */}
      <div className="relative z-10 p-6 md:p-10 w-full max-w-3xl space-y-4">

        {/* Badges Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`text-xs uppercase font-extrabold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm ${
              settings?.isOpen
                ? 'bg-emerald-600 text-white'
                : 'bg-rose-600 text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            {settings?.isOpen ? 'Kitchen Open Now' : 'Currently Closed'}
          </span>

          {/* <span className="bg-amber-500/90 text-stone-950 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <Zap className="w-3.5 h-3.5 fill-stone-950" />
            {settings?.deliveryEstimateMinutes || 10}-Min Express Delivery
          </span> */}

          {settings?.weekdayOffer?.isActive && (
            <span className="hidden sm:inline-flex bg-white/20 backdrop-blur-md text-amber-200 border border-white/20 text-xs font-semibold px-3 py-1 rounded-full items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              10% Off Weekday Special
            </span>
          )}
        </div>

        {/* Headings */}
        <div className="space-y-1">
          <h1 className="text-3xl md:text-5xl font-display font-extrabold tracking-tight leading-tight text-white drop-shadow-md">
            Your Everyday <br className="hidden sm:inline" />
            <span className="text-amber-400">Chai & Paratha Spot</span>
          </h1>
          <p className="text-stone-300 text-sm md:text-base max-w-xl font-normal leading-relaxed">
            {/* From kadak chai to poha and spicy honey chilli potato, enjoy your favourite bites at pocket-friendly prices in a peaceful, nature-inspired ambience, prepared fresh and delivered in minutes. */}
          </p>
        </div>

        {/* CTAs */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <Link
            to="/menu"
            className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-5 py-3 rounded-xl text-sm flex items-center gap-2 shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            <span>Browse Full Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href={`tel:${(settings?.phone || '8868977399').replace(/\D/g, '')}`}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 backdrop-blur transition"
          >
            <Phone className="w-4 h-4 text-amber-400" />
            <span>Call Cafe</span>
          </a>
        </div>

        {/* Carousel slide dots */}
        <div className="flex items-center gap-1.5 pt-2">
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === currentSlide ? 'w-6 bg-amber-400' : 'w-2 bg-white/40'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
