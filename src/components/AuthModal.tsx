import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const signUpSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type SignInForm = z.infer<typeof signInSchema>;
type SignUpForm = z.infer<typeof signUpSchema>;
type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'signin' | 'signup';
}

export function AuthModal({ isOpen, onClose, defaultTab = 'signin' }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResendingConfirmation, setIsResendingConfirmation] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  
  const { signIn, signUp, resetPassword, resendConfirmationEmail } = useAuth();
  const { showSuccess, showError } = useNotifications();

  const signInForm = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signUpForm = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const resetPasswordForm = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSignIn = async (data: SignInForm) => {
    setIsLoading(true);
    setAuthError(null);
    setUnconfirmedEmail(null);
    
    const { error } = await signIn(data.email, data.password);
    setIsLoading(false);
    
    if (error) {
      if (error.message === 'Invalid login credentials') {
        setAuthError('The email or password you entered is incorrect. Please check your credentials and try again.');
      } else if (error.message === 'Email not confirmed') {
        setAuthError('Your email address has not been confirmed yet. Please check your inbox for a confirmation email.');
        setUnconfirmedEmail(data.email);
      } else {
        setAuthError(error.message);
      }
    } else {
      showSuccess('Welcome back!', 'You have successfully signed in to your account.');
      onClose();
      signInForm.reset();
      setAuthError(null);
      setUnconfirmedEmail(null);
    }
  };

  const onSignUp = async (data: SignUpForm) => {
    setIsLoading(true);
    setAuthError(null);
    
    const { error } = await signUp(data.email, data.password, data.fullName);
    setIsLoading(false);
    
    if (error) {
      setAuthError(error.message);
      showError('Sign Up Failed', error.message);
    } else {
      showSuccess('Account Created!', 'Please check your email for a confirmation link to complete your registration.');
      onClose();
      signUpForm.reset();
      setAuthError(null);
    }
  };

  const onResetPassword = async (data: ResetPasswordForm) => {
    setIsLoading(true);
    setAuthError(null);
    
    const { error } = await resetPassword(data.email);
    setIsLoading(false);
    
    if (error) {
      setAuthError(error.message);
      showError('Reset Failed', error.message);
    } else {
      showSuccess('Reset Email Sent!', 'Please check your email for password reset instructions.');
      setShowResetForm(false);
      resetPasswordForm.reset();
      setAuthError(null);
    }
  };

  const handleResendConfirmation = async () => {
    if (!unconfirmedEmail) return;
    
    setIsResendingConfirmation(true);
    setAuthError(null);
    
    const { error } = await resendConfirmationEmail(unconfirmedEmail);
    setIsResendingConfirmation(false);
    
    if (error) {
      setAuthError(error.message);
      showError('Resend Failed', error.message);
    } else {
      showSuccess('Email Sent!', 'Please check your inbox for the confirmation email.');
      setUnconfirmedEmail(null);
    }
  };

  const handleClose = () => {
    onClose();
    setShowResetForm(false);
    setAuthError(null);
    setUnconfirmedEmail(null);
    signInForm.reset();
    signUpForm.reset();
    resetPasswordForm.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light text-center text-black">
            {showResetForm ? 'Reset Password' : 'Welcome to Seekr'}
          </DialogTitle>
        </DialogHeader>

        {authError && (
          <Alert className="bg-red-900/20 border-red-800 text-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}

        <AnimatePresence mode="wait">
          {showResetForm ? (
            <motion.div
              key="reset"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={resetPasswordForm.handleSubmit(onResetPassword)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-black">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10 bg-gray-800 border-gray-700 text-white"
                      {...resetPasswordForm.register('email')}
                    />
                  </div>
                  {resetPasswordForm.formState.errors.email && (
                    <p className="text-sm text-red-400">
                      {resetPasswordForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-amber-400 hover:bg-amber-500 text-black"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Send Reset Email
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-gray-400 hover:text-white"
                  onClick={() => {
                    setShowResetForm(false);
                    setAuthError(null);
                  }}
                >
                  Back to Sign In
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="auth"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Tabs value={activeTab} onValueChange={(value) => {
                setActiveTab(value as 'signin' | 'signup');
                setAuthError(null);
                setUnconfirmedEmail(null);
              }}>
                <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                  <TabsTrigger value="signin" className="data-[state=active]:bg-amber-400 data-[state=active]:text-black text-black">
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-amber-400 data-[state=active]:text-black text-black">
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="space-y-4 mt-6">
                  <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-black">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10 bg-gray-800 border-gray-700 text-white"
                          {...signInForm.register('email')}
                        />
                      </div>
                      {signInForm.formState.errors.email && (
                        <p className="text-sm text-red-400">
                          {signInForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="text-black">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signin-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white"
                          {...signInForm.register('password')}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 text-gray-400 hover:text-white w-5 h-5 flex items-center justify-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {signInForm.formState.errors.password && (
                        <p className="text-sm text-red-400">
                          {signInForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    {unconfirmedEmail && (
                      <div className="bg-amber-900/20 border border-amber-800 rounded-lg p-3">
                        <p className="text-sm text-amber-200 mb-2">
                          Need to confirm your email? We can resend the confirmation link.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full border-amber-600 text-amber-400 hover:bg-amber-900/30"
                          onClick={handleResendConfirmation}
                          disabled={isResendingConfirmation}
                        >
                          {isResendingConfirmation ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="mr-2 h-4 w-4" />
                          )}
                          Resend Confirmation Email
                        </Button>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-amber-400 hover:bg-amber-500 text-black"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Sign In
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full text-gray-400 hover:text-white"
                      onClick={() => {
                        setShowResetForm(true);
                        setAuthError(null);
                        setUnconfirmedEmail(null);
                      }}
                    >
                      Forgot your password?
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4 mt-6">
                  <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-black">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Enter your full name"
                          className="pl-10 bg-gray-800 border-gray-700 text-white"
                          {...signUpForm.register('fullName')}
                        />
                      </div>
                      {signUpForm.formState.errors.fullName && (
                        <p className="text-sm text-red-400">
                          {signUpForm.formState.errors.fullName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-black">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10 bg-gray-800 border-gray-700 text-white"
                          {...signUpForm.register('email')}
                        />
                      </div>
                      {signUpForm.formState.errors.email && (
                        <p className="text-sm text-red-400">
                          {signUpForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-black">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a strong password"
                          className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white"
                          {...signUpForm.register('password')}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 text-gray-400 hover:text-white w-5 h-5 flex items-center justify-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {signUpForm.formState.errors.password && (
                        <p className="text-sm text-red-400">
                          {signUpForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password" className="text-black">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-confirm-password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm your password"
                          className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white"
                          {...signUpForm.register('confirmPassword')}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 text-gray-400 hover:text-white w-5 h-5 flex items-center justify-center"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {signUpForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-red-400">
                          {signUpForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-amber-400 hover:bg-amber-500 text-black"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Create Account
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-xs text-gray-500 text-center mt-4">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </DialogContent>
    </Dialog>
  );
}