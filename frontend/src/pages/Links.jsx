import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Links({ session, onLogout }) {
  const [url, setUrl] = useState('');
  const [links, setLinks] = useState([]);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  function handleError(err) {
    if (err.message === 'Please log in') return onLogout();
    setError(err.message);
  }

  useEffect(() => {
    api('/links', { token: session.token }).then(setLinks).catch(handleError);
  }, [session.token]);

  async function shorten(e) {
    e.preventDefault();
    setError('');
    try {
      new URL(url.trim());
    } catch {
      return setError('Enter a full URL, e.g. https://example.com');
    }
    try {
      const link = await api('/links', {
        method: 'POST',
        body: { url: url.trim() },
        token: session.token,
      });
      setLinks([link, ...links]);
      setUrl('');
    } catch (err) {
      handleError(err);
    }
  }

  async function copy(shortUrl) {
    await navigator.clipboard.writeText(shortUrl);
    setCopied(shortUrl);
    setTimeout(() => setCopied(''), 1500);
  }

  return (
    <>
      <section className="card">
        <h2>Make it short</h2>
        <p className="muted">Signed in as {session.user.phone}</p>
        <form onSubmit={shorten} className="row">
          <input
            placeholder="https://a-very-long-url.com/with/lots/of/parts"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button>Snip it</button>
        </form>
        {error && <p className="error">{error}</p>}
      </section>

      <section className="list">
        {links.length === 0 && <p className="muted center">No links yet. Snip your first one!</p>}
        {links.map((l) => (
          <article key={l.id} className="ticket">
            <div className="ticket-main">
              <a href={l.short_url} target="_blank" rel="noreferrer" className="code">
                {l.short_url.replace(/^https?:\/\//, '')}
              </a>
              <span className="orig" title={l.url}>{l.url}</span>
            </div>
            <div className="ticket-side">
              <span className="clicks">{l.clicks} clicks</span>
              <button className="small" onClick={() => copy(l.short_url)}>
                {copied === l.short_url ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
