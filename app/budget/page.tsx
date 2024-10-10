// /app/budget/page.tsx
'use client';

import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';  
import { useRouter } from 'next/navigation';

export default function BudgetSettings() {
  const [monthlyBudget, setMonthlyBudget] = useState('');
  const [savingsGoal, setSavingsGoal] = useState('');
  const [error, setError] = useState('');
  const router = useRouter(); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const user = auth.currentUser;
      if (user) {
        const monthlyBudgetValue = parseFloat(monthlyBudget);
        const savingsGoalValue = parseFloat(savingsGoal);

        // Firestore-Dokument für den Benutzer erstellen/aktualisieren
        await setDoc(doc(db, 'users', user.uid), {
          monthlyBudget: monthlyBudgetValue,
          savingsGoal: savingsGoalValue,
          remainingBudget: monthlyBudgetValue - savingsGoalValue,
          lastResetMonth: new Date().getMonth(),
          budgetfestgelegt: true,
        });

        // Nach erfolgreicher Speicherung zur Homepage weiterleiten
        router.push('/');
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h1 className="text-2xl font-semibold text-center dark:text-white mb-6">
        Budget und Sparziele festlegen
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
        {error && <p className="text-red-500">{error}</p>}
        <button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Speichern
        </button>
      </form>
    </div>
  );
}
