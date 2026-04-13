import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link2, LayoutDashboard, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const Home = () => {
  const { api, user } = useAuth();
  const [longUrl, setLongUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!longUrl) {
      setError('Please enter a valid URL');
      return;
    }

    try {
      setLoading(true);
      setError('');
      // Payload format based on backend controller req.body 
      // { longUrl, customAlias, expiresAt }
      const payload = { longUrl };
      if (customAlias.trim()) payload.customAlias = customAlias.trim();
      if (expiresAt) payload.expiresAt = new Date(expiresAt).toISOString();

      const res = await api.post('/shorten', payload);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to shorten URL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', background: 'linear-gradient(to right, #ffffff, #a0a0ab)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
          Shorten. Share. Track.
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          The ultimate URL shortener with custom aliases, auto-expiration, and instant QR generation.
        </p>
      </div>

      <div className="glass-panel" style={{ width: '100%' }}>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Destination URL</label>
            <input 
              type="url" 
              placeholder="https://your-very-long-url.com/path" 
              className="input-field"
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label>Custom Alias (Optional)</label>
              <input 
                type="text" 
                placeholder="my-portfolio" 
                className="input-field"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
              />
            </div>

            <div className="input-group" style={{ flex: 1 }}>
              <label>Expiration Date (Optional)</label>
              <input 
                type="datetime-local" 
                className="input-field"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? 'Shortening...' : (
              <>
                <Link2 size={20} /> Shorten URL
              </>
            )}
          </button>
        </form>

        {result && (
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', border: '1px solid var(--accent-color)' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--accent-color)' }}>Success! Your shrunk URL is ready:</h3>
            <a href={result.shortUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'white', fontSize: '1.25rem', fontWeight: 'bold', display: 'block', textDecoration: 'none', marginBottom: '1.5rem', wordBreak: 'break-all' }}>
              {result.shortUrl}
            </a>
            
            <div className="qr-container">
              <QRCodeSVG value={result.shortUrl} size={150} level="M" includeMargin={true} />
              <p style={{ marginTop: '1rem', color: '#666', fontWeight: 500 }}><QrCode size={16} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Scan to visit</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
