import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function Header() {
    const API_URL = 'http://localhost:5000/api';
    const navigate = useNavigate();
    const location = useLocation();
    
    // Állapotok
    const [user, setUser] = useState(null);
    const [cartCount, setCartCount] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Kosár darabszám betöltése - Valós időben lekérdezés az aktuális user-rel
    const loadData = useCallback(async () => {
        const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
        setUser(storedUser);

        if (storedUser && storedUser.id) {
            try {
                // Cache busting: t paraméter hozzáadása, hogy ne legyen cached válasz
                const res = await axios.get(`${API_URL}/cart?t=${Date.now()}`);
                
                // Az API közvetlenül az összes cart itemet adja vissza arrayként
                const allCartItems = Array.isArray(res.data) ? res.data : [];
                
                // Szűrjük az aktuális user itemjeit
                const userCartItems = allCartItems.filter(item => {
                    const itemUserId = item.userId || item.UserId;
                    return itemUserId === storedUser.id || itemUserId === parseInt(storedUser.id);
                });
                
                // Összeadjuk az összes tétel mennyiségét
                const totalCount = userCartItems.reduce((sum, item) => {
                    const mennyiseg = parseInt(item.mennyiseg || item.Mennyiseg) || 1;
                    return sum + mennyiseg;
                }, 0);
                
                setCartCount(totalCount);
            } catch (err) {
                console.error("Hiba a kosár lekérésekor", err);
                setCartCount(0);
            }
        } else {
            setCartCount(0);
        }
    }, []); 

    // Inicializálás + oldalváltáskor frissítés
    useEffect(() => {
        loadData();
    }, [location.pathname, loadData]);

    // Kosár változásakor frissítés (Kosar.jsx dispatch-eli a 'storage' eventet)
    useEffect(() => {
        window.addEventListener('cartUpdated', loadData);
        window.addEventListener('storage', loadData);
        
        return () => {
            window.removeEventListener('cartUpdated', loadData);
            window.removeEventListener('storage', loadData);
        };
    }, [loadData]);

    // Kijelentkezés
    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        setUser(null);
        setCartCount(0);
        setIsMobileMenuOpen(false);
        navigate('/');
    };

    const closeMenu = () => setIsMobileMenuOpen(false);

    return (
        <div className="sticky top-0 z-50">
            {/* Felső vékony sáv */}
            <header className="bg-white shadow-sm border-b border-gray-100 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center justify-between">
                        {/* Logó */}
                        <Link to="/" className="text-2xl font-black text-red-600 tracking-tighter uppercase">
                            AutoParts <span className="text-gray-900">Pro</span>
                        </Link>

                        <div className="hidden md:flex flex-1"></div>

                        {/* Felhasználói menü + Kosár + Hamburger */}
                        <div className="flex items-center gap-4 sm:gap-6">
                            {user ? (
                                <div className="hidden sm:flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-xs text-gray-400">Üdvözöljük,</div>
                                        <div className="text-sm font-bold text-gray-800">{user.vezeteknev} {user.keresztnev}</div>
                                    </div>
                                    <button 
                                        onClick={handleLogout} 
                                        className="text-sm font-bold text-gray-500 hover:text-red-600 transition"
                                    >
                                        Kijelentkezés
                                    </button>
                                </div>
                            ) : (
                                <Link to="/bejelentkezes" className="hidden sm:flex text-sm font-bold text-gray-600 hover:text-red-600 transition items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    Bejelentkezés
                                </Link>
                            )}
                            
                            {/* Kosár Ikon + számláló */}
                            <Link to="/kosar" className="relative p-2 text-gray-800 hover:text-red-600 transition group">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-red-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center border-2 border-white shadow-sm group-hover:scale-110 transition-transform">
                                    {cartCount}
                                </span>
                            </Link>

                            {/* Hamburger */}
                            <button 
                                className="md:hidden p-2 text-gray-800 hover:text-red-600 focus:outline-none"
                                onClick={() => setIsMobileMenuOpen(true)}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Asztali navigáció és mobil menü – változatlan */}
            <nav className="bg-gray-900 shadow-md hidden md:block">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center space-x-8 h-12 text-sm font-bold uppercase tracking-wider">
                        <Link to="/" className={`${location.pathname === '/' ? 'text-red-500' : 'text-gray-300'} hover:text-white transition`}>Főoldal</Link>
                        <Link to="/szemely" className={`${location.pathname === '/szemely' ? 'text-red-500' : 'text-gray-300'} hover:text-white transition`}>Személyautó</Link>
                        <Link to="/teher" className={`${location.pathname === '/teher' ? 'text-blue-500' : 'text-gray-300'} hover:text-white transition`}>Teherautó</Link>
                        <Link to="/motor" className={`${location.pathname === '/motor' ? 'text-orange-500' : 'text-gray-300'} hover:text-white transition`}>Motorkerékpár</Link>
                        <span className="text-gray-700">|</span>
                        <Link to="/alvazszamkereso" className={`${location.pathname === '/alvazszamkereso' ? 'text-red-500' : 'text-gray-300'} hover:text-white transition`}>Alvázszám</Link>
                        <Link to="/cikkszam" className={`${location.pathname === '/cikkszam' ? 'text-red-500' : 'text-gray-300'} hover:text-white transition`}>Cikkszám</Link>
                        <Link to="/folyadekok" className={`${location.pathname === '/folyadekok' ? 'text-red-500' : 'text-gray-300'} hover:text-white transition`}>Olajok</Link>
                        <Link to="/segitsegkeres" className={`${location.pathname === '/segitsegkeres' ? 'text-red-500' : 'text-gray-300'} hover:text-white transition`}>Ügyfélszolgálat</Link>
                        
                        {user && user.szerepkor === 'admin' && (
                            <Link to="/admin" className="ml-auto text-amber-400 hover:text-amber-300 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                Admin Panel
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* MOBIL MENÜ – változatlan */}
            <div className={`fixed inset-0 z-[60] transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                <div className="absolute inset-0 bg-black bg-opacity-50" onClick={closeMenu}></div>
                <div className={`absolute top-0 left-0 w-72 max-w-[80vw] h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                        <span className="text-xl font-black text-red-600 uppercase">AutoParts</span>
                        <button onClick={closeMenu} className="p-2 text-gray-500 hover:text-gray-800">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto py-4">
                        <div className="flex flex-col space-y-1 px-4">
                            <Link to="/" onClick={closeMenu} className="block px-4 py-3 rounded-lg text-gray-800 hover:bg-gray-100 font-bold">Főoldal</Link>
                            <Link to="/szemely" onClick={closeMenu} className="block px-4 py-3 rounded-lg text-gray-800 hover:bg-gray-100 font-bold">Személyautó</Link>
                            <Link to="/teher" onClick={closeMenu} className="block px-4 py-3 rounded-lg text-gray-800 hover:bg-gray-100 font-bold">Teherautó</Link>
                            <Link to="/motor" onClick={closeMenu} className="block px-4 py-3 rounded-lg text-gray-800 hover:bg-gray-100 font-bold">Motorkerékpár</Link>
                            <div className="border-b border-gray-200 my-2"></div>
                            <Link to="/alvazszamkereso" onClick={closeMenu} className="block px-4 py-3 rounded-lg text-gray-800 hover:bg-gray-100 font-bold">Alvázszám kereső</Link>
                            <Link to="/cikkszam" onClick={closeMenu} className="block px-4 py-3 rounded-lg text-gray-800 hover:bg-gray-100 font-bold">Cikkszám kereső</Link>
                            <Link to="/folyadekok" onClick={closeMenu} className="block px-4 py-3 rounded-lg text-gray-800 hover:bg-gray-100 font-bold">Olajok / Folyadékok</Link>
                            <Link to="/segitsegkeres" onClick={closeMenu} className="block px-4 py-3 rounded-lg text-gray-800 hover:bg-gray-100 font-bold">Ügyfélszolgálat</Link>
                            
                            {user && user.szerepkor === 'admin' && (
                                <Link to="/admin" onClick={closeMenu} className="block px-4 py-3 rounded-lg text-amber-500 hover:bg-gray-100 font-bold">Admin Panel</Link>
                            )}
                        </div>
                    </div>

                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                        {user ? (
                            <div>
                                <div className="px-4 py-2 text-sm text-gray-500">
                                    Bejelentkezve: <strong className="text-gray-800 block">{user.vezeteknev} {user.keresztnev}</strong>
                                </div>
                                <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-lg text-red-600 font-bold hover:bg-red-50">Kijelentkezés</button>
                            </div>
                        ) : (
                            <Link to="/bejelentkezes" onClick={closeMenu} className="block w-full px-4 py-3 rounded-lg text-center bg-red-600 text-white font-bold hover:bg-red-700">Bejelentkezés</Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
