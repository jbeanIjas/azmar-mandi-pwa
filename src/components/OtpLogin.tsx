"use client";

import { ArrowLeft, CheckCircle2, LogOut, ShieldCheck, UserRound, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

const subscribeToHydration = () => () => {};

function maskedPhone(phone: string) {
  const digits = phone.replace(/\D/g, '').slice(-10);
  if (digits.length !== 10) return phone;
  return `+91 ${digits.slice(0, 2)}••• ••${digits.slice(-3)}`;
}

function WhatsAppIcon({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.031 2C6.516 2 2.023 6.492 2.023 12.008c0 1.945.556 3.766 1.524 5.309L2 22.25l5.086-1.508a10.02 10.02 0 0 0 4.945 1.289h.004c5.512 0 10.004-4.492 10.004-10.008.004-5.52-4.484-10.023-10.008-10.023zm5.836 14.223c-.246.691-1.223 1.293-1.996 1.457-.527.113-1.215.203-3.535-.758-2.969-1.23-4.887-4.246-5.035-4.445-.145-.199-1.203-1.602-1.203-3.055 0-1.453.758-2.168 1.027-2.465.27-.297.59-.371.789-.371.199 0 .398.004.57.012.18.012.422-.07.66.504.246.59.836 2.039.91 2.188.074.148.125.324.027.523-.098.2-.148.324-.297.496-.148.176-.312.395-.445.531-.148.148-.305.313-.133.609.172.297.77 1.266 1.648 2.047 1.133 1.008 2.086 1.32 2.383 1.469.297.148.473.125.648-.074.176-.2.75-.875.953-1.176.203-.297.406-.246.68-.148.273.098 1.73.816 2.027.965.297.148.496.223.57.348.074.125.074.723-.172 1.414z" />
    </svg>
  );
}

export default function OtpLogin({
  phone: initialPhone,
  pageMode = false,
  showTrigger = true,
}: {
  phone?: string;
  pageMode?: boolean;
  showTrigger?: boolean;
}) {
  const router = useRouter();
  const mounted = useSyncExternalStore(subscribeToHydration, () => true, () => false);

  const [open, setOpen] = useState(pageMode);
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [activePhone, setActivePhone] = useState<string | null>(initialPhone || null);

  useEffect(() => {
    const openLogin = () => setOpen(true);
    window.addEventListener('azmar:open-login', openLogin);
    return () => window.removeEventListener('azmar:open-login', openLogin);
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const sendOtp = async (event?: FormEvent) => {
    event?.preventDefault();
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    if (cleanMobile.length !== 10) {
      setError('Please enter a valid 10-digit WhatsApp number.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanMobile }),
      });
      const result = await response.json().catch(() => ({ error: 'Unable to send OTP.' }));

      if (!response.ok) {
        setError(result.error || 'Unable to send WhatsApp OTP.');
        return;
      }

      setStep('otp');
      setCooldown(30);
    } catch {
      setError('Unable to connect. Check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event: FormEvent) => {
    event.preventDefault();
    const cleanOtp = otp.replace(/\D/g, '');
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);

    if (cleanOtp.length < 4) {
      setError('Please enter the full OTP received on WhatsApp.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanMobile, otp: cleanOtp }),
      });
      const result = await response.json().catch(() => ({ error: 'Invalid OTP.' }));

      if (!response.ok) {
        setError(result.error || 'Invalid or expired WhatsApp OTP.');
        return;
      }

      const verifiedPhone = (result.phone || cleanMobile).replace(/\D/g, '').slice(-10);
      setActivePhone(verifiedPhone);
      if (typeof window !== 'undefined') {
        localStorage.setItem('azmar_phone_number', verifiedPhone);
        window.dispatchEvent(new CustomEvent('azmar:phone-session', { detail: { phone: verifiedPhone } }));
      }
      setOpen(false);
      setStep('input');
      setOtp('');
      router.refresh();
      if (pageMode) {
        const nextPath = new URLSearchParams(window.location.search).get('next');
        router.push(nextPath?.startsWith('/') && !nextPath.startsWith('//') ? nextPath : '/account/orders');
      }
    } catch {
      setError('Unable to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/otp/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    setActivePhone(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('azmar_phone_number');
      window.dispatchEvent(new CustomEvent('azmar:phone-session', { detail: { phone: null } }));
    }
    setOpen(false);
    setStep('input');
    setMobile('');
    setOtp('');
    router.refresh();
    if (pageMode) {
      router.push('/');
    }
  };

  const dialog = (
    <section className="otp-dialog" aria-labelledby="otp-title">
      <button
        type="button"
        className="otp-close"
        onClick={() => (pageMode ? router.back() : setOpen(false))}
        aria-label="Close login"
      >
        <X size={18} />
      </button>

      {activePhone ? (
        <div className="otp-account">
          <span className="otp-icon">
            <CheckCircle2 size={32} />
          </span>
          <span className="otp-badge-tag">Verified Account</span>
          <h2 id="otp-title">{maskedPhone(activePhone)}</h2>
          <p>You are logged in with WhatsApp for faster checkout and instant live order notifications.</p>
          <button
            className="otp-primary otp-primary--burgundy"
            onClick={() => {
              setOpen(false);
              router.push('/account/orders');
            }}
          >
            View My Orders
          </button>
          <button className="otp-secondary otp-logout" onClick={logout}>
            <LogOut size={16} /> Log Out
          </button>
        </div>
      ) : step === 'input' ? (
        <div>
          <div className="otp-header-icon-wrap">
            <span className="otp-icon">
              <WhatsAppIcon size={28} />
            </span>
          </div>
          <span className="otp-badge-tag">WhatsApp Sign In</span>
          <h2 id="otp-title">Login with WhatsApp</h2>
          <p>Enter your 10-digit mobile number. We will send a secure one-time verification code directly to your WhatsApp.</p>

          <form onSubmit={sendOtp}>
            <label htmlFor="otp-phone">WhatsApp Mobile Number</label>
            <div className="otp-phone-field">
              <span className="otp-phone-prefix">🇮🇳 +91</span>
              <input
                id="otp-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="98765 43210"
                maxLength={10}
                value={mobile}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setMobile(val);
                  setError('');
                }}
                autoFocus
              />
            </div>

            {error && <p className="otp-error" role="alert">{error}</p>}

            <button className="otp-primary otp-primary--whatsapp" disabled={loading || mobile.length !== 10}>
              {loading ? 'Sending WhatsApp code…' : 'Get WhatsApp OTP'}
            </button>
          </form>

          <div className="otp-secure">
            <ShieldCheck size={14} /> Instant & Secure WhatsApp Verification
          </div>
        </div>
      ) : (
        <form onSubmit={verifyOtp}>
          <button
            type="button"
            className="otp-back"
            onClick={() => {
              setStep('input');
              setError('');
            }}
          >
            <ArrowLeft size={15} /> Change WhatsApp Number
          </button>
          <div className="otp-header-icon-wrap">
            <span className="otp-icon">
              <ShieldCheck size={28} />
            </span>
          </div>
          <span className="otp-badge-tag">Verification Code</span>
          <h2 id="otp-title">Check your WhatsApp</h2>
          <p>We sent a 6-digit code to <strong>+91 {mobile}</strong> on WhatsApp.</p>

          <label htmlFor="otp-code">Enter 6-Digit OTP</label>
          <input
            className="otp-code-field"
            id="otp-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="••••••"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
              setError('');
            }}
            autoFocus
          />

          {error && <p className="otp-error" role="alert">{error}</p>}

          <button className="otp-primary otp-primary--whatsapp" disabled={loading || otp.length < 4}>
            {loading ? 'Verifying OTP…' : 'Verify & Sign In'}
          </button>

          <button
            type="button"
            className="otp-resend"
            disabled={loading || cooldown > 0}
            onClick={() => sendOtp()}
          >
            {cooldown > 0 ? `Resend via WhatsApp in ${cooldown}s` : 'Resend Code via WhatsApp'}
          </button>
        </form>
      )}
    </section>
  );

  if (pageMode) return <main className="auth-page">{dialog}</main>;

  return (
    <>
      {showTrigger && (
        <button
          type="button"
          className="profile-avatar"
          aria-label={activePhone ? `Account ${maskedPhone(activePhone)}` : 'Log in with WhatsApp'}
          onClick={() => setOpen(true)}
        >
          {activePhone ? <CheckCircle2 size={18} /> : <UserRound size={18} />}
        </button>
      )}

      {mounted && open && createPortal(
        <div
          className="otp-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          {dialog}
        </div>,
        document.body,
      )}
    </>
  );
}
