// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';

// Definiere den Typ für die Benutzereinstellungen
interface UserSettings {
  remainingBudget: number;
  monthlyBudget: number;
  savingsGoal: number;
  lastResetMonth: number;
}

export default function HomePage() {
  const [user, loading] = useAuthState(auth); // Benutzerstatus prüfen
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [showPopup, setShowPopup] = useState(false); // Zustand für das Popup
  const [remainingBudget, setRemainingBudget] = useState(0);
  const [progress, setProgress] = useState(0);
  const [daysLeft, setDaysLeft] = useState(0);
  const router = useRouter();

  // Funktion, um das Budget am 1. des Monats zurückzusetzen
  const checkAndResetBudget = async () => {
    const user = auth.currentUser;
    if (user) {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data() as UserSettings; // Typ der Daten angeben
        const currentMonth = new Date().getMonth(); // Aktueller Monat

        // Wenn der Monat gewechselt hat, das Budget zurücksetzen
        if (userData.lastResetMonth !== currentMonth) {
          await updateDoc(docRef, {
            remainingBudget: userData.monthlyBudget, // Budget zurücksetzen
            lastResetMonth: currentMonth, // Monat aktualisieren
          });
          // Einstellungen neu laden, da das Budget zurückgesetzt wurde
          setUserSettings({
            ...userData,
            remainingBudget: userData.monthlyBudget,
          });
        } else {
          setUserSettings(userData); // Benutzerdaten setzen, falls kein Reset nötig
        }

        // Prüfen, ob das Budget festgelegt wurde, ansonsten Popup anzeigen
        if (!userData.monthlyBudget || !userData.savingsGoal) {
          setShowPopup(true); // Zeige das Popup an, wenn keine Budgetdaten vorhanden sind
        }
      }
    }
  };

  // Effekt zum Laden der Benutzereinstellungen und zum Überprüfen des monatlichen Resets
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!loading && user) {
        await checkAndResetBudget(); // Budget-Reset überprüfen
      }
    };

    loadUserSettings();
  }, [user, loading]);

  useEffect(() => {
    if (userSettings) {
      const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
      const currentDay = new Date().getDate();
      setRemainingBudget(userSettings.remainingBudget);
      setProgress((userSettings.remainingBudget / userSettings.monthlyBudget) * 100);
      setDaysLeft(daysInMonth - currentDay);
    }
  }, [userSettings]);

  if (loading) return <p>Laden...</p>;

  // Wenn der Benutzer nicht eingeloggt ist
  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h1 className="text-2xl font-semibold text-center dark:text-white">Willkommen!</h1>
        <p className="mt-4 text-center text-gray-700 dark:text-gray-300">
          Bitte logge dich ein, um dein Budget zu verwalten.
        </p>
      </div>
    );
  }

  if (!userSettings) return <p>Benutzerdaten werden geladen...</p>;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
      <h1 className="text-2xl font-semibold text-center dark:text-white mb-6">
        Verbleibendes Budget
      </h1>
      <div className="mb-4">
        <progress className="w-full" value={progress} max="100"></progress>
        <p className="text-center text-lg mt-2 dark:text-gray-300">
          Noch {remainingBudget} € übrig
        </p>
      </div>
      <div className="mt-4">
        <p className="text-center text-lg dark:text-gray-300">
          Noch {daysLeft} Tage bis zum Monatsende
        </p>
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-semibold mb-4">Budget festlegen</h2>
            <p className="text-gray-700 mb-4">
              Du hast dein monatliches Budget und dein Sparziel noch nicht festgelegt. Bitte
              nimm diese Einstellungen vor, bevor du fortfährst.
            </p>
            <button
              onClick={() => router.push('/budget')}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Einstellungen vornehmen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
