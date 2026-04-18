'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient, BotDetail, Context, Document, FAQ } from '@/lib/api';

type Tab = 'settings' | 'context' | 'documents' | 'chat' | 'embed';

export default function BotDetailPage() {
  const [bot, setBot] = useState<BotDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('settings');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [token, setToken] = useState<string | null>(null);

  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken && user) {
      setToken(storedToken);
      loadBot(storedToken);
    }
  }, [user]);

  const loadBot = async (authToken: string) => {
    try {
      const { bot } = await apiClient.bots.get(authToken, params.id as string);
      setBot(bot);
    } catch (err) {
      console.error('Failed to load bot:', err);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!bot) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard" className="p-2 rounded-lg transition-colors hover:opacity-80" style={{ background: 'var(--bg-card)' }}>
          <svg className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bot.themeColor }}>
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{bot.name}</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{bot.provider}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 p-1 rounded-xl mb-8 overflow-x-auto" style={{ background: 'var(--bg-card)' }}>
        {(['settings', 'context', 'documents', 'chat', 'embed'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-5 py-2 rounded-lg font-medium text-sm capitalize transition-all whitespace-nowrap"
            style={{
              background: activeTab === tab ? 'var(--accent)' : 'transparent',
              color: activeTab === tab ? 'white' : 'var(--text-secondary)',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'settings' && <SettingsTab bot={bot} token={token!} onUpdate={setBot} />}
      {activeTab === 'context' && <ContextTab bot={bot} token={token!} onUpdate={loadBot} />}
      {activeTab === 'documents' && <DocumentsTab bot={bot} token={token!} onUpdate={loadBot} />}
      {activeTab === 'chat' && <ChatTab bot={bot} />}
      {activeTab === 'embed' && <EmbedTab bot={bot} />}
    </div>
  );
}

function SettingsTab({ bot, token, onUpdate }: { bot: BotDetail; token: string; onUpdate: (bot: BotDetail) => void }) {
  const [form, setForm] = useState({
    name: bot.name,
    welcomeMessage: bot.welcomeMessage,
    themeColor: bot.themeColor,
    provider: bot.provider,
    apiKey: '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');

    try {
      const data: Record<string, string> = {
        name: form.name,
        welcomeMessage: form.welcomeMessage,
        themeColor: form.themeColor,
        provider: form.provider,
      };
      if (form.apiKey) data.apiKey = form.apiKey;

      const { bot: updated } = await apiClient.bots.update(token, bot.id, data);
      onUpdate({ ...bot, ...updated });
      setForm({ ...form, apiKey: '' });
      setSuccess('Settings saved');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSave} className="space-y-6">
        {success && (
          <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)' }}>
            {success}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Bot Name</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 rounded-xl outline-none"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Welcome Message</label>
          <textarea
            value={form.welcomeMessage}
            onChange={e => setForm({ ...form, welcomeMessage: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 rounded-xl outline-none resize-none"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
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
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>API Key (leave empty to keep current)</label>
          <input
            type="password"
            value={form.apiKey}
            onChange={e => setForm({ ...form, apiKey: e.target.value })}
            className="w-full px-4 py-3 rounded-xl outline-none"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            placeholder="sk-..."
          />
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

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: 'var(--accent)' }}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}

function ContextTab({ bot, token, onUpdate }: { bot: BotDetail; token: string; onUpdate: (token: string) => void }) {
  const [textContent, setTextContent] = useState('');
  const [addingFaq, setAddingFaq] = useState(false);
  const [faqs, setFaqs] = useState<FAQ[]>([{ question: '', answer: '' }]);
  const [saving, setSaving] = useState(false);

  const handleAddText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textContent.trim()) return;

    setSaving(true);
    try {
      await apiClient.context.addText(token, bot.id, textContent);
      setTextContent('');
      onUpdate(token);
    } catch (err) {
      console.error('Failed to add text:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    const validFaqs = faqs.filter(f => f.question.trim() && f.answer.trim());
    if (validFaqs.length === 0) return;

    setSaving(true);
    try {
      await apiClient.context.addFaq(token, bot.id, validFaqs);
      setFaqs([{ question: '', answer: '' }]);
      setAddingFaq(false);
      onUpdate(token);
    } catch (err) {
      console.error('Failed to add FAQ:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteContext = async (contextId: string) => {
    if (!confirm('Delete this context?')) return;
    try {
      await apiClient.context.delete(token, bot.id, contextId);
      onUpdate(token);
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="p-6 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Add Text Context</h3>
        <form onSubmit={handleAddText} className="space-y-4">
          <textarea
            value={textContent}
            onChange={e => setTextContent(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-xl outline-none resize-none"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            placeholder="Paste your knowledge base text here..."
          />
          <button
            type="submit"
            disabled={saving || !textContent.trim()}
            className="px-5 py-2 rounded-lg font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--accent)' }}
          >
            {saving ? 'Adding...' : 'Add Text'}
          </button>
        </form>
      </div>

      <div className="p-6 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>FAQ</h3>
          {!addingFaq && (
            <button
              onClick={() => setAddingFaq(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add FAQ
            </button>
          )}
        </div>

        {addingFaq && (
          <form onSubmit={handleAddFaq} className="space-y-4 mb-4">
            {faqs.map((faq, i) => (
              <div key={i} className="space-y-3 p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                <input
                  type="text"
                  value={faq.question}
                  onChange={e => { const newFaqs = [...faqs]; newFaqs[i].question = e.target.value; setFaqs(newFaqs); }}
                  placeholder="Question"
                  className="w-full px-4 py-2 rounded-lg outline-none"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
                <textarea
                  value={faq.answer}
                  onChange={e => { const newFaqs = [...faqs]; newFaqs[i].answer = e.target.value; setFaqs(newFaqs); }}
                  placeholder="Answer"
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg outline-none resize-none"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
            ))}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setFaqs([...faqs, { question: '', answer: '' }]); }}
                className="px-4 py-2 rounded-lg font-medium"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
              >
                + Add More
              </button>
              <button
                type="button"
                onClick={() => setAddingFaq(false)}
                className="px-4 py-2 rounded-lg font-medium"
                style={{ color: 'var(--text-muted)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-lg font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: 'var(--accent)' }}
              >
                {saving ? 'Saving...' : 'Save FAQ'}
              </button>
            </div>
          </form>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Existing Contexts</h3>
        {bot.contexts.length === 0 ? (
          <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>No contexts added yet</p>
        ) : (
          <div className="space-y-3">
            {bot.contexts.map(ctx => (
              <div key={ctx.id} className="flex items-start justify-between p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="flex-1">
                  <span className="inline-block px-2 py-1 rounded text-xs font-medium mb-2" style={{ background: ctx.type === 'faq' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(34, 197, 94, 0.2)', color: ctx.type === 'faq' ? 'var(--accent)' : 'var(--success)' }}>
                    {ctx.type}
                  </span>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {ctx.type === 'faq' ? `${(ctx.content as FAQ[]).length} Q&A pairs` : (ctx.content as string).substring(0, 100) + '...'}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteContext(ctx.id)}
                  className="p-2 rounded-lg transition-colors hover:opacity-80"
                  style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DocumentsTab({ bot, token, onUpdate }: { bot: BotDetail; token: string; onUpdate: (token: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be under 5MB');
      return;
    }

    setUploading(true);
    try {
      await apiClient.documents.upload(token, bot.id, file);
      onUpdate(token);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Delete this document?')) return;
    try {
      await apiClient.documents.delete(token, bot.id, docId);
      onUpdate(token);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); }}
        onClick={() => fileInputRef.current?.click()}
        className="p-12 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all"
        style={{
          borderColor: dragOver ? 'var(--accent)' : 'var(--border)',
          background: dragOver ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-card)',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={e => handleUpload(e.target.files)}
          className="hidden"
        />
        <svg className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          {uploading ? 'Uploading...' : 'Drop PDF here or click to upload'}
        </p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Max file size: 5MB</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Uploaded Documents</h3>
        {bot.documents.length === 0 ? (
          <p className="text-center py-8" style={{ color: 'var(--text-muted)' }}>No documents uploaded yet</p>
        ) : (
          <div className="space-y-3">
            {bot.documents.map(doc => (
              <div key={doc.id} className="flex items-start justify-between p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-5 h-5" style={{ color: 'var(--error)' }} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7 3a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V9.828a2 2 0 00-.586-1.414l-4.828-4.828A2 2 0 0012.586 3H7zm5 14H6a1 1 0 01-1-1V6a1 1 0 011-1h2.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V16a1 1 0 01-1 1z"/>
                    </svg>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>PDF Document</span>
                  </div>
                  <p className="text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{doc.summary}</p>
                </div>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-2 rounded-lg transition-colors hover:opacity-80"
                  style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ChatTab({ bot }: { bot: BotDetail }) {
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const { response } = await apiClient.chat.send(bot.id, userMessage);
      setMessages(prev => [...prev, { role: 'bot', content: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', content: 'Sorry, something went wrong.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', height: '500px', display: 'flex', flexDirection: 'column' }}>
        <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Test Chat</h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Messages are sent directly to the bot</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
              <p>Send a message to test your bot</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className="max-w-[80%] px-4 py-3 rounded-2xl"
                style={{
                  background: msg.role === 'user' ? bot.themeColor : 'var(--bg-secondary)',
                  color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                  borderBottomLeftRadius: msg.role === 'user' ? '16px' : '4px',
                  borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-2xl" style={{ background: 'var(--bg-secondary)' }}>
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--text-muted)', animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--text-muted)', animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--text-muted)', animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-4 border-t flex gap-3" style={{ borderColor: 'var(--border)' }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 rounded-xl outline-none"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: bot.themeColor }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

function EmbedTab({ bot }: { bot: BotDetail }) {
  const embedCode = `<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/widget.js" data-bot-id="${bot.id}" data-api-base="${typeof window !== 'undefined' ? window.location.origin : ''}" data-theme="${bot.themeColor}"></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    alert('Copied to clipboard!');
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="p-6 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Embed Widget</h3>
        <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Add this script to your website to display the chat widget</p>

        <div className="relative">
          <pre className="p-4 rounded-xl overflow-x-auto text-sm" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
            <code>{embedCode}</code>
          </pre>
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
            style={{ background: 'var(--accent)', color: 'white' }}
          >
            Copy
          </button>
        </div>
      </div>

      <div className="p-6 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Widget Features</h3>
        <ul className="space-y-3">
          {[
            'Floating chat button (bottom-right)',
            'Theme color matches your bot',
            'Real-time chat responses',
            'No framework dependencies',
            'Works on any website'
          ].map((feature, i) => (
            <li key={i} className="flex items-center gap-3" style={{ color: 'var(--text-secondary)' }}>
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
