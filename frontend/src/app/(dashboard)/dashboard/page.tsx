'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient, Bot } from '@/lib/api';

export default function DashboardPage() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    apiKey: '',
    provider: 'openai',
    welcomeMessage: 'Hi! How can I help you?',
    themeColor: '#6366f1',
  });

  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (token) {
      loadBots();
    }
  }, [token]);

  const loadBots = async () => {
    try {
      const { bots } = await apiClient.bots.list(token!);
      setBots(bots);
    } catch (err) {
      console.error('Failed to load bots:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCreating(true);

    try {
      const { bot } = await apiClient.bots.create(token!, form);
      router.push(`/bots/${bot.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create bot');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (botId: string) => {
    if (!confirm('Delete this bot? This cannot be undone.')) return;

    try {
      await apiClient.bots.delete(token!, botId);
      setBots(bots.filter(b => b.id !== botId));
    } catch (err) {
      console.error('Failed to delete bot:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>My Bots</h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Create and manage your chatbots</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'var(--accent)' }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Bot
        </button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse rounded-2xl h-48" style={{ background: 'var(--bg-card)' }} />
          ))}
        </div>
      ) : bots.length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
            <svg className="w-8 h-8" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No bots yet</h3>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Create your first chatbot to get started</p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'var(--accent)' }}
          >
            Create Your First Bot
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bots.map((bot, i) => (
            <Link
              key={bot.id}
              href={`/bots/${bot.id}`}
              className="group rounded-2xl p-6 transition-all hover:scale-[1.02] animate-fade-in"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                animationDelay: `${i * 50}ms`,
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: bot.themeColor || 'var(--accent)' }}>
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <button
                  onClick={(e) => { e.preventDefault(); handleDelete(bot.id); }}
                  className="opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all"
                  style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{bot.name}</h3>
              <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {bot._count?.contexts || 0} contexts
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  {bot._count?.documents || 0} docs
                </span>
              </div>
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                  {bot.provider}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.8)' }}>
          <div className="w-full max-w-lg rounded-2xl p-6 animate-fade-in" style={{ background: 'var(--bg-secondary)' }}>
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Create New Bot</h2>

            {error && (
              <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Bot Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  placeholder="Customer Support"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>AI Provider</label>
                <select
                  value={form.provider}
                  onChange={e => setForm({ ...form, provider: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                >
                  <option value="openai">OpenAI (GPT-3.5)</option>
                  <option value="gemini">Google Gemini</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>API Key</label>
                <input
                  type="password"
                  value={form.apiKey}
                  onChange={e => setForm({ ...form, apiKey: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl outline-none"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  placeholder="sk-..."
                />
                <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>Your API key is encrypted and never exposed</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Theme Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.themeColor}
                    onChange={e => setForm({ ...form, themeColor: e.target.value })}
                    className="w-12 h-12 rounded-xl cursor-pointer"
                    style={{ border: 'none' }}
                  />
                  <input
                    type="text"
                    value={form.themeColor}
                    onChange={e => setForm({ ...form, themeColor: e.target.value })}
                    className="flex-1 px-4 py-3 rounded-xl outline-none"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-3 rounded-xl font-medium transition-colors"
                  style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'var(--accent)' }}
                >
                  {creating ? 'Creating...' : 'Create Bot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
