import { motion } from 'framer-motion';
import { TestimonialsSection } from '@/components/ui/testimonials-with-marquee';

const reviews = [
  {
    author: {
      name: "Victoria Ashford",
      handle: "@victoria_art",
      avatar: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150"
    },
    text: "Seekr helped me find a rare Basquiat piece that I'd been searching for over two years. The platform's network of dealers and collectors is unmatched.",
    href: "https://twitter.com/victoria_art"
  },
  {
    author: {
      name: "Marcus Chen",
      handle: "@marcus_watches",
      avatar: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150"
    },
    text: "I discovered an extremely rare 1950s Patek Philippe through Seekr. The verification process and seller transparency gave me complete confidence."
  },
  {
    author: {
      name: "Isabella Rodriguez",
      handle: "@isabella_curator",
      avatar: "https://images.pexels.com/photos/2169434/pexels-photo-2169434.jpeg?auto=compress&cs=tinysrgb&w=150"
    },
    text: "The quality of connections on Seekr is exceptional. I've sourced several pieces for major exhibitions through their platform."
  },
  {
    author: {
      name: "James Wellington",
      handle: "@james_antiques",
      avatar: "https://images.pexels.com/photos/2182973/pexels-photo-2182973.jpeg?auto=compress&cs=tinysrgb&w=150"
    },
    text: "As a dealer, Seekr has connected me with serious collectors I never would have reached otherwise. The platform elevates the entire transaction experience."
  },
  {
    author: {
      name: "Sophie Laurent",
      handle: "@sophie_vintage",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150"
    },
    text: "Finding authentic vintage Hermès pieces has never been easier. Seekr's verification system gives me peace of mind with every purchase."
  },
  {
    author: {
      name: "Alexander Petrov",
      handle: "@alex_rare_books",
      avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150"
    },
    text: "The rare manuscript collection I've built through Seekr is extraordinary. The platform connects you with items you never knew existed."
  }
];

export function Reviews() {
  return (
    <div id="reviews-section">
      <TestimonialsSection
        title="Trusted by Collectors Worldwide"
        description="Join thousands of discerning collectors who have discovered extraordinary pieces through Seekr"
        testimonials={reviews}
        className="bg-gray-50"
      />
    </div>
  );
}