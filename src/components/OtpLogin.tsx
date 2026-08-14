"use client";

import { ArrowLeft, CheckCircle2, LogOut, Mail, Phone, ShieldCheck, UserRound, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { createClient } from '@/lib/supabaseClient';

const subscribeToHydration = () => () => {};

function maskedPhone(phone: string) {
  const digits = phone.replace(/\D/g, '').slice(-10);
  return `+91 ${digits.slice(0, 2)}••• ••${digits.slice(-3)}`;
}

export default function OtpLogin({ phone }: { phone?: string }) {
  const router = useRouter();
  const supabase = createClient();
  const mounted = useSyncExternalStore(subscribeToHydration, () => true, () => false);

  const [open, setOpen] = useState(false);
  const [authMode] = useState<'mobile' | 'email'>('email');
  const [step, setStep] = useState<'input' | 'otp'>('input');
  
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [userSession, setUserSession] = useState<{ email?: string; phone?: string; name?: string; avatar?: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserSession({
          email: session.user.email,
          phone: session.user.phone,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.user_metadata?.first_name,
          avatar: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserSession({
          email: session.user.email,
          phone: session.user.phone,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.user_metadata?.first_name,
          avatar: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
        });
      } else {
        setUserSession(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const sendOtp = async (event?: FormEvent) => {
    event?.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (authMode === 'mobile') {
        const fullPhone = `+91${mobile}`;
        const { error: sbError } = await supabase.auth.signInWithOtp({ phone: fullPhone });
        if (sbError) {
          // Fallback to local OTP endpoint if SMS provider is not yet configured in Supabase dashboard
          const response = await fetch('/api/otp/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: mobile }),
          });
          const result = await response.json().catch(() => ({ error: 'Unable to send OTP.' }));
          if (!response.ok) {
            setError(sbError.message || result.error || 'Unable to send OTP.');
            return;
          }
        }
      } else {
        const { error: sbError } = await supabase.auth.signInWithOtp({ email });
        if (sbError) {
          setError(sbError.message);
          return;
        }
      }

      setStep('otp');
      setCooldown(30);
    } catch {
      setError('Unable to connect. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (authMode === 'mobile') {
        const fullPhone = `+91${mobile}`;
        const { error: sbError } = await supabase.auth.verifyOtp({
          phone: fullPhone,
          token: otp,
          type: 'sms',
        });

        if (sbError) {
          // Fallback verification
          const response = await fetch('/api/otp/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: mobile, otp }),
          });
          const result = await response.json().catch(() => ({ error: 'Invalid OTP.' }));
          if (!response.ok) {
            setError(sbError.message || result.error || 'Invalid OTP.');
            return;
          }
        }
      } else {
        const { error: sbError } = await supabase.auth.verifyOtp({
          email,
          token: otp,
          type: 'email',
        });
        if (sbError) {
          setError(sbError.message);
          return;
        }
      }

      setOpen(false);
      setStep('input');
      setOtp('');
      router.refresh();
    } catch {
      setError('Unable to connect. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'facebook' | 'apple') => {
    setError('');
    try {
      const { error: sbError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (sbError) setError(sbError.message);
    } catch {
      setError(`Unable to initialize ${provider} sign-in.`);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    await fetch('/api/otp/logout', { method: 'POST' });
    setUserSession(null);
    setOpen(false);
    router.refresh();
  };

  const displayName = userSession?.name || userSession?.email || (userSession?.phone ? maskedPhone(userSession.phone) : phone);
  const displayEmailOrPhone = userSession?.name ? (userSession.email || (userSession.phone ? maskedPhone(userSession.phone) : '')) : null;

  return (
    <>
      <button
        className="profile-avatar"
        style={userSession?.avatar ? { padding: 0, overflow: 'hidden' } : undefined}
        aria-label={displayName ? `Account ${displayName}` : 'Log in / Sign up'}
        onClick={() => setOpen(true)}
      >
        {userSession?.avatar ? (
          <img src={userSession.avatar} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : displayName ? (
          <CheckCircle2 size={18} />
        ) : (
          <UserRound size={18} />
        )}
      </button>

      {mounted && open && createPortal(
        <div className="otp-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}>
          <section className="otp-dialog" role="dialog" aria-modal="true" aria-labelledby="otp-title">
            <button className="otp-close" onClick={() => setOpen(false)} aria-label="Close login">
              <X size={18} />
            </button>

            {displayName ? (
              <div className="otp-account">
                <span className="otp-icon" style={userSession?.avatar ? { padding: 0, overflow: 'hidden' } : undefined}>
                  {userSession?.avatar ? (
                    <img src={userSession.avatar} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <CheckCircle2 size={28} />
                  )}
                </span>
                <small>Verified Account</small>
                <h2 id="otp-title">{displayName}</h2>
                {displayEmailOrPhone && (
                  <p style={{ margin: '4px auto 14px', fontSize: '11px', color: '#666' }}>{displayEmailOrPhone}</p>
                )}
                <p>You are logged in and ready for faster ordering.</p>
                <button className="otp-primary otp-logout" onClick={logout}><LogOut size={17} /> Log out</button>
              </div>
            ) : step === 'input' ? (
              <div>
                <span className="otp-icon"><Mail size={26} /></span>
                <small>Welcome to Azmar</small>
                <h2 id="otp-title">Sign in or Register</h2>
                <p>Enter your email or sign in with your social account.</p>

                <form onSubmit={sendOtp}>
                  <label htmlFor="otp-email">Email Address</label>
                  <div className="otp-email-field">
                    <input
                      id="otp-email"
                      type="email"
                      autoComplete="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {error && <p className="otp-error" role="alert">{error}</p>}

                  <button
                    className="otp-primary"
                    disabled={loading || (authMode === 'mobile' ? mobile.length !== 10 : !email.includes('@'))}
                  >
                    {loading ? 'Sending code…' : 'Send Verification Code'}
                  </button>
                </form>

                {/* Social Login Divider */}
                <div className="otp-divider">Or continue with</div>

                {/* Social Login Buttons: Google, Facebook, Apple */}
                <div className="otp-social-grid">
                  <button
                    type="button"
                    className="otp-social-btn"
                    onClick={() => handleOAuth('google')}
                    title="Sign in with Google"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    Google
                  </button>

                  <button
                    type="button"
                    className="otp-social-btn"
                    onClick={() => handleOAuth('facebook')}
                    title="Sign in with Facebook"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </button>

                  <button
                    type="button"
                    className="otp-social-btn"
                    onClick={() => handleOAuth('apple')}
                    title="Sign in with Apple"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#000">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.33c.62-.75 1.04-1.8 1.04-2.85 0-.14-.01-.28-.04-.41-.99.04-2.18.66-2.89 1.49-.62.72-1.07 1.77-1.07 2.82 0 .15.02.3.04.42 1.11.08 2.29-.55 2.92-1.47z"/>
                    </svg>
                    Apple
                  </button>
                </div>

                <div className="otp-secure" style={{ marginTop: '14px' }}>
                  <ShieldCheck size={14} /> Secured by Supabase Auth
                </div>
              </div>
            ) : (
              <form onSubmit={verifyOtp}>
                <button type="button" className="otp-back" onClick={() => { setStep('input'); setError(''); }}>
                  <ArrowLeft size={15} /> Change {authMode === 'mobile' ? 'number' : 'email'}
                </button>
                <span className="otp-icon"><ShieldCheck size={26} /></span>
                <small>Verification Code</small>
                <h2 id="otp-title">Check your {authMode === 'mobile' ? 'messages' : 'inbox'}</h2>
                <p>Enter the code sent to {authMode === 'mobile' ? maskedPhone(mobile) : email}.</p>

                <label htmlFor="otp-code">One-time password</label>
                <input
                  className="otp-code-field"
                  id="otp-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="••••••"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  autoFocus
                />

                {error && <p className="otp-error" role="alert">{error}</p>}

                <button className="otp-primary" disabled={loading || otp.length < 4}>
                  {loading ? 'Verifying…' : 'Verify & Continue'}
                </button>

                <button type="button" className="otp-resend" disabled={loading || cooldown > 0} onClick={() => sendOtp()}>
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
                </button>
              </form>
            )}
          </section>
        </div>,
        document.body,
      )}
    </>
  );
}
