// app/components/navigation/navbar/index.tsx
'use client';

import Link from 'next/link';
import './navbar.css';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [user] = useAuthState(auth);
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/signup');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
      <img src="/SigmaSavings.png"  alt="Banner" className="navbar-banner" />
        

        <ul className="navbar-links">
          <li>
            <Link href="/" className="navbar-link">Home</Link>
          </li>
          <li>
            <Link href="/manage-expenses" className='navbar-link'>Ausgaben</Link>
          </li>
          
          <li>
            <Link href="/expenses" className="navbar-link">Analyse</Link>
          </li>
          <li>
            <Link href="/savings" className="navbar-link">Sparen</Link>
          </li>
          <li>
            <Link href="/budget" className="navbar-link">Budget</Link>
          </li>
          <li>
            <Link href="/contact" className="navbar-link">Impressum</Link> {/* Link zu Impressum */}
          </li>
        </ul>

        <ul className="navbar-links">
          {user ? (
            <>
              <li className="navbar-link">
                <span>{user.email}</span>
              </li>
              <li>
                <button className="navbar-link" onClick={handleSignOut}>
                  Abmelden
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link href="/signup" className="navbar-link">
                Anmelden / Registrieren
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
