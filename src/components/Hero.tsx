import { motion } from 'framer-motion';
import { Search, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern';
import { Hero as AnimatedHero } from '@/components/ui/animated-hero';
import { cn } from '@/lib/utils';

export function Hero() {
  const scrollToAuth = () => {
    const authSection = document.getElementById('auth-section');
    if (authSection) {
      authSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToReviews = () => {
    const reviewsSection = document.getElementById('reviews-section');
    if (reviewsSection) {
      reviewsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      <AnimatedGridPattern
        numSquares={20}
        maxOpacity={0.08}
        duration={4}
        repeatDelay={2}
        className={cn(
          "[mask-image:radial-gradient(1000px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12 fill-amber-400/20 stroke-amber-400/30",
        )}
      />
      
      <div className="relative z-10 text-center max-w-6xl mx-auto luxury-container-padding">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex items-center justify-center mb-12"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full luxury-gradient-gold flex items-center justify-center shadow-lg shadow-amber-400/50">
              <Search className="w-6 h-6 text-navy-900" />
            </div>
            <span className="luxury-title text-white tracking-wider font-light">SEEKR</span>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="mb-8"
        >
          <AnimatedHero />
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          className="luxury-body-large text-gray-300 mb-16 max-w-3xl mx-auto leading-relaxed"
        >
          The world's most exclusive marketplace where discerning collectors, 
          connoisseurs, and curators connect to discover extraordinary art, 
          luxury items, and unique treasures.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <Button 
            size="lg" 
            onClick={scrollToAuth}
            className="luxury-gradient-gold text-navy-900 font-medium px-12 py-6 text-lg luxury-button luxury-press rounded-xl border-0 shadow-lg hover:shadow-xl shadow-amber-400/30 hover:shadow-amber-400/50"
          >
            <Sparkles className="mr-3 w-5 h-5" />
            Begin Your Search
            <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            onClick={scrollToReviews}
            className="border-2 border-amber-400/50 text-amber-400 hover:bg-amber-400/10 hover:border-amber-400 px-12 py-6 text-lg luxury-button luxury-press rounded-xl backdrop-blur-sm shadow-lg shadow-amber-400/20 hover:shadow-amber-400/40"
          >
            Discover More
          </Button>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
          className="mt-24 text-sm text-gray-400 luxury-caption"
        >
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50"></div>
            <span>Trusted by collectors worldwide</span>
            <div className="w-2 h-2 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}