'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import BackendLoader from '@/components/BackendLoader';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <BackendLoader>
      <AuthProvider>
        {children}
      </AuthProvider>
    </BackendLoader>
  );
}
