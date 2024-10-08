// app/login/page.tsx
'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useRouter } from 'next/navigation';  // Router importieren

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();  // Router initialisieren

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');  // Nach erfolgreichem Login zur Homepage leiten
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-900 dark:bg-gray-900 pt-20">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-semibold mb-6 text-center text-white">
          Einloggen
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">
              E-Mail:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-700 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Passwort:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-700 text-white"
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <button
            type="submit"
            className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Einloggen
          </button>
        </form>
        <p className="mt-4 text-center text-gray-300">
          Noch kein Konto?{' '}
          <button
            type="button"
            className="text-blue-400 hover:underline"
            onClick={() => router.push('/signup')}
          >
            Hier registrieren
          </button>
        </p>
      </div>
    </div>
  );
}
