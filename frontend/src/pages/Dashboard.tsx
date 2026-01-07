import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import './Dashboard.css';

interface Inbox {
  id: string;
  address: string;
  createdAt: string;
  _count: { emails: number };
}

interface Email {
  id: string;
  from: string;
  subject: string;
  receivedAt: string;
}

interface EmailDetail extends Email {
  to: string;
  textBody: string;
  htmlBody: string;
  attachments: any[];
}

function Dashboard() {
  const { user, logout } = useAuth();
  const [inboxes, setInboxes] = useState<Inbox[]>([]);
  const [selectedInbox, setSelectedInbox] = useState<Inbox | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [customAddress, setCustomAddress] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadInboxes();
    const interval = setInterval(() => {
      if (selectedInbox) {
        loadInbox(selectedInbox.id);
      }
    }, 10000); // Auto-refresh every 10 seconds
    return () => clearInterval(interval);
  }, [selectedInbox]);

  const loadInboxes = async () => {
    try {
      const response = await api.get('/inbox');
      setInboxes(response.data);
    } catch (error) {
      console.error('Failed to load inboxes', error);
    }
  };

  const createInbox = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = customAddress ? { customAddress } : {};
      await api.post('/inbox', data);
      setCustomAddress('');
      await loadInboxes();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create inbox');
    } finally {
      setLoading(false);
    }
  };

  const deleteInbox = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inbox and all its emails?')) {
      return;
    }

    try {
      await api.delete(`/inbox/${id}`);
      if (selectedInbox?.id === id) {
        setSelectedInbox(null);
        setEmails([]);
      }
      await loadInboxes();
    } catch (error) {
      console.error('Failed to delete inbox', error);
    }
  };

  const loadInbox = async (id: string) => {
    try {
      const response = await api.get(`/inbox/${id}`);
      setSelectedInbox(response.data);
      setEmails(response.data.emails || []);
    } catch (error) {
      console.error('Failed to load inbox', error);
    }
  };

  const loadEmail = async (id: string) => {
    try {
      const response = await api.get(`/email/${id}`);
      setSelectedEmail(response.data);
    } catch (error) {
      console.error('Failed to load email', error);
    }
  };

  const deleteEmail = async (id: string) => {
    if (!confirm('Are you sure you want to delete this email?')) {
      return;
    }

    try {
      await api.delete(`/email/${id}`);
      setEmails(emails.filter(e => e.id !== id));
      if (selectedEmail?.id === id) {
        setSelectedEmail(null);
      }
      if (selectedInbox) {
        await loadInbox(selectedInbox.id);
      }
    } catch (error) {
      console.error('Failed to delete email', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Address copied to clipboard!');
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>📧 Temp Mail</h1>
        <div className="header-right">
          <span>{user?.email}</span>
          {user?.isAdmin && (
            <a href="/admin" className="btn-admin">Admin Panel</a>
          )}
          <button onClick={logout} className="btn-logout">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        <aside className="sidebar">
          <div className="create-inbox">
            <h2>Create Inbox</h2>
            {error && <div className="error-box">{error}</div>}
            <form onSubmit={createInbox}>
              <input
                type="text"
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                placeholder="Custom address (optional)"
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Random'}
              </button>
            </form>
          </div>

          <div className="inbox-list">
            <h3>Your Inboxes ({inboxes.length})</h3>
            {inboxes.map((inbox) => (
              <div
                key={inbox.id}
                className={`inbox-item ${selectedInbox?.id === inbox.id ? 'active' : ''}`}
              >
                <div onClick={() => loadInbox(inbox.id)}>
                  <div className="inbox-address">{inbox.address}</div>
                  <div className="inbox-count">{inbox._count.emails} emails</div>
                </div>
                <div className="inbox-actions">
                  <button onClick={() => copyToClipboard(inbox.address)} title="Copy">
                    📋
                  </button>
                  <button onClick={() => deleteInbox(inbox.id)} title="Delete">
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="main-content">
          {!selectedInbox ? (
            <div className="empty-state">
              <h2>Welcome to Temp Mail</h2>
              <p>Create an inbox to start receiving emails</p>
            </div>
          ) : (
            <div className="email-view">
              <div className="email-list">
                <h2>{selectedInbox.address}</h2>
                {emails.length === 0 ? (
                  <p className="no-emails">No emails yet. Send an email to this address!</p>
                ) : (
                  <div className="email-items">
                    {emails.map((email) => (
                      <div
                        key={email.id}
                        className={`email-item ${selectedEmail?.id === email.id ? 'active' : ''}`}
                        onClick={() => loadEmail(email.id)}
                      >
                        <div className="email-from">{email.from}</div>
                        <div className="email-subject">{email.subject || '(no subject)'}</div>
                        <div className="email-date">
                          {new Date(email.receivedAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedEmail && (
                <div className="email-detail">
                  <div className="email-detail-header">
                    <h3>{selectedEmail.subject || '(no subject)'}</h3>
                    <button onClick={() => deleteEmail(selectedEmail.id)} className="btn-delete">
                      Delete
                    </button>
                  </div>
                  <div className="email-meta">
                    <div><strong>From:</strong> {selectedEmail.from}</div>
                    <div><strong>To:</strong> {selectedEmail.to}</div>
                    <div><strong>Date:</strong> {new Date(selectedEmail.receivedAt).toLocaleString()}</div>
                  </div>
                  <div className="email-body">
                    {selectedEmail.htmlBody ? (
                      <iframe
                        srcDoc={selectedEmail.htmlBody}
                        title="Email content"
                        sandbox="allow-same-origin"
                      />
                    ) : (
                      <pre>{selectedEmail.textBody}</pre>
                    )}
                  </div>
                  {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                    <div className="email-attachments">
                      <h4>Attachments ({selectedEmail.attachments.length})</h4>
                      <ul>
                        {selectedEmail.attachments.map((att: any, idx: number) => (
                          <li key={idx}>
                            📎 {att.filename} ({Math.round(att.size / 1024)}KB)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
