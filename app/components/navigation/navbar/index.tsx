'use client';

import { useState } from 'react';
import Link from 'next/link';
import './navbar.css';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false); // Zustand für das mobile Menü

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/signup');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen); // Zustand toggeln
  };

  return (
    <nav className="navbar">
      <div className="navbar-container flex justify-between items-center">
        <img src="/SigmaSavings.png" alt="Banner" className="navbar-banner" />

        {/* Burger Menu Button für mobile Ansicht */}
        <div className="md:hidden ml-2">
          <button
            onClick={toggleMenu}
            type="button"
            className="text-white focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16m-7 6h7'}
              />
            </svg>
          </button>
        </div>

        {/* Menü für Desktop-Ansicht */}
        <ul className="navbar-links hidden md:flex space-x-6">
          <li>
            <Link href="/" className="navbar-link">Home</Link>
          </li>
          <li>
            <Link href="/manage-expenses" className="navbar-link">Ausgaben</Link>
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
          
        </ul>

        {/* Mobile Menü */}
        {isOpen && (
          <ul className="navbar-links flex flex-col space-y-4 mt-4 md:hidden bg-blue-600 p-4 rounded-lg">
            <li>
              <Link href="/" className="navbar-link" onClick={toggleMenu}>Home</Link>
            </li>
            <li>
              <Link href="/manage-expenses" className="navbar-link" onClick={toggleMenu}>Ausgaben</Link>
            </li>
            <li>
              <Link href="/expenses" className="navbar-link" onClick={toggleMenu}>Analyse</Link>
            </li>
            <li>
              <Link href="/savings" className="navbar-link" onClick={toggleMenu}>Sparen</Link>
            </li>
            <li>
              <Link href="/budget" className="navbar-link" onClick={toggleMenu}>Budget</Link>
            </li>
            <li>
              <Link href="/contact" className="navbar-link" onClick={toggleMenu}>Impressum</Link>
            </li>
          </ul>
        )}

        {/* Benutzerstatus für Desktop */}
        <ul className="navbar-links hidden md:flex space-x-6">
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

        {/* Benutzerstatus für mobiles Menü */}
        {isOpen && (
          <ul className="navbar-links flex flex-col space-y-4 mt-4 md:hidden">
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
                <Link href="/signup" className="navbar-link" onClick={toggleMenu}>
                  Anmelden / Registrieren
                </Link>
              </li>
            )}
          </ul>
        )}
      </div>
    </nav>
  );
}
