import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

// Definiere das Expense Interface
interface Expense {
  amount: number;
  name: string;
  note?: string;
  date: string;
  category: string;
  isRecurring?: boolean;
  frequency?: 'täglich' | 'wöchentlich' | 'monatlich';
  dueDay?: number;
  alreadyChargedThisMonth?: boolean;
}

// Mach die Funktion asynchron und exportiere sie
export async function checkRecurringExpenses(): Promise<void> {
  const user = auth.currentUser;
  if (user) {
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();
      const today = new Date().getDate(); // Aktueller Tag des Monats

      const updatedExpenses: Expense[] = (userData.expenses as Expense[]).map((expense: Expense) => {
        if (
          expense.isRecurring &&
          expense.frequency === 'monatlich' &&
          expense.dueDay === today &&
          !expense.alreadyChargedThisMonth
        ) {
          // Vom Budget abziehen
          userData.remainingBudget -= expense.amount;

          // Füge diese Ausgabe als reguläre Ausgabe hinzu
          const regularExpense: Expense = {
            amount: expense.amount,
            name: expense.name,
            note: expense.note,
            date: new Date().toISOString(),
            category: expense.category,
          };

          // Als abgebucht markieren
          expense.alreadyChargedThisMonth = true;

          // Firebase-Dokument aktualisieren
          updateDoc(docRef, {
            remainingBudget: userData.remainingBudget,
            expenses: updatedExpenses, // Update der recurring status
            regularExpenses: arrayUnion(regularExpense), // Speichern der regulären Ausgabe
          });
        }
        return expense;
      });
    }
  }
}
