'use client';

// app/components/navigation/navbar/index.tsx
import Link from 'next/link';
import './navbar.css';
import { useState } from 'react'; // Für das mobile Menü
import { signIn, signOut, useSession } from 'next-auth/react';

export default function Navbar() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <Link href="/">MyBudget</Link>
        </div>

        {/* Links */}
        <ul className={`navbar-links ${isMobileMenuOpen ? 'active' : ''}`}>
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

        {/* Hamburger Menu Button für Mobile */}
        <div
          className="navbar-toggle"
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="navbar-toggle-bar"></span>
          <span className="navbar-toggle-bar"></span>
          <span className="navbar-toggle-bar"></span>
        </div>
      </div>
    </nav>
  );
}
