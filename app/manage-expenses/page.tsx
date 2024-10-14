'use client';

import { useState } from 'react';
import { doc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';

interface Expense {
  amount: number;
  name: string;
  note?: string;
  date: string;
  category: string;
  isRecurring?: boolean;
  frequency?: string;
  dueDay?: number;
  alreadyChargedThisMonth?: boolean;
}

interface UserSettings {
  remainingBudget: number;
  monthlyBudget: number;
  savingsGoal: number;
  lastResetMonth: number;
  budgetfestgelegt: boolean;
  expenses: Expense[];
}

export default function ManageExpensesPage() {
  const [user] = useAuthState(auth);
  const [newExpense, setNewExpense] = useState({
    amount: '',
    name: '',
    note: '',
    category: '',
    isRecurring: false,
    frequency: '',
    dueDay: '',
    alreadyChargedThisMonth: false,
  });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();

    if (user && newExpense.amount && newExpense.name && newExpense.category) {
      const expenseAmount = parseFloat(newExpense.amount);

      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data() as UserSettings;

        // Aktuelles remainingBudget berechnen
        const updatedRemainingBudget = userData.remainingBudget - expenseAmount;

        // Erstelle das Ausgabe-Objekt, wobei zusätzliche Felder nur für wiederkehrende Ausgaben gesetzt werden
        const expense: Expense = {
          amount: expenseAmount,
          name: newExpense.name,
          note: newExpense.note || '',
          date: new Date().toISOString(),
          category: newExpense.category,
          isRecurring: newExpense.isRecurring,
          ...(newExpense.isRecurring && {
            frequency: newExpense.frequency,
            dueDay: parseInt(newExpense.dueDay),
            alreadyChargedThisMonth: newExpense.alreadyChargedThisMonth,
          }),
        };

        // Update remainingBudget und expenses in der Datenbank
        await updateDoc(docRef, {
          remainingBudget: updatedRemainingBudget,
          expenses: arrayUnion(expense),
        });

        // Optional: Reset des Formulars
        setNewExpense({ amount: '', name: '', note: '', category: '', isRecurring: false, frequency: '', dueDay: '', alreadyChargedThisMonth: false });
        setError(null);

        // Optional: Weiterleitung zur Homepage oder Aktualisierung
        router.push('/');
      }
    } else {
      setError('Bitte alle Felder ausfüllen');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
      <h1 className="text-2xl font-semibold text-center dark:text-white mb-6">Ausgaben festlegen</h1>

      <form onSubmit={handleAddExpense} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Betrag (€)</label>
          <input
            type="number"
            value={newExpense.amount}
            onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
            required
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name der Ausgabe</label>
          <input
            type="text"
            value={newExpense.name}
            onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
            required
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Anmerkung (optional)</label>
          <input
            type="text"
            value={newExpense.note}
            onChange={(e) => setNewExpense({ ...newExpense, note: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kategorie</label>
          <select
            value={newExpense.category}
            onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
            required
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Kategorie wählen</option>
            <option value="Lebensmittel">Lebensmittel</option>
            <option value="Transport">Transport</option>
            <option value="Unterhaltung">Unterhaltung</option>
            <option value="Miete">Miete</option>
            <option value="Sonstiges">Sonstiges</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Wiederkehrende Ausgabe</label>
          <input
            type="checkbox"
            checked={newExpense.isRecurring}
            onChange={(e) => setNewExpense({ ...newExpense, isRecurring: e.target.checked })}
            className="w-4 h-4 text-blue-600"
          />
        </div>

        {newExpense.isRecurring && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Häufigkeit</label>
              <select
                value={newExpense.frequency}
                onChange={(e) => setNewExpense({ ...newExpense, frequency: e.target.value })}
                required
                className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Häufigkeit wählen</option>
                <option value="täglich">Täglich</option>
                <option value="wöchentlich">Wöchentlich</option>
                <option value="monatlich">Monatlich</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fälligkeitstag des Monats (1-27)</label>
              <input
                type="number"
                value={newExpense.dueDay}
                onChange={(e) => setNewExpense({ ...newExpense, dueDay: e.target.value })}
                min="1"
                max="27"
                required
                className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Diese Ausgabe wurde diesen Monat bereits abgebucht</label>
              <input
                type="checkbox"
                checked={newExpense.alreadyChargedThisMonth}
                onChange={(e) => setNewExpense({ ...newExpense, alreadyChargedThisMonth: e.target.checked })}
                className="w-4 h-4 text-blue-600"
              />
            </div>
          </>
        )}

        {error && <p className="text-red-500">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
        >
          Ausgabe hinzufügen
        </button>
      </form>
    </div>
  );
}
