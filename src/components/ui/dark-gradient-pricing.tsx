import { motion } from "framer-motion"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface BenefitProps {
  text: string
  checked: boolean
}

const Benefit = ({ text, checked }: BenefitProps) => {
  return (
    <div className="flex items-center gap-3">
      {checked ? (
        <span className="grid size-4 place-content-center rounded-full bg-white/20 text-sm text-white backdrop-blur-sm">
          <Check className="size-3" />
        </span>
      ) : (
        <span className="grid size-4 place-content-center rounded-full bg-white/10 text-sm text-white/60 backdrop-blur-sm">
          <X className="size-3" />
        </span>
      )}
      <span className="text-sm text-white/90 font-medium">{text}</span>
    </div>
  )
}

interface PricingCardProps {
  tier: string
  price: string
  bestFor: string
  CTA: string
  benefits: Array<{ text: string; checked: boolean }>
  className?: string
}

export const PricingCard = ({
  tier,
  price,
  bestFor,
  CTA,
  benefits,
  className,
}: PricingCardProps) => {
  const getCardStyles = () => {
    switch (tier) {
      case "Free":
        return {
          gradient: "bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900",
          border: "border-slate-500/50",
          shimmer: "bg-gradient-to-r from-transparent via-slate-300/20 to-transparent",
          shadow: "shadow-slate-500/25",
          glow: "shadow-lg shadow-slate-500/20"
        }
      case "Pro":
        return {
          gradient: "bg-gradient-to-br from-amber-600 via-yellow-500 to-amber-700",
          border: "border-amber-400/60",
          shimmer: "bg-gradient-to-r from-transparent via-yellow-200/30 to-transparent",
          shadow: "shadow-amber-500/40",
          glow: "shadow-xl shadow-amber-500/30"
        }
      case "Legend":
        return {
          gradient: "bg-gradient-to-br from-indigo-800 via-purple-700 to-pink-600",
          border: "border-purple-400/60",
          shimmer: "bg-gradient-to-r from-transparent via-white/30 to-transparent",
          shadow: "shadow-purple-500/50",
          glow: "shadow-2xl shadow-purple-500/40"
        }
      default:
        return {
          gradient: "bg-gradient-to-br from-slate-800 to-slate-900",
          border: "border-slate-500/50",
          shimmer: "bg-gradient-to-r from-transparent via-slate-300/20 to-transparent",
          shadow: "shadow-slate-500/25",
          glow: "shadow-lg shadow-slate-500/20"
        }
    }
  }

  const styles = getCardStyles()

  return (
    <motion.div
      initial={{ filter: "blur(2px)", opacity: 0, y: 20 }}
      whileInView={{ filter: "blur(0px)", opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.5, ease: "easeInOut", delay: 0.25 }}
      className="relative"
    >
      <Card
        className={cn(
          "relative h-full w-full overflow-hidden border backdrop-blur-sm",
          styles.gradient,
          styles.border,
          styles.glow,
          "p-6 transition-all duration-300",
          className,
        )}
      >
        {/* Shimmer Effect */}
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-1000">
          <div className={cn(
            "absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]",
            styles.shimmer
          )} />
        </div>

        {/* Glistening Overlay for Legend */}
        {tier === "Legend" && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-purple-300/10 pointer-events-none" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-white/20 to-transparent rounded-full blur-xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-radial from-pink-300/20 to-transparent rounded-full blur-lg pointer-events-none" />
          </>
        )}

        <div className="relative z-10">
          <div className="flex flex-col items-center border-b pb-6 border-white/20">
            <span className="mb-6 inline-block text-white font-semibold text-lg tracking-wide">
              {tier}
            </span>
            <span className="mb-3 inline-block text-4xl font-bold text-white">
              {price}
            </span>
            <span className="text-center text-white/80 font-medium">
              {bestFor}
            </span>
          </div>
          <div className="space-y-4 py-9">
            {benefits.map((benefit, index) => (
              <Benefit key={index} {...benefit} />
            ))}
          </div>
          <Button
            className={cn(
              "w-full font-semibold transition-all duration-300",
              tier === "Pro" 
                ? "bg-white text-amber-700 hover:bg-white/90 shadow-lg" 
                : tier === "Legend"
                ? "bg-white text-purple-700 hover:bg-white/90 shadow-lg"
                : "bg-white/10 text-white hover:bg-white/20 border border-white/30"
            )}
          >
            {CTA}
          </Button>
        </div>
      </Card>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </motion.div>
  )
}