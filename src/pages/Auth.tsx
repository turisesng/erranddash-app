import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Clock } from 'lucide-react';
import { PhoneInput } from '@/components/PhoneInput';
import { OtpInput } from '@/components/OtpInput';

type AuthStep = 'phone' | 'otp' | 'success';

export default function Auth() {
  const { sendOtp, verifyOtp, user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<AuthStep>('phone');
  const [phone, setPhone] = useState('+234');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const validateNigerianNumber = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 13 && digits.startsWith('234')) {
      const localNumber = digits.slice(3);
      const validPrefixes = ['703', '704', '705', '706', '708', '802', '803', '804', '805', '806', '807', '808', '809', '810', '811', '812', '813', '814', '815', '816', '817', '818', '819', '901', '902', '903', '904', '905', '906', '907', '908', '909', '915', '916', '917', '918'];
      return validPrefixes.some(prefix => localNumber.startsWith(prefix));
    }
    return false;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateNigerianNumber(phone)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid Nigerian phone number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    const { error } = await sendOtp(phone);
    
    if (error) {
      toast({
        title: "Failed to Send Code",
        description: error.message || "Could not send verification code. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Code Sent!",
        description: "Check your phone for the 6-digit verification code.",
      });
      setStep('otp');
      setCountdown(30); // 30 second cooldown
    }
    
    setIsLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter the complete 6-digit code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    const { error } = await verifyOtp(phone, otp);
    
    if (error) {
      if (error.message?.includes('expired')) {
        toast({
          title: "Code Expired",
          description: "The verification code has expired. Please request a new one.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Invalid Code",
          description: "The verification code is incorrect. Please try again.",
          variant: "destructive",
        });
      }
      setOtp('');
    } else {
      toast({
        title: "Welcome to Home Dash!",
        description: "Your phone number has been verified successfully.",
      });
      setStep('success');
    }
    
    setIsLoading(false);
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    const { error } = await sendOtp(phone);
    
    if (error) {
      toast({
        title: "Failed to Resend Code",
        description: error.message || "Could not resend verification code.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Code Resent!",
        description: "A new verification code has been sent to your phone.",
      });
      setCountdown(30);
      setOtp('');
    }
    
    setIsLoading(false);
  };

  const goBack = () => {
    if (step === 'otp') {
      setStep('phone');
      setOtp('');
      setCountdown(0);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {step === 'otp' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              className="absolute left-4 top-4"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <CardTitle className="text-2xl font-bold">Home Dash</CardTitle>
          <CardDescription>
            {step === 'phone' && "Enter your Nigerian phone number to get started"}
            {step === 'otp' && "Verify your phone number"}
            {step === 'success' && "Welcome to your residential management app"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'phone' && (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <PhoneInput
                value={phone}
                onChange={setPhone}
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading || !validateNigerianNumber(phone)}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  'Send Code'
                )}
              </Button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Code sent to {phone}
                </p>
                <OtpInput
                  value={otp}
                  onChange={setOtp}
                  disabled={isLoading}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Code'
                )}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleResendCode}
                  disabled={countdown > 0 || isLoading}
                  className="text-sm"
                >
                  {countdown > 0 ? (
                    <>
                      <Clock className="mr-2 h-4 w-4" />
                      Resend in {countdown}s
                    </>
                  ) : (
                    'Resend Code'
                  )}
                </Button>
              </div>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">
                Redirecting to your dashboard...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}