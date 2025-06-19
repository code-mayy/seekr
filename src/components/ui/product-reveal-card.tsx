import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Star, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProductRevealCardProps {
  name: string;
  price: string;
  image: string;
  description: string;
  rating: number;
  reviewCount: number;
  onAdd: () => void;
  onFavorite: () => void;
  onShowDetails?: () => void;
  className?: string;
}

export function ProductRevealCard({
  name,
  price,
  image,
  description,
  rating,
  reviewCount,
  onAdd,
  onFavorite,
  onShowDetails,
  className
}: ProductRevealCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card 
      className={cn("group relative overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <motion.img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500"
          animate={{ scale: isHovered ? 1.05 : 1 }}
        />
        
        {/* Overlay with actions */}
        <motion.div
          className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/90 hover:bg-white text-black"
            onClick={onFavorite}
          >
            <Heart className="w-4 h-4" />
          </Button>
          
          {onShowDetails && (
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/90 hover:bg-white text-black"
              onClick={onShowDetails}
            >
              <Eye className="w-4 h-4 mr-1" />
              Details
            </Button>
          )}
        </motion.div>

        {/* Price Badge */}
        <div className="absolute top-3 right-3">
          <Badge className="bg-amber-400 text-black font-semibold">
            {price}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg line-clamp-2 mb-2">
            {name}
          </h3>
          
          <p className="text-gray-600 text-sm line-clamp-3 mb-3">
            {description}
          </p>
        </div>

        {/* Rating and Reviews */}
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{rating}</span>
          </div>
          <span className="text-gray-500">({reviewCount} views)</span>
        </div>

        {/* Action Button */}
        <Button
          onClick={onAdd}
          className="w-full bg-amber-400 hover:bg-amber-500 text-black font-medium"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Contact Seller
        </Button>
      </CardContent>
    </Card>
  );
}