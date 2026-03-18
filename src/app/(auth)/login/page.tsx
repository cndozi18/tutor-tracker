'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type Step = 'email' | 'otp';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const supabase = createClient();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    if (error) {
      setError(error.message);
    } else {
      setStep('otp');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/calendar');
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-5 py-12 bg-background">
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4 shadow-card-lg">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <h1 className="font-serif text-3xl text-text">Tutor Tracker</h1>
          <p className="text-text-muted mt-1 text-sm">Your tutee management companion</p>
        </div>

        {/* Card */}
        <div className="bg-surface rounded-2xl shadow-card-lg p-6">
          {step === 'email' ? (
            <form onSubmit={handleSendCode} className="flex flex-col gap-5">
              <div>
                <h2 className="font-serif text-xl text-text mb-1">Sign in</h2>
                <p className="text-sm text-text-muted">We'll send a 6-digit code to your email.</p>
              </div>
              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
                required
              />
              {error && <p className="text-sm text-rag-red">{error}</p>}
              <Button type="submit" loading={loading} className="w-full">
                Send code
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
              <div>
                <h2 className="font-serif text-xl text-text mb-1">Enter your code</h2>
                <p className="text-sm text-text-muted">
                  We sent a 6-digit code to <span className="font-medium text-text">{email}</span>
                </p>
              </div>
              <Input
                label="6-digit code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                autoComplete="one-time-code"
                autoFocus
                required
              />
              {error && <p className="text-sm text-rag-red">{error}</p>}
              <Button type="submit" loading={loading} className="w-full">
                Sign in
              </Button>
              <button
                type="button"
                onClick={() => { setStep('email'); setOtp(''); setError(''); }}
                className="text-sm text-text-muted hover:text-primary transition-colors text-center"
              >
                Use a different email
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
