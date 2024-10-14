// app/expenses/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Chart } from 'chart.js/auto';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'; // Importiere die Icons

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
  const [currentMonth, setCurrentMonth] = useState(new Date()); // Aktueller Monat
  const [chartData, setChartData] = useState<any>(null);
  const [chartInstance, setChartInstance] = useState<Chart | null>(null); // Zustand für die Chart-Instanz

  useEffect(() => {
    const loadUserSettings = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data() as UserSettings;
          setUserSettings(userData);

          // Prüfe, ob es Ausgaben gibt, bevor Daten für den Graph generiert werden
          if (userData.expenses && userData.expenses.length > 0) {
            generateChartData(userData, currentMonth);
          }
        }
      }
    };

    if (!loading && user) {
      loadUserSettings();
    }
  }, [user, loading, currentMonth]);

  // Funktion zum Generieren der Daten für den Graphen
  const generateChartData = (userData: UserSettings, month: Date) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const labels = Array.from({ length: daysInMonth }, (_, i) => `Tag ${i + 1}`);

    const availableBudget = userData.monthlyBudget - userData.savingsGoal; // Berechnung des verfügbaren Budgets
    let budgetLeft = availableBudget;

    const data = labels.map((_, day) => {
      // An jedem Tag prüfen, ob Ausgaben das Budget mindern
      const dailyExpenses = userData.expenses.filter(
        (expense) => new Date(expense.date).getMonth() === monthIndex && new Date(expense.date).getFullYear() === year && new Date(expense.date).getDate() === day + 1
      );
      dailyExpenses.forEach((expense) => {
        budgetLeft -= expense.amount; // Budget reduzieren
      });
      return budgetLeft; // Das verbleibende Budget zurückgeben
    });

    setChartData({
      labels: labels,
      datasets: [
        {
          label: 'Verfügbares Budget',
          data: data,
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

      // Zerstöre die vorherige Chart-Instanz, falls vorhanden
      if (chartInstance) {
        chartInstance.destroy();
      }

      if (ctx) {
        const newChartInstance = new Chart(ctx, {
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

        setChartInstance(newChartInstance); // Speichere die neue Chart-Instanz
      }
    }
  }, [chartData]);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  if (loading) return <p>Laden...</p>;

  return (
    <div className="container mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
      <h1 className="text-2xl font-semibold text-center dark:text-white mb-6">Monatliche Ausgaben</h1>

      <div className="flex justify-between mb-4">
        <button onClick={handlePrevMonth} className="p-2 bg-gray-200 rounded hover:bg-gray-300">
          <ChevronLeftIcon className="h-5 w-5 text-gray-700" />
        </button>
        <h2 className="text-lg font-semibold dark:text-white">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <button onClick={handleNextMonth} className="p-2 bg-gray-200 rounded hover:bg-gray-300">
          <ChevronRightIcon className="h-5 w-5 text-gray-700" />
        </button>
      </div>

      {/* Tabelle der Ausgaben */}
      {userSettings?.expenses && userSettings.expenses.length > 0 ? (
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
            {userSettings.expenses
              .filter(
                (expense) =>
                  new Date(expense.date).getMonth() === currentMonth.getMonth() &&
                  new Date(expense.date).getFullYear() === currentMonth.getFullYear()
              )
              .map((expense, index) => (
                <tr key={index} className="bg-gray-100 dark:bg-gray-700">
                  <td className="border px-4 py-2">
                    {new Date(expense.date).toLocaleDateString()}
                  </td>
                  <td className="border px-4 py-2">{expense.amount}</td>
                  <td className="border px-4 py-2">{expense.name}</td>
                  <td className="border px-4 py-2">{expense.note}</td>
                </tr>
              ))}
          </tbody>
        </table>
      ) : (
        <p className="text-center text-lg dark:text-gray-300">Keine Ausgaben vorhanden</p>
      )}

      {/* Graph des Budgets */}
      {chartData ? (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-center dark:text-white mb-4">Verlauf des Budgets</h2>
          <canvas id="budgetChart"></canvas>
        </div>
      ) : (
        <p className="text-center text-lg dark:text-gray-300">Keine Daten für den Graph verfügbar</p>
      )}
    </div>
  );
}
