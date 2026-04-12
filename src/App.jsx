import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

// Komponensek importálása
import Header from './Header';
import Home from './Home';
import Szemely from './Szemely';
import Teher from './Teher';
import Motor from './Motor';
import Alvazszamkereso from './Alvazszamkereso';
import Cikkszam from './Cikkszam';
import Folyadekok from './Folyadekok';
import Kosar from './Kosar';
import Segitsegkeres from './Segitsegkeres';
import Bejelentkezes from './Bejelentkezes';
import Register from './Register';
import Admin from './Admin';
import Aszf from './Aszf';

// Opcionális: Egy közös Footer komponens (ha készítesz ilyet)
// import Footer from './Footer';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* A Header minden oldalon látszódni fog */}
        <Header />

        {/* Az oldalak tartalma */}
        <main className="flex-grow">
          <Routes>
            {/* Fő kategóriák */}
            <Route path="/" element={<Home />} />
            <Route path="/szemely" element={<Szemely />} />
            <Route path="/teher" element={<Teher />} />
            <Route path="/motor" element={<Motor />} />

            {/* Speciális keresők */}
            <Route path="/alvazszamkereso" element={<Alvazszamkereso />} />
            <Route path="/cikkszam" element={<Cikkszam />} />
            <Route path="/folyadekok" element={<Folyadekok />} />

            {/* Felhasználói funkciók */}
            <Route path="/kosar" element={<Kosar />} />
            <Route path="/segitsegkeres" element={<Segitsegkeres />} />
            <Route path="/bejelentkezes" element={<Bejelentkezes />} />
            <Route path="/register" element={<Register />} />
            <Route path="/aszf" element={<Aszf />} />

            {/* Admin felület */}
            <Route path="/admin" element={<Admin />} />

            {/* 404 - Oldal nem található (opcionális) */}
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center py-20">
                <h1 className="text-4xl font-black text-gray-300">404</h1>
                <p className="text-gray-500">A keresett oldal nem található.</p>
              </div>
            } />
          </Routes>
        </main>

        {/* Itt lehetne egy közös Footer, ha szeretnéd */}
        <footer className="bg-gray-900 text-gray-400 py-6 text-center text-sm">
          <p>&copy; 2026 AutoParts Pro - Minden jog fenntartva.</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}
