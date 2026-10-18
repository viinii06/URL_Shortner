const BASE = process.env.MINIMOTH_BASE_URL || 'https://api.minimoth.dev';

async function call(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      'X-Api-Key': process.env.MINIMOTH_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'OTP service error');
    err.status = res.status >= 500 ? 502 : 400;
    throw err;
  }
  return data;
}

export const sendOtp = (phone) => call('/v1/otp/send', { phone });
export const verifyOtp = (phone, code) => call('/v1/otp/verify', { phone, code });
