import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import './AdminDashboard.css';

interface User {
  id: string;
  email: string;
  isAdmin: boolean;
  isApproved: boolean;
  isActive: boolean;
  maxInboxes: number;
  maxEmails: number;
  retentionHours: number | null;
  createdAt: string;
  _count: { inboxes: number };
}

interface SystemSettings {
  id: string;
  loginRequired: boolean;
  registrationOpen: boolean;
  defaultRetentionHours: number;
  maxInboxesPerUser: number;
  maxEmailsPerInbox: number;
  deleteOldOnLimit: boolean;
}

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalInboxes: number;
  totalEmails: number;
  recentLogins: number;
  emailsByDay: Array<{ date: string; count: number }>;
}

function AdminDashboard() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'inboxes' | 'settings' | 'stats'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'users':
          const usersRes = await api.get('/admin/users');
          setUsers(usersRes.data);
          break;
        case 'settings':
          const settingsRes = await api.get('/admin/settings');
          setSettings(settingsRes.data);
          break;
        case 'stats':
          const statsRes = await api.get('/admin/stats');
          setStats(statsRes.data);
          break;
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    try {
      await api.patch(`/admin/users/${userId}`, updates);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update user');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await api.delete(`/admin/users/${userId}`);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete user');
    }
  };

  const updateSettings = async (updates: Partial<SystemSettings>) => {
    try {
      await api.patch('/admin/settings', updates);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update settings');
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>🛠️ Admin Dashboard</h1>
        <div className="header-right">
          <a href="/dashboard" className="btn-back">Back to Mail</a>
          <button onClick={logout} className="btn-logout">Logout</button>
        </div>
      </header>

      <div className="admin-content">
        <nav className="admin-nav">
          <button
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            👥 Users
          </button>
          <button
            className={activeTab === 'settings' ? 'active' : ''}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Settings
          </button>
          <button
            className={activeTab === 'stats' ? 'active' : ''}
            onClick={() => setActiveTab('stats')}
          >
            📊 Statistics
          </button>
        </nav>

        <main className="admin-main">
          {error && <div className="error-box">{error}</div>}
          {loading && <div className="loading">Loading...</div>}

          {activeTab === 'users' && (
            <div className="users-section">
              <h2>User Management</h2>
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Inboxes</th>
                      <th>Limits</th>
                      <th>Retention</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>
                          {user.email}
                          {user.isAdmin && <span className="badge admin">Admin</span>}
                        </td>
                        <td>
                          <span className={`status ${user.isApproved ? 'approved' : 'pending'}`}>
                            {user.isApproved ? 'Approved' : 'Pending'}
                          </span>
                          {user.isActive ? (
                            <span className="status active">Active</span>
                          ) : (
                            <span className="status inactive">Inactive</span>
                          )}
                        </td>
                        <td>{user._count.inboxes}</td>
                        <td>
                          <div className="limits">
                            <div>Inboxes: {user.maxInboxes}</div>
                            <div>Emails: {user.maxEmails}</div>
                          </div>
                        </td>
                        <td>{user.retentionHours || 'Default'}h</td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="action-buttons">
                            {!user.isApproved && (
                              <button
                                onClick={() => updateUser(user.id, { isApproved: true })}
                                className="btn-approve"
                              >
                                Approve
                              </button>
                            )}
                            <button
                              onClick={() => updateUser(user.id, { isActive: !user.isActive })}
                              className={user.isActive ? 'btn-deactivate' : 'btn-activate'}
                            >
                              {user.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => {
                                const maxInboxes = prompt('Max inboxes:', user.maxInboxes.toString());
                                if (maxInboxes) {
                                  updateUser(user.id, { maxInboxes: parseInt(maxInboxes) });
                                }
                              }}
                              className="btn-edit"
                            >
                              Edit Limits
                            </button>
                            {!user.isAdmin && (
                              <button
                                onClick={() => deleteUser(user.id)}
                                className="btn-delete-sm"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && settings && (
            <div className="settings-section">
              <h2>System Settings</h2>
              
              <div className="settings-grid">
                <div className="setting-card">
                  <h3>Access Control</h3>
                  <div className="setting-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={settings.loginRequired}
                        onChange={(e) => updateSettings({ loginRequired: e.target.checked })}
                      />
                      Login Required
                    </label>
                  </div>
                  <div className="setting-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={settings.registrationOpen}
                        onChange={(e) => updateSettings({ registrationOpen: e.target.checked })}
                      />
                      Registration Open
                    </label>
                  </div>
                </div>

                <div className="setting-card">
                  <h3>Email Retention</h3>
                  <div className="setting-item">
                    <label>
                      Default Retention (hours)
                      <input
                        type="number"
                        value={settings.defaultRetentionHours}
                        onChange={(e) => updateSettings({ defaultRetentionHours: parseInt(e.target.value) })}
                        min="1"
                      />
                    </label>
                  </div>
                  <div className="setting-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={settings.deleteOldOnLimit}
                        onChange={(e) => updateSettings({ deleteOldOnLimit: e.target.checked })}
                      />
                      Delete Old Emails When Limit Reached
                    </label>
                  </div>
                </div>

                <div className="setting-card">
                  <h3>Default User Limits</h3>
                  <div className="setting-item">
                    <label>
                      Max Inboxes Per User
                      <input
                        type="number"
                        value={settings.maxInboxesPerUser}
                        onChange={(e) => updateSettings({ maxInboxesPerUser: parseInt(e.target.value) })}
                        min="1"
                      />
                    </label>
                  </div>
                  <div className="setting-item">
                    <label>
                      Max Emails Per Inbox
                      <input
                        type="number"
                        value={settings.maxEmailsPerInbox}
                        onChange={(e) => updateSettings({ maxEmailsPerInbox: parseInt(e.target.value) })}
                        min="1"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stats' && stats && (
            <div className="stats-section">
              <h2>Statistics</h2>
              
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{stats.totalUsers}</div>
                  <div className="stat-label">Total Users</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.activeUsers}</div>
                  <div className="stat-label">Active Users</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.totalInboxes}</div>
                  <div className="stat-label">Total Inboxes</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.totalEmails}</div>
                  <div className="stat-label">Total Emails</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.recentLogins}</div>
                  <div className="stat-label">Logins (24h)</div>
                </div>
              </div>

              <div className="chart-section">
                <h3>Emails Received (Last 7 Days)</h3>
                <div className="chart-container">
                  {stats.emailsByDay.map((item: any) => (
                    <div key={item.date} className="chart-bar">
                      <div className="bar-value">{item.count}</div>
                      <div
                        className="bar"
                        style={{
                          height: `${Math.min((parseInt(item.count) / 10) * 100, 300)}px`
                        }}
                      ></div>
                      <div className="bar-label">{new Date(item.date).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
