import { useState } from 'react';
import { api } from '../api.js';

export default function Login({ onLogin }) {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('phone');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (step === 'phone' && !/^\+[1-9]\d{7,14}$/.test(phone.trim())) {
      return setError('Use international format, e.g. +919876543210');
    }
    if (step === 'code' && !/^\d{4,8}$/.test(code.trim())) {
      return setError('Enter the digits from your OTP');
    }
    setLoading(true);
    try {
      if (step === 'phone') {
        await api('/auth/send-otp', { method: 'POST', body: { phone: phone.trim() } });
        setStep('code');
      } else {
        const data = await api('/auth/verify-otp', {
          method: 'POST',
          body: { phone: phone.trim(), code: code.trim() },
        });
        onLogin(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card">
      <h2>{step === 'phone' ? 'Sign in or sign up' : 'Enter your code'}</h2>
      <p className="muted">
        {step === 'phone'
          ? 'We will send a one-time code to your phone.'
          : `Code sent to ${phone}.`}
      </p>
      <form onSubmit={submit} className="stack">
        {step === 'phone' ? (
          <input
            type="tel"
            placeholder="+919876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoFocus
          />
        ) : (
          <input
            inputMode="numeric"
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoFocus
          />
        )}
        {error && <p className="error">{error}</p>}
        <button disabled={loading}>
          {loading ? 'Please wait...' : step === 'phone' ? 'Send OTP' : 'Verify'}
        </button>
        {step === 'code' && (
          <button type="button" className="ghost" onClick={() => setStep('phone')}>
            Change number
          </button>
        )}
      </form>
    </section>
  );
}
