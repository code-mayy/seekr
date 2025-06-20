import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, User, LogOut, Settings, Plus, Home, DollarSign, Crown, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { profileService, type Profile } from '@/lib/database';

interface NavigationProps {
  currentView: 'homepage' | 'profile' | 'pricing' | 'escrow';
  onViewChange: (view: 'homepage' | 'profile' | 'pricing' | 'escrow') => void;
  onCreateListing: () => void;
}

export function Navigation({ currentView, onViewChange, onCreateListing }: NavigationProps) {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      const profileData = await profileService.getProfile(user.id);
      if (profileData) {
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Failed to load profile for navigation:', error);
    }
  };

  return (
    <nav className="luxury-gradient-navy text-white border-b border-white/10 luxury-backdrop">
      <div className="max-w-7xl mx-auto luxury-container-padding">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex items-center cursor-pointer luxury-hover"
            onClick={() => onViewChange('homepage')}
          >
            <div className="w-10 h-10 rounded-full luxury-gradient-gold flex items-center justify-center mr-3">
              <Search className="w-5 h-5 text-navy-900" />
            </div>
            <span className="luxury-title tracking-wider font-light">SEEKR</span>
          </motion.div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-2">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            >
              <Button
                variant={currentView === 'homepage' ? 'default' : 'ghost'}
                onClick={() => onViewChange('homepage')}
                className={`luxury-button luxury-press rounded-xl px-6 py-3 ${
                  currentView === 'homepage' 
                    ? 'luxury-gradient-gold text-navy-900 shadow-lg' 
                    : 'text-white hover:bg-white/10 border-0'
                }`}
              >
                <Home className="w-4 h-4 mr-2" />
                Discover
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            >
              <Button
                variant={currentView === 'pricing' ? 'default' : 'ghost'}
                onClick={() => onViewChange('pricing')}
                className={`luxury-button luxury-press rounded-xl px-6 py-3 ${
                  currentView === 'pricing' 
                    ? 'luxury-gradient-gold text-navy-900 shadow-lg' 
                    : 'text-white hover:bg-white/10 border-0'
                }`}
              >
                <Crown className="w-4 h-4 mr-2" />
                Premium
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            >
              <Button
                variant="outline"
                onClick={onCreateListing}
                className="border-2 border-amber-400/50 text-amber-400 hover:bg-amber-400/10 hover:border-amber-400 luxury-button luxury-press rounded-xl px-6 py-3 backdrop-blur-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                List Request
              </Button>
            </motion.div>

            {/* User Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-12 w-12 rounded-full luxury-hover luxury-press">
                    <Avatar className="h-10 w-10 border-2 border-amber-400/50 shadow-lg">
                      <AvatarImage src={profile?.avatar_url || user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="luxury-gradient-gold text-navy-900 font-semibold">
                        {profile?.full_name?.charAt(0) || user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 luxury-card border-gray-200/50 shadow-xl" align="end" forceMount>
                  <div className="flex items-center justify-start gap-3 p-4">
                    <Avatar className="h-12 w-12 border-2 border-amber-400/30">
                      <AvatarImage src={profile?.avatar_url || user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="luxury-gradient-gold text-navy-900 font-semibold">
                        {profile?.full_name?.charAt(0) || user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-gray-900 luxury-body">
                        {profile?.full_name || user?.user_metadata?.full_name || 'User'}
                      </p>
                      <p className="w-[180px] truncate text-sm text-gray-500 luxury-caption">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-gray-200/50" />
                  <DropdownMenuItem
                    onClick={() => onViewChange('profile')}
                    className={`luxury-hover cursor-pointer rounded-lg mx-2 my-1 ${
                      currentView === 'profile' ? 'bg-amber-50 text-amber-700' : 'hover:bg-gray-50'
                    }`}
                  >
                    <User className="mr-3 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onViewChange('escrow')}
                    className="luxury-hover cursor-pointer rounded-lg mx-2 my-1 hover:bg-gray-50"
                  >
                    <Shield className="mr-3 h-4 w-4" />
                    Blockchain Escrow
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onViewChange('pricing')}
                    className="luxury-hover cursor-pointer rounded-lg mx-2 my-1 hover:bg-gray-50"
                  >
                    <Crown className="mr-3 h-4 w-4" />
                    Premium Plans
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onViewChange('profile')}
                    className="luxury-hover cursor-pointer rounded-lg mx-2 my-1 hover:bg-gray-50"
                  >
                    <Settings className="mr-3 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200/50" />
                  <DropdownMenuItem 
                    onClick={signOut}
                    className="luxury-hover cursor-pointer rounded-lg mx-2 my-1 hover:bg-red-50 text-red-600"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          </div>
        </div>
      </div>
    </nav>
  );
}