"use client";

import { FormEvent, useState } from 'react';
import { LockKeyhole, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    const response = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
    setLoading(false);
    if (!response.ok) {
      const data = await response.json().catch(() => ({ error: 'Unable to sign in.' }));
      setError(data.error ?? 'Unable to sign in.');
      return;
    }
    router.replace('/admin');
    router.refresh();
  };

  return (
    <main className="admin-login-shell">
      <form className="admin-login-card" onSubmit={submit}>
        <span className="admin-login-icon"><LockKeyhole size={25} /></span>
        <p className="admin-kicker">Azmar Mandi</p>
        <h1>Catalog dashboard</h1>
        <p>Enter the admin password to manage collections and products.</p>
        <label>Admin password<input autoFocus required type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" placeholder="Enter password" /></label>
        {error && <p className="admin-error" role="alert">{error}</p>}
        <button type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'} <LogIn size={17} /></button>
      </form>
    </main>
  );
}
