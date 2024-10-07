'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Chart } from 'chart.js/auto';

export default function ExpensesPage() {
  const [user, loading] = useAuthState(auth);
  const [userSettings, setUserSettings] = useState<any | null>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [remainingBudget, setRemainingBudget] = useState<number | null>(null);
  const [monthlyBudget, setMonthlyBudget] = useState<number | null>(null);
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    const loadUserSettings = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUserSettings(userData);
          setExpenses(userData.expenses || []);
          setRemainingBudget(userData.remainingBudget);
          setMonthlyBudget(userData.monthlyBudget);
          generateChartData(userData);
        }
      }
    };

    if (!loading && user) {
      loadUserSettings();
    }
  }, [user, loading]);

  // Funktion zum Generieren der Daten für den Graphen
  const generateChartData = (userData: any) => {
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const dailyBudget = userData.monthlyBudget / daysInMonth;
    const labels = Array.from({ length: daysInMonth }, (_, i) => `Tag ${i + 1}`);

    let budgetLeft = userData.monthlyBudget;
    const data = labels.map((_, day) => {
      // An jedem Tag wird geprüft, ob Ausgaben das Budget mindern
      const dailyExpenses = userData.expenses.filter(
        (expense: any) => new Date(expense.date).getDate() === day + 1
      );
      dailyExpenses.forEach((expense: any) => {
        budgetLeft -= expense.amount;
      });
      return budgetLeft;
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
      const ctx = document.getElementById('budgetChart') as HTMLCanvasElement;
      new Chart(ctx, {
        type: 'line',
        data: chartData,
      });
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
          {expenses.map((expense, index) => (
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
