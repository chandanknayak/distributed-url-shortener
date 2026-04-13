import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ExternalLink, MousePointerClick, Calendar, Trash2, QrCode } from 'lucide-react';

const Dashboard = () => {
  const { api } = useAuth();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/my');
      setLinks(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch your links');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (shortId) => {
    if (!window.confirm("Are you sure you want to delete this shortened link?")) return;
    try {
      await api.delete(`/my/${shortId}`);
      setLinks((prev) => prev.filter(link => link.shortId !== shortId));
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete url.");
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '4rem' }}><h2>Loading Dashboard...</h2></div>;
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h2 style={{ color: 'var(--danger)' }}>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>My Dashboard</h2>
        <p style={{ color: 'var(--text-secondary)' }}>You have {links.length} shortened links.</p>
      </div>

      {links.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem' }}>
          <h3>No links yet!</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Head to the homepage and create your first short URL.</p>
        </div>
      ) : (
        <div className="list-grid">
          {links.map((link) => (
            <div key={link.shortId} className="glass-panel link-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <a href={link.fullUrl} target="_blank" rel="noopener noreferrer" className="link-title" style={{ textDecoration: 'none' }}>
                  /{link.shortId} <ExternalLink size={16} />
                </a>
                <button 
                  onClick={() => handleDelete(link.shortId)} 
                  style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}
                  title="Delete URL"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              <div className="link-original" title={link.longUrl}>
                {link.longUrl}
              </div>

              {link.customAlias && (
                <div>
                  <span className="badge" style={{ color: 'var(--accent-color)', background: 'var(--accent-glow)' }}>Alias: {link.customAlias}</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', alignItems: 'center' }}>
                 <img src={link.qrCode} alt="QR Code" width="80" height="80" style={{ borderRadius: '4px' }} />
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    <a href={link.qrCode} download={`qrcode-${link.shortId}.png`} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <QrCode size={14} /> Download QR
                    </a>
                 </div>
              </div>

              <div className="link-stats">
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)' }}>
                  <MousePointerClick size={14} /> {link.clickCount} clicks
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={14} /> {new Date(link.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
