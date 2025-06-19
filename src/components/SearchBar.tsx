import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, DollarSign, Tag, User, Package, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const categories = [
  'Art & Paintings',
  'Vintage Watches',
  'Rare Books',
  'Antique Jewelry',
  'Classic Cars',
  'Wine & Spirits',
  'Collectible Coins',
  'Designer Fashion',
  'Musical Instruments',
  'Sports Memorabilia'
];

const locations = [
  'New York, NY',
  'Los Angeles, CA',
  'London, UK',
  'Paris, France',
  'Tokyo, Japan',
  'Hong Kong',
  'Dubai, UAE',
  'Singapore'
];

const priceRanges = [
  { label: 'Below $1,000', min: 0, max: 1000 },
  { label: '$1,000 - $10,000', min: 1000, max: 10000 },
  { label: '$10,000 - $50,000', min: 10000, max: 50000 },
  { label: '$50,000 - $100,000', min: 50000, max: 100000 },
  { label: 'Above $100,000', min: 100000, max: 10000000 }
];

interface SearchBarProps {
  onSearch: (query: string, filters: any) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'products' | 'users'>('products');
  const [filters, setFilters] = useState({
    category: '',
    priceRange: [0, 10000000],
    priceRangePreset: '',
    customPriceMin: '',
    customPriceMax: '',
    location: '',
    userKeywords: '',
    productKeywords: ''
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const popularProductSearches = [
    'Vintage Rolex Submariner',
    'Original Picasso Sketch',
    'First Edition Harry Potter',
    'Hermès Birkin Bag',
    '1967 Ferrari 275 GTB',
    'Dom Pérignon 1996',
    'Rare Pokemon Cards',
    'Chanel Vintage Jacket'
  ];

  const popularUserSearches = [
    'Art dealers in New York',
    'Watch collectors',
    'Book antiquarians',
    'Jewelry experts',
    'Car enthusiasts',
    'Wine connoisseurs',
    'Verified sellers',
    'Premium collectors'
  ];

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    
    if (value.length > 2) {
      const searchPool = searchType === 'products' ? popularProductSearches : popularUserSearches;
      const filtered = searchPool.filter(item =>
        item.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSearch = () => {
    const searchFilters = {
      ...filters,
      searchType,
      [searchType === 'products' ? 'productKeywords' : 'userKeywords']: searchQuery
    };
    onSearch(searchQuery, searchFilters);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    const searchFilters = {
      ...filters,
      searchType,
      [searchType === 'products' ? 'productKeywords' : 'userKeywords']: suggestion
    };
    onSearch(suggestion, searchFilters);
  };

  const handlePriceRangePreset = (preset: string) => {
    const range = priceRanges.find(r => r.label === preset);
    if (range) {
      setFilters({
        ...filters,
        priceRangePreset: preset,
        priceRange: [range.min, range.max],
        customPriceMin: '',
        customPriceMax: ''
      });
    }
  };

  const handleCustomPriceRange = () => {
    const min = parseInt(filters.customPriceMin) || 0;
    const max = parseInt(filters.customPriceMax) || 10000000;
    
    setFilters({
      ...filters,
      priceRange: [min, max],
      priceRangePreset: ''
    });
  };

  const getPlaceholder = () => {
    return searchType === 'products' 
      ? 'Search for rare items...' 
      : 'Search for collectors, dealers...';
  };

  return (
    <div className="w-full max-w-5xl mx-auto relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col gap-6"
      >
        {/* Search Type Selector */}
        <div className="flex justify-center">
          <Tabs value={searchType} onValueChange={(value) => setSearchType(value as 'products' | 'users')} className="w-auto">
            <TabsList className="luxury-card border-white/20 shadow-lg p-1">
              <TabsTrigger 
                value="products" 
                className="data-[state=active]:luxury-gradient-gold data-[state=active]:text-navy-900 data-[state=active]:shadow-md text-gray-600 flex items-center gap-2 px-6 py-3 rounded-lg luxury-button"
              >
                <Package className="w-4 h-4" />
                <span className="luxury-body font-medium">Products</span>
              </TabsTrigger>
              <TabsTrigger 
                value="users" 
                className="data-[state=active]:luxury-gradient-gold data-[state=active]:text-navy-900 data-[state=active]:shadow-md text-gray-600 flex items-center gap-2 px-6 py-3 rounded-lg luxury-button"
              >
                <User className="w-4 h-4" />
                <span className="luxury-body font-medium">Collectors</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Main Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch gap-4 luxury-card shadow-xl p-3 rounded-2xl">
          {/* Search Input */}
          <div className="flex-1 relative min-w-0">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder={getPlaceholder()}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-12 pr-4 py-6 text-lg border-0 focus:ring-0 bg-transparent luxury-body placeholder:text-gray-400 focus:outline-none"
              />
            </div>
            
            {/* Auto-suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute top-full left-0 right-0 luxury-card shadow-xl mt-2 z-50 overflow-hidden"
              >
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-4 py-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 luxury-hover"
                  >
                    <div className="flex items-center gap-3">
                      {searchType === 'products' ? (
                        <Package className="w-4 h-4 text-gray-400" />
                      ) : (
                        <User className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="luxury-body">{suggestion}</span>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Filters */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="lg" className="px-6 py-6 whitespace-nowrap luxury-button luxury-press border-gray-200 hover:border-amber-400 hover:bg-amber-50 rounded-xl">
                <Filter className="w-5 h-5 mr-2" />
                <span className="luxury-body font-medium">Filters</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-6 luxury-card shadow-xl border-gray-200/50" align="end">
              <div className="space-y-6">
                {/* Keyword Search */}
                <div>
                  <Label className="luxury-body font-medium mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Keyword Search
                  </Label>
                  <Input
                    placeholder={searchType === 'products' ? 'e.g., vintage, rare, authentic...' : 'e.g., verified, expert, dealer...'}
                    value={searchType === 'products' ? filters.productKeywords : filters.userKeywords}
                    onChange={(e) => setFilters({ 
                      ...filters, 
                      [searchType === 'products' ? 'productKeywords' : 'userKeywords']: e.target.value 
                    })}
                    className="luxury-input rounded-lg"
                  />
                  <p className="luxury-caption text-gray-500 mt-2">
                    {searchType === 'products' 
                      ? 'Search in titles, descriptions, and notes'
                      : 'Search in names, bios, and specialties'
                    }
                  </p>
                </div>

                {/* Category Filter (Products Only) */}
                {searchType === 'products' && (
                  <div>
                    <Label className="luxury-body font-medium mb-3 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-amber-500" />
                      Category
                    </Label>
                    <Select
                      value={filters.category}
                      onValueChange={(value) => setFilters({ ...filters, category: value })}
                    >
                      <SelectTrigger className="luxury-input rounded-lg">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="luxury-card">
                        {categories.map((category) => (
                          <SelectItem key={category} value={category} className="luxury-hover">
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Price Range Filter (Products Only) */}
                {searchType === 'products' && (
                  <div>
                    <Label className="luxury-body font-medium mb-3 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-amber-500" />
                      Price Range
                    </Label>
                    
                    {/* Preset Price Ranges */}
                    <div className="space-y-2 mb-4">
                      {priceRanges.map((range) => (
                        <button
                          key={range.label}
                          onClick={() => handlePriceRangePreset(range.label)}
                          className={`w-full text-left px-3 py-3 rounded-lg border luxury-hover luxury-press ${
                            filters.priceRangePreset === range.label
                              ? 'bg-amber-50 border-amber-300 text-amber-800'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <span className="luxury-body">{range.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Custom Price Range */}
                    <div className="border-t pt-4">
                      <Label className="luxury-caption text-gray-500 mb-2 block">Custom Range</Label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={filters.customPriceMin}
                          onChange={(e) => setFilters({ ...filters, customPriceMin: e.target.value })}
                          className="luxury-input rounded-lg"
                        />
                        <Input
                          type="number"
                          placeholder="Max"
                          value={filters.customPriceMax}
                          onChange={(e) => setFilters({ ...filters, customPriceMax: e.target.value })}
                          className="luxury-input rounded-lg"
                        />
                      </div>
                      <Button
                        onClick={handleCustomPriceRange}
                        variant="outline"
                        size="sm"
                        className="w-full luxury-button luxury-press border-gray-200 hover:border-amber-400 rounded-lg"
                      >
                        Apply Custom Range
                      </Button>
                    </div>

                    {/* Current Range Display */}
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <span className="luxury-caption text-gray-600">
                        Current: ${filters.priceRange[0].toLocaleString()} - ${filters.priceRange[1].toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Location Filter */}
                <div>
                  <Label className="luxury-body font-medium mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-500" />
                    Location
                  </Label>
                  <Select
                    value={filters.location}
                    onValueChange={(value) => setFilters({ ...filters, location: value })}
                  >
                    <SelectTrigger className="luxury-input rounded-lg">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent className="luxury-card">
                      {locations.map((location) => (
                        <SelectItem key={location} value={location} className="luxury-hover">
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleSearch}
                  className="w-full luxury-gradient-gold text-navy-900 font-medium luxury-button luxury-press rounded-xl shadow-lg"
                >
                  Apply Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Search Button */}
          <Button
            onClick={handleSearch}
            size="lg"
            className="px-8 py-6 luxury-gradient-gold text-navy-900 font-medium whitespace-nowrap luxury-button luxury-press rounded-xl shadow-lg"
          >
            <Search className="w-5 h-5 mr-2" />
            Search
          </Button>
        </div>
      </motion.div>
    </div>
  );
}