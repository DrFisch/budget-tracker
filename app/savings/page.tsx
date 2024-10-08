// /app/savings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface UserSettings {
  monthlyBudget: number;
  savingsGoal: number;
  expenses: { amount: number, date: string }[]; // Liste der Ausgaben
}

export default function SavingsPage() {
  const [user, loading] = useAuthState(auth);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [projectedSavings, setProjectedSavings] = useState<number>(0);
  const [spentPercentage, setSpentPercentage] = useState<number>(0);
  const [chartData, setChartData] = useState<any>(null);

  const calculateSavingsProjection = (userData: UserSettings) => {
    const totalExpenses = userData.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const remainingBudget = userData.monthlyBudget - totalExpenses;

    const currentDay = new Date().getDate();
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();

    const spentPercentage = (totalExpenses / userData.monthlyBudget) * 100;
    setSpentPercentage(spentPercentage);

    // Hochrechnung der Ausgaben auf den gesamten Monat basierend auf der bisherigen Ausgabenrate
    const dailySpendRate = totalExpenses / currentDay; // Durchschnittliche tägliche Ausgaben
    const projectedTotalExpenses = dailySpendRate * daysInMonth;
    const projectedSavings = userData.monthlyBudget - projectedTotalExpenses;
    setProjectedSavings(projectedSavings);

    // Daten für das Diagramm vorbereiten
    const labels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}. Tag`);
    const projectedData = labels.map((_, i) => {
      const daySpent = dailySpendRate * (i + 1);
      return userData.monthlyBudget - daySpent;
    });

    const data = {
      labels,
      datasets: [
        {
          label: 'Prognostizierte Ersparnisse',
          data: projectedData,
          borderColor: 'rgba(75, 192, 192, 1)',
          fill: false,
        },
      ],
    };

    setChartData(data);
  };

  const loadUserSettings = async () => {
    const user = auth.currentUser;
    if (user) {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data() as UserSettings;
        setUserSettings(userData);
        calculateSavingsProjection(userData);
      }
    }
  };

  useEffect(() => {
    if (!loading && user) {
      loadUserSettings();
    }
  }, [user, loading]);

  if (loading) return <p>Laden...</p>;

  return (
    <div className="flex justify-center  min-h-screen pt-16"> {/* Added pt-16 for spacing */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 w-full max-w-4xl h-[60vh] flex flex-col justify-between">
        <h1 className="text-3xl font-semibold text-center dark:text-white mb-6">
          Sparprognose für den Monat
        </h1>

        {userSettings && chartData ? (
          <>
            <div className="w-full h-3/4 mb-6">
              <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>

            <div className="mt-6">
              <p className="text-2xl font-semibold text-center dark:text-white">
                Prognostizierte Ersparnisse am Monatsende: {projectedSavings.toFixed(2)} €
              </p>
              <p className="text-center text-lg dark:text-gray-300 mt-4">
                Bisher ausgegeben: {spentPercentage.toFixed(2)}% deines Budgets
              </p>
            </div>
          </>
        ) : (
          <p className="text-center text-lg dark:text-gray-300">Lade Daten...</p>
        )}
      </div>
    </div>
  );
}
