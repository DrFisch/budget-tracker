// app/expenses/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Chart } from 'chart.js/auto';

// Typen definieren
interface Expense {
  amount: number;
  name: string;
  note: string;
  date: string; // Datum als ISO-String
}

interface UserSettings {
  remainingBudget: number;
  monthlyBudget: number;
  expenses: Expense[];
  savingsGoal: number;
  lastResetMonth: number;
  budgetfestgelegt: boolean;
}

export default function ExpensesPage() {
  const [user, loading] = useAuthState(auth);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    const loadUserSettings = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data() as UserSettings;
          setUserSettings(userData);
          generateChartData(userData);
        }
      }
    };

    if (!loading && user) {
      loadUserSettings();
    }
  }, [user, loading]);

  // Funktion zum Generieren der Daten für den Graphen
  const generateChartData = (userData: UserSettings) => {
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const labels = Array.from({ length: daysInMonth }, (_, i) => `Tag ${i + 1}`);
    
    const currentDay = new Date().getDate();
    const availableBudget = userData.monthlyBudget - userData.savingsGoal;
    
    let budgetLeft = availableBudget;
    const data = labels.map((_, day) => {
      if (day < currentDay) {
        // An jedem Tag prüfen, ob Ausgaben das Budget mindern
        const dailyExpenses = userData.expenses.filter(
          (expense) => new Date(expense.date).getDate() === day + 1
        );
        dailyExpenses.forEach((expense) => {
          budgetLeft -= expense.amount; // Budget reduzieren
        });
      }
      return budgetLeft; // Das verbleibende Budget zurückgeben
    });

    setChartData({
      labels: labels.slice(0, currentDay), // Nur bis zum aktuellen Tag anzeigen
      datasets: [
        {
          label: 'Verfügbares Budget',
          data: data.slice(0, currentDay), // Daten nur bis zum aktuellen Tag
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
      ],
    });
  };

  useEffect(() => {
    if (chartData) {
      const ctx = document.getElementById('budgetChart') as HTMLCanvasElement | null;
      if (ctx) {
        new Chart(ctx, {
          type: 'line',
          data: chartData,
          options: {
            scales: {
              y: {
                min: 0, // Setze die Y-Achse auf 0 Euro
              },
            },
            plugins: {
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const day = context.label;
                    const amount = context.raw; // Verfügbares Budget an diesem Tag
                    return [`${day}: ${amount} €`]; // Tooltip-Inhalt anpassen
                  },
                },
              },
            },
          },
        });
      }
    }
  }, [chartData]);

  if (loading) return <p>Laden...</p>;

  return (
    <div className="container mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
      <h1 className="text-2xl font-semibold text-center dark:text-white mb-6">Monatliche Ausgaben</h1>

      {/* Tabelle der Ausgaben */}
      <table className="min-w-full table-auto bg-white dark:bg-gray-800">
        <thead>
          <tr>
            <th className="px-4 py-2">Datum</th>
            <th className="px-4 py-2">Betrag (€)</th>
            <th className="px-4 py-2">Beschreibung</th>
            <th className="px-4 py-2">Anmerkung</th>
          </tr>
        </thead>
        <tbody>
          {userSettings?.expenses.map((expense, index) => (
            <tr key={index} className="bg-gray-100 dark:bg-gray-700">
              <td className="border px-4 py-2">{new Date(expense.date).toLocaleDateString()}</td>
              <td className="border px-4 py-2">{expense.amount}</td>
              <td className="border px-4 py-2">{expense.name}</td>
              <td className="border px-4 py-2">{expense.note}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Graph des Budgets */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-center dark:text-white mb-4">Verlauf des Budgets</h2>
        <canvas id="budgetChart"></canvas>
      </div>
    </div>
  );
}
