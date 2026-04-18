'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="animate-spin w-8 h-8 border-2 border-t-transparent rounded-full" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <header className="border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Get Your Bot</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="px-4 py-2 rounded-lg transition-colors" style={{ color: 'var(--text-secondary)' }}>
              Sign in
            </Link>
            <Link href="/register" className="px-4 py-2 rounded-lg font-medium text-white transition-opacity hover:opacity-90" style={{ background: 'var(--accent)' }}>
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center">
        <div className="max-w-6xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm mb-6" style={{ background: 'var(--bg-card)', color: 'var(--accent)' }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
              AI-Powered Chatbots
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ color: 'var(--text-primary)' }}>
              Build intelligent bots with{' '}
              <span style={{ color: 'var(--accent)' }}>your knowledge</span>
            </h1>
            <p className="text-xl mb-8 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Create AI chatbots trained on your documents, FAQs, and content. Embed them anywhere with a single script tag.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/register" className="px-8 py-4 rounded-xl font-semibold text-white transition-all hover:opacity-90 hover:scale-105" style={{ background: 'var(--accent)' }}>
                Start Building Free
              </Link>
              <Link href="/login" className="px-8 py-4 rounded-xl font-medium transition-colors" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                Sign In
              </Link>
            </div>
          </div>

          <div className="relative animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="absolute inset-0 blur-3xl opacity-30" style={{ background: 'var(--accent)' }} />
            <div className="relative rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#eab308' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#22c55e' }} />
              </div>
              <div className="space-y-3 font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>
                <div><span style={{ color: 'var(--accent)' }}>const</span> bot = <span style={{ color: 'var(--success)' }}>await</span> api.createBot({'{'}</div>
                <div className="pl-4">name: <span style={{ color: '#fbbf24' }}>'Customer Support'</span>,</div>
                <div className="pl-4">context: docs,<span style={{ color: 'var(--text-muted)' }}> // your knowledge</span></div>
                <div className="pl-4">provider: <span style={{ color: '#fbbf24' }}>'openai'</span></div>
                <div>{'}'});</div>
                <div className="pt-2">
                  <span style={{ color: 'var(--accent)' }}>embed</span>(bot.script);
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-8" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto px-6 text-center" style={{ color: 'var(--text-muted)' }}>
          Built with Next.js, Prisma, and Tailwind CSS
        </div>
      </footer>
    </div>
  );
}
