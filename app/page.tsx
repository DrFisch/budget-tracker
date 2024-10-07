'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';

interface UserSettings {
  remainingBudget: number | null;
  monthlyBudget: number | null;
  savingsGoal: number | null;
  lastResetMonth: number | null;
  budgetfestgelegt: boolean;
}

export default function HomePage() {
  const [user, loading] = useAuthState(auth);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [remainingBudget, setRemainingBudget] = useState<number | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
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

        // Prüfen, ob das Budget festgelegt wurde
        if (!userData.budgetfestgelegt) {
          console.log('Budget nicht festgelegt, zeige Popup an.');
          setShowPopup(true);
        } else {
          // Berechne verbleibendes Budget unter Berücksichtigung des Sparziels
          const availableBudget = userData.monthlyBudget! - userData.savingsGoal!;
          const usedBudget = userData.remainingBudget ?? availableBudget;

          setUserSettings(userData);
          setRemainingBudget(usedBudget);
          setProgress((usedBudget / availableBudget) * 100);

          // Berechne die verbleibenden Tage im Monat
          const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
          const currentDay = new Date().getDate();
          setDaysLeft(daysInMonth - currentDay);
        }
      } else {
        console.log('Kein Benutzerdokument vorhanden, erstelle neues.');
        await setDoc(docRef, {
          budgetfestgelegt: false,
          monthlyBudget: null,
          savingsGoal: null,
          remainingBudget: null,
          lastResetMonth: null,
        });
        setShowPopup(true);
      }
    }
  };

  useEffect(() => {
    if (!loading && user) {
      console.log('Benutzer eingeloggt, Lade Benutzereinstellungen...');
      loadUserSettings();
    }
  }, [user, loading]);

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
          <div className="mt-4">
            {daysLeft !== null ? (
              <p className="text-center text-lg dark:text-gray-300">
                Noch {daysLeft} Tage bis zum Monatsende
              </p>
            ) : (
              <p className="text-center text-lg dark:text-gray-300">Tage bis zum Monatsende werden berechnet...</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
