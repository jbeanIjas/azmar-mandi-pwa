"use client";

import { ArrowLeft, CheckCircle2, LogOut, Phone, ShieldCheck, UserRound, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

const subscribeToHydration = () => () => {};

function maskedPhone(phone: string) {
  const digits = phone.replace(/\D/g, '').slice(-10);
  return `+91 ${digits.slice(0, 2)}••• ••${digits.slice(-3)}`;
}

export default function OtpLogin({ phone }: { phone?: string }) {
  const router = useRouter();
  const mounted = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

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
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: mobile }),
      });
      const result = await response.json().catch(() => ({ error: 'Unable to send OTP.' }));

      if (!response.ok) {
        setError(result.error || 'Unable to send OTP.');
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
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: mobile, otp }),
      });
      const result = await response.json().catch(() => ({ error: 'Unable to verify OTP.' }));

      if (!response.ok) {
        setError(result.error || 'Unable to verify OTP.');
        return;
      }

      setOpen(false);
      setStep('phone');
      setOtp('');
      router.refresh();
    } catch {
      setError('Unable to connect. Check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await fetch('/api/otp/logout', { method: 'POST' });
    setOpen(false);
    router.refresh();
  };

  return (
    <>
      <button
        className="profile-avatar"
        aria-label={phone ? `Account ${maskedPhone(phone)}` : 'Log in with mobile number'}
        onClick={() => setOpen(true)}
      >
        {phone ? <CheckCircle2 size={18} /> : <UserRound size={18} />}
      </button>

      {mounted && open && createPortal(
        <div className="otp-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}>
          <section className="otp-dialog" role="dialog" aria-modal="true" aria-labelledby="otp-title">
            <button className="otp-close" onClick={() => setOpen(false)} aria-label="Close login">
              <X size={18} />
            </button>

            {phone ? (
              <div className="otp-account">
                <span className="otp-icon"><CheckCircle2 size={28} /></span>
                <small>Verified account</small>
                <h2 id="otp-title">{maskedPhone(phone)}</h2>
                <p>Your mobile number is verified and ready for faster ordering.</p>
                <button className="otp-primary otp-logout" onClick={logout}><LogOut size={17} /> Log out</button>
              </div>
            ) : step === 'phone' ? (
              <form onSubmit={sendOtp}>
                <span className="otp-icon"><Phone size={26} /></span>
                <small>Secure mobile login</small>
                <h2 id="otp-title">Welcome to Azmar</h2>
                <p>Enter your mobile number and we’ll send a one-time verification code.</p>
                <label htmlFor="otp-phone">Mobile number</label>
                <div className="otp-phone-field">
                  <span>+91</span>
                  <input
                    id="otp-phone"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    maxLength={10}
                    placeholder="98765 43210"
                    value={mobile}
                    onChange={(event) => setMobile(event.target.value.replace(/\D/g, '').slice(0, 10))}
                  />
                </div>
                {error && <p className="otp-error" role="alert">{error}</p>}
                <button className="otp-primary" disabled={loading || mobile.length !== 10}>
                  {loading ? 'Sending…' : 'Send OTP'}
                </button>
                <div className="otp-secure"><ShieldCheck size={14} /> Your number stays private and secure.</div>
              </form>
            ) : (
              <form onSubmit={verifyOtp}>
                <button type="button" className="otp-back" onClick={() => { setStep('phone'); setError(''); }}>
                  <ArrowLeft size={15} /> Change number
                </button>
                <span className="otp-icon"><ShieldCheck size={26} /></span>
                <small>Verification code</small>
                <h2 id="otp-title">Check your messages</h2>
                <p>Enter the code sent to {maskedPhone(mobile)}.</p>
                <label htmlFor="otp-code">One-time password</label>
                <input
                  className="otp-code-field"
                  id="otp-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="••••••"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  autoFocus
                />
                {error && <p className="otp-error" role="alert">{error}</p>}
                <button className="otp-primary" disabled={loading || otp.length < 4}>
                  {loading ? 'Verifying…' : 'Verify & continue'}
                </button>
                <button type="button" className="otp-resend" disabled={loading || cooldown > 0} onClick={() => sendOtp()}>
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
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
