// /app/manage-expenses/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { doc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';

interface Expense {
  amount: number;
  name: string;
  note?: string;
  date: string;
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
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loadUserSettings = async () => {
    const user = auth.currentUser;
    if (user) {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data() as UserSettings;
        setUserSettings(userData);
      }
    }
  };

  useEffect(() => {
    loadUserSettings();
  }, [user]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();

    if (user && newExpense.amount && newExpense.name) {
      const expenseAmount = parseFloat(newExpense.amount);

      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data() as UserSettings;

        const updatedRemainingBudget = userData.remainingBudget - expenseAmount;

        // Update remainingBudget und expenses in der Datenbank
        await updateDoc(docRef, {
          remainingBudget: updatedRemainingBudget,
          expenses: arrayUnion({
            amount: expenseAmount,
            name: newExpense.name,
            note: newExpense.note || '',
            date: new Date().toISOString(),
          }),
        });

        // Reset des Formulars und Aktualisierung der Daten
        setNewExpense({ amount: '', name: '', note: '', category: '', isRecurring: false, frequency: '', dueDay: '', alreadyChargedThisMonth: false });
        loadUserSettings(); // Daten neu laden
        setError(null);
      }
    } else {
      setError('Bitte alle Felder ausfüllen');
    }
  };

  // Funktion, um das Datum im benutzerfreundlichen Format anzuzeigen
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Filtere die Ausgaben für den aktuellen Monat
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const currentMonthExpenses = userSettings?.expenses.filter(
    (expense) =>
      new Date(expense.date).getMonth() === currentMonth &&
      new Date(expense.date).getFullYear() === currentYear
  );

  return (
    <div className="container mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
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

        {error && <p className="text-red-500">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
        >
          Ausgabe hinzufügen
        </button>
      </form>

      {/* Tabelle der aktuellen Monatsausgaben */}
      <h2 className="text-xl font-semibold text-center dark:text-white mt-6 mb-4">Ausgaben im aktuellen Monat</h2>

      {currentMonthExpenses && currentMonthExpenses.length > 0 ? (
        <div className="overflow-x-auto"> {/* Scrollbare Tabelle */}
          <table className="min-w-full table-auto bg-white dark:bg-gray-800 rounded-lg">
            <thead>
              <tr className="text-left bg-gray-200 dark:bg-gray-700">
                <th className="px-4 py-2">Datum</th>
                <th className="px-4 py-2">Betrag (€)</th>
                <th className="px-4 py-2">Beschreibung</th>
                <th className="px-4 py-2">Anmerkung</th>
              </tr>
            </thead>
            <tbody>
              {currentMonthExpenses.map((expense, index) => (
                <tr key={index} className={`bg-gray-100 dark:bg-gray-700 ${index % 2 === 0 ? 'bg-gray-100' : 'bg-white dark:bg-gray-800'}`}>
                  <td className="border px-4 py-2">{formatDate(expense.date)}</td>
                  <td className="border px-4 py-2">{expense.amount} €</td>
                  <td className="border px-4 py-2">{expense.name}</td>
                  <td className="border px-4 py-2">{expense.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-lg dark:text-gray-300 mt-4">Keine Ausgaben für diesen Monat vorhanden</p>
      )}
    </div>
  );
}
