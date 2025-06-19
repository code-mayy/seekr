import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, Shield, Users, Zap, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthModal } from '@/components/AuthModal';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Auth() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'signin' | 'signup'>('signin');
  const { user, signOut, loading } = useAuth();

  const handleSignUp = () => {
    setModalTab('signup');
    setIsModalOpen(true);
  };

  const handleSignIn = () => {
    setModalTab('signin');
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <section id="auth-section" className="py-24 bg-black">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
        </div>
      </section>
    );
  }

  if (user) {
    return (
      <section id="auth-section" className="py-24 bg-black">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Card className="bg-gray-900 border-gray-800 max-w-md mx-auto">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-amber-400 text-black text-lg font-medium">
                      {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-2xl text-white">Welcome back!</CardTitle>
                <CardDescription className="text-gray-400">
                  {user.user_metadata?.full_name || user.email}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  size="lg" 
                  className="w-full bg-amber-400 hover:bg-amber-500 text-black font-medium py-4"
                >
                  <User className="mr-2 w-5 h-5" />
                  Go to Dashboard
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full border-gray-700 text-white hover:bg-gray-800 py-4"
                  onClick={signOut}
                >
                  <LogOut className="mr-2 w-5 h-5" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="auth-section" className="py-24 bg-black">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-light text-white mb-4">
            Join the Elite Network
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Connect with verified collectors, dealers, and curators in the most exclusive marketplace for rare finds
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-amber-400/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-white mb-2">Verified Network</h3>
                <p className="text-gray-400">All members undergo rigorous verification to ensure authenticity and trust</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-amber-400/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-white mb-2">Exclusive Access</h3>
                <p className="text-gray-400">Connect with collectors, dealers, and curators from around the world</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-amber-400/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-white mb-2">Instant Matching</h3>
                <p className="text-gray-400">Our AI-powered system matches your requests with the right collectors instantly</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white">Get Started</CardTitle>
                <CardDescription className="text-gray-400">
                  Join thousands of collectors and discover your next treasure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  size="lg" 
                  className="w-full bg-amber-400 hover:bg-amber-500 text-black font-medium py-4 group"
                  onClick={handleSignUp}
                >
                  <UserPlus className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                  Create Account
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-900 text-gray-400">or</span>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full border-gray-700 text-white hover:bg-gray-800 py-4 group"
                  onClick={handleSignIn}
                >
                  <LogIn className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                  Sign In
                </Button>
                
                <p className="text-xs text-gray-500 text-center mt-6">
                  By joining, you agree to our Terms of Service and Privacy Policy
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <AuthModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        defaultTab={modalTab}
      />
    </section>
  );
}