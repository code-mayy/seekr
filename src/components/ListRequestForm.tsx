import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Eye, MapPin, DollarSign, Tag, FileText, Camera, Crown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { listingService, storageService } from '@/lib/database';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { PricingModal } from '@/components/PricingModal';

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

const conditions = [
  'Mint/New',
  'Excellent',
  'Very Good',
  'Good',
  'Fair',
  'Any Condition'
];

const requestSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  category: z.string().min(1, 'Please select a category'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  maxBudget: z.number().min(1, 'Budget must be at least $1'),
  preferredCondition: z.string().min(1, 'Please select preferred condition'),
  location: z.string().min(1, 'Location is required'),
  additionalNotes: z.string().optional(),
});

type RequestForm = z.infer<typeof requestSchema>;

interface ListRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: any) => void;
}

export function ListRequestForm({ isOpen, onClose, onSubmit }: ListRequestFormProps) {
  const { user } = useAuth();
  const [images, setImages] = useState<File[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [userListingCount, setUserListingCount] = useState(0);
  const [hasCheckedListings, setHasCheckedListings] = useState(false);

  const form = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      title: '',
      category: '',
      description: '',
      maxBudget: 1000,
      preferredCondition: '',
      location: '',
      additionalNotes: '',
    },
  });

  // Check user's listing count when modal opens
  useEffect(() => {
    if (isOpen && user && !hasCheckedListings) {
      checkUserListings();
    }
  }, [isOpen, user, hasCheckedListings]);

  const checkUserListings = async () => {
    if (!user) return;
    
    try {
      const listings = await listingService.getUserListings(user.id);
      setUserListingCount(listings.length);
      setHasCheckedListings(true);
    } catch (error) {
      console.error('Error checking user listings:', error);
      setUserListingCount(0);
      setHasCheckedListings(true);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    
    // Validate file sizes (max 10MB each)
    const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error('Some files are too large. Maximum size is 10MB per image.');
      return;
    }
    
    setImages([...images, ...files]);
    toast.success(`${files.length} image(s) uploaded successfully`);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (data: RequestForm) => {
    if (!user) {
      toast.error('You must be logged in to create a listing');
      return;
    }

    // Check if user needs to upgrade (has already used free listing)
    if (userListingCount >= 1) {
      setShowPricing(true);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Upload images to storage
      const imageUrls = [];
      for (const image of images) {
        const url = await storageService.uploadImage(image);
        if (url) imageUrls.push(url);
      }

      // Create listing in database
      const listing = await listingService.createListing({
        title: data.title,
        category: data.category,
        description: data.description,
        max_budget: data.maxBudget,
        preferred_condition: data.preferredCondition,
        location: data.location,
        additional_notes: data.additionalNotes || '',
        images: imageUrls,
      });

      if (listing) {
        toast.success('Your listing has been created successfully!');
        
        // Call parent onSubmit if provided
        if (onSubmit) {
          onSubmit({
            ...data,
            images: imageUrls,
            id: listing.id,
          });
        }
        
        // Reset form and close
        form.reset();
        setImages([]);
        setShowPreview(false);
        setUserListingCount(prev => prev + 1);
        onClose();
      }
      
    } catch (error) {
      console.error('Error creating listing:', error);
      toast.error('Failed to create listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlanSelection = (planId: string) => {
    setShowPricing(false);
    
    if (planId === 'free') {
      // User selected free plan but already used it
      toast.error('You have already used your free listing. Please upgrade to create more listings.');
      return;
    }
    
    // For now, just show success message
    // In a real app, you'd integrate with payment processor
    toast.success(`Upgrading to ${planId} plan... (Payment integration would happen here)`);
    
    // Allow user to continue with listing creation
    // In real implementation, this would happen after successful payment
  };

  const handleClose = () => {
    onClose();
    form.reset();
    setImages([]);
    setShowPreview(false);
    setShowPricing(false);
    setHasCheckedListings(false);
  };

  const canCreateFreeListing = userListingCount === 0;

  return (
    <>
      <Dialog open={isOpen && !showPricing} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-light text-gray-900 flex items-center gap-2">
              Create New Listing
              {canCreateFreeListing && (
                <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Free Listing
                </span>
              )}
            </DialogTitle>
            <p className="text-gray-600">
              {canCreateFreeListing 
                ? "Create your first listing for free! Additional listings require a subscription."
                : "Create a listing to find the rare item you're looking for"
              }
            </p>
          </DialogHeader>

          {!canCreateFreeListing && (
            <Alert className="bg-amber-50 border-amber-200">
              <Crown className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                You've used your free listing. Upgrade to Premium for unlimited listings and enhanced features.
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-amber-600 underline ml-1"
                  onClick={() => setShowPricing(true)}
                >
                  View Plans
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {!showPreview ? (
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Item Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Vintage Rolex Submariner 1960s"
                      {...form.register('title')}
                      className="mt-1"
                    />
                    {form.formState.errors.title && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.title.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={form.watch('category')}
                      onValueChange={(value) => form.setValue('category', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.category && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.category.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the item you're looking for in detail..."
                      rows={4}
                      {...form.register('description')}
                      className="mt-1"
                    />
                    {form.formState.errors.description && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.description.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Images */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Reference Images
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">
                        Upload reference images (optional)
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Maximum 5 images, up to 10MB each
                      </p>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('image-upload')?.click()}
                      >
                        Choose Images
                      </Button>
                    </div>

                    {images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {images.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Upload ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Budget & Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Budget & Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Maximum Budget: ${form.watch('maxBudget')?.toLocaleString()}</Label>
                    <Slider
                      value={[form.watch('maxBudget') || 1000]}
                      onValueChange={(value) => form.setValue('maxBudget', value[0])}
                      max={1000000}
                      min={100}
                      step={100}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>$100</span>
                      <span>$1,000,000</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="condition">Preferred Condition *</Label>
                    <Select
                      value={form.watch('preferredCondition')}
                      onValueChange={(value) => form.setValue('preferredCondition', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select preferred condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditions.map((condition) => (
                          <SelectItem key={condition} value={condition}>
                            {condition}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.preferredCondition && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.preferredCondition.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="location">Location Preferences *</Label>
                    <Input
                      id="location"
                      placeholder="e.g., New York, NY or Worldwide"
                      {...form.register('location')}
                      className="mt-1"
                    />
                    {form.formState.errors.location && (
                      <p className="text-sm text-red-500 mt-1">
                        {form.formState.errors.location.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Additional Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Additional Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="notes">Additional Notes/Specifications</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any specific requirements, authentication needs, or additional details..."
                      rows={3}
                      {...form.register('additionalNotes')}
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPreview(true)}
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !canCreateFreeListing}
                  className="bg-amber-400 hover:bg-amber-500 text-black px-8"
                >
                  {isSubmitting ? 'Creating...' : !canCreateFreeListing ? 'Upgrade Required' : 'Create Free Listing'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Listing Preview</h3>
                <p className="text-gray-600">Review your listing before creating</p>
              </div>

              <Card>
                <CardContent className="p-6">
                  <h4 className="text-lg font-semibold mb-4">{form.watch('title')}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-gray-500">Category:</span>
                      <p className="font-medium">{form.watch('category')}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Max Budget:</span>
                      <p className="font-medium text-amber-600">
                        ${form.watch('maxBudget')?.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Condition:</span>
                      <p className="font-medium">{form.watch('preferredCondition')}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Location:</span>
                      <p className="font-medium">{form.watch('location')}</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <span className="text-sm text-gray-500">Description:</span>
                    <p className="mt-1">{form.watch('description')}</p>
                  </div>
                  {form.watch('additionalNotes') && (
                    <div className="mb-4">
                      <span className="text-sm text-gray-500">Additional Notes:</span>
                      <p className="mt-1">{form.watch('additionalNotes')}</p>
                    </div>
                  )}
                  {images.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-500">Images:</span>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {images.map((image, index) => (
                          <img
                            key={index}
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPreview(false)}
                >
                  Edit Listing
                </Button>
                <Button
                  onClick={form.handleSubmit(handleSubmit)}
                  disabled={isSubmitting || !canCreateFreeListing}
                  className="bg-amber-400 hover:bg-amber-500 text-black px-8"
                >
                  {isSubmitting ? 'Creating...' : !canCreateFreeListing ? 'Upgrade Required' : 'Create Free Listing'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Pricing Modal */}
      <PricingModal
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
        onSelectPlan={handlePlanSelection}
        currentListingCount={userListingCount}
      />
    </>
  );
}