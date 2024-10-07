// app/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export default function ProfilePage() {
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [savingsGoal, setSavingsGoal] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const loadUserSettings = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setMonthlyBudget(data.monthlyBudget);
          setSavingsGoal(data.savingsGoal);
        }
      }
    };
    loadUserSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (user) {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, {
        monthlyBudget: parseFloat(monthlyBudget),
        savingsGoal: parseFloat(savingsGoal),
      });
      setSuccessMessage('Einstellungen erfolgreich gespeichert!');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
      <h1 className="text-2xl font-semibold text-center dark:text-white mb-6">
        Profil: Budget und Sparziel ändern
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Monatliches Budget (€):
          </label>
          <input
            type="number"
            value={monthlyBudget}
            onChange={(e) => setMonthlyBudget(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Sparziel (€):
          </label>
          <input
            type="number"
            value={savingsGoal}
            onChange={(e) => setSavingsGoal(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Einstellungen speichern
        </button>
        {successMessage && <p className="text-green-500 mt-4">{successMessage}</p>}
      </form>
    </div>
  );
}
