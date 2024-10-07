// app/components/navigation/navbar/index.tsx
'use client';

import Link from 'next/link';
import './navbar.css';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../lib/firebase';
import { signOut } from 'firebase/auth';

export default function Navbar() {
  const [user] = useAuthState(auth); // Benutzerstatus überwachen

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <Link href="/">MyBudget</Link>
        </div>

        {/* Links */}
        <ul className="navbar-links">
          <li>
            <Link href="/" className="navbar-link">Home</Link>
          </li>
          <li>
            <Link href="/about" className="navbar-link">About</Link>
          </li>
          <li>
            <Link href="/budget" className="navbar-link">Budget</Link>
          </li>
          <li>
            <Link href="/contact" className="navbar-link">Contact</Link>
          </li>
        </ul>

        {/* Auth Links */}
        <ul className="navbar-links">
          {user ? (
            <>
              <li className="navbar-link">
                <span>Willkommen, {user.email}</span>
              </li>
              <li>
                <button className="navbar-link" onClick={() => signOut(auth)}>
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
