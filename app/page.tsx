// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';

interface UserSettings {
  remainingBudget: number;
  monthlyBudget: number;
  savingsGoal: number;
  lastResetMonth: number;
  budgetfestgelegt: boolean;
  expenses: { amount: number; name: string; note: string }[]; // Liste der Ausgaben
}

export default function HomePage() {
  const [user, loading] = useAuthState(auth);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [remainingBudget, setRemainingBudget] = useState<number | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [newExpense, setNewExpense] = useState({ amount: '', name: '', note: '' });
  const router = useRouter();

  // Funktion, um die Benutzereinstellungen aus Firestore zu laden
  const loadUserSettings = async () => {
    const user = auth.currentUser;
    if (user) {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data() as UserSettings;
        console.log('Firestore-Daten geladen:', userData);

        // Prüfen, ob die Ausgabenliste vorhanden ist, wenn nicht, initialisieren wir sie als leeres Array
        if (!userData.expenses) {
          userData.expenses = [];
        }

        if (!userData.budgetfestgelegt) {
          console.log('Budget nicht festgelegt, zeige Popup an.');
          setShowPopup(true);
        } else {
          const availableBudget = userData.monthlyBudget - userData.savingsGoal;
          setUserSettings(userData);
          setRemainingBudget(userData.remainingBudget ?? availableBudget);
          setProgress((userData.remainingBudget! / availableBudget) * 100);

          const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
          const currentDay = new Date().getDate();
          setDaysLeft(daysInMonth - currentDay);
        }
      } else {
        // Wenn kein Dokument existiert, erstelle einen leeren Eintrag für den Benutzer
        console.log('Kein Benutzerdokument vorhanden, erstelle neues.');
        await setDoc(docRef, {
          budgetfestgelegt: false,
          monthlyBudget: null,
          savingsGoal: null,
          remainingBudget: null,
          lastResetMonth: null,
          expenses: [], // Leere Ausgabenliste
        });
        setShowPopup(true);
      }
    }
  };

  useEffect(() => {
    if (!loading && user) {
      loadUserSettings();
    }
  }, [user, loading]);

  // Funktion zum Hinzufügen einer neuen Ausgabe
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (user && newExpense.amount && newExpense.name) {
      const expenseAmount = parseFloat(newExpense.amount);
      const updatedRemainingBudget = remainingBudget! - expenseAmount;

      // Update Firestore mit der neuen Ausgabe und dem neuen verbleibenden Budget
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, {
        remainingBudget: updatedRemainingBudget,
        expenses: arrayUnion({
          amount: expenseAmount,
          name: newExpense.name,
          note: newExpense.note || '',
        }),
      });

      // Update den lokalen Zustand
      setRemainingBudget(updatedRemainingBudget);
      setUserSettings((prev) => ({
        ...prev!,
        expenses: [
          ...prev!.expenses,
          {
            amount: expenseAmount,
            name: newExpense.name,
            note: newExpense.note || '',
          },
        ],
      }));

      // Leere das Eingabefeld nach dem Hinzufügen
      setNewExpense({ amount: '', name: '', note: '' });
    }
  };

  if (loading) return <p>Laden...</p>;

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
      <h1 className="text-2xl font-semibold text-center dark:text-white mb-6">
        Verbleibendes Budget
      </h1>

      {showPopup ? (
        <div className="bg-yellow-100 p-4 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold mb-2 text-yellow-900">Budget festlegen</h2>
          <p className="text-yellow-800 mb-4">
            Du hast dein monatliches Budget und dein Sparziel noch nicht festgelegt. Bitte nimm diese Einstellungen vor.
          </p>
          <button
            onClick={() => router.push('/budget')}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Budget festlegen
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4">
            {remainingBudget !== null ? (
              <>
                <progress className="w-full" value={progress || 0} max="100"></progress>
                <p className="text-center text-lg mt-2 dark:text-gray-300">
                  Noch {remainingBudget} € übrig
                </p>
              </>
            ) : (
              <p className="text-center text-lg dark:text-gray-300">Lade Budgetdaten...</p>
            )}
          </div>

          {/* Neue Ausgabe hinzufügen */}
          <form onSubmit={handleAddExpense} className="mb-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Ausgabenbetrag (€)
              </label>
              <input
                type="number"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                required
                className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Benennung der Ausgabe
              </label>
              <input
                type="text"
                value={newExpense.name}
                onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                required
                className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Anmerkung (optional)
              </label>
              <input
                type="text"
                value={newExpense.note}
                onChange={(e) => setNewExpense({ ...newExpense, note: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
            >
              Ausgabe hinzufügen
            </button>
          </form>

          {/* Liste der Ausgaben */}
          <h2 className="text-xl font-semibold text-center dark:text-white mb-4">Ausgaben</h2>
          <ul className="space-y-4">
            {userSettings?.expenses && userSettings.expenses.length > 0 ? (
              userSettings.expenses.map((expense, index) => (
                <li key={index} className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-md">
                  <p className="text-lg font-semibold dark:text-white">{expense.name}</p>
                  <p className="text-gray-700 dark:text-gray-300">Betrag: {expense.amount} €</p>
                  {expense.note && <p className="text-gray-600 dark:text-gray-400">Anmerkung: {expense.note}</p>}
                </li>
              ))
            ) : (
              <p className="text-center text-lg dark:text-gray-300">Keine Ausgaben vorhanden</p>
            )}
          </ul>
        </>
      )}
    </div>
  );
}
