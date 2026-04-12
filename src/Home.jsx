import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export const Home = () => {
    // Állapotok (State)
    const [user, setUser] = useState(null);
    const [cartCount, setCartCount] = useState(0);
    const [isFetchPending, setFetchPending] = useState(false);

    const API_URL = 'http://localhost:5000/api';

    useEffect(() => {
        // 1. Felhasználó betöltése a localStorage-ból
        const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
        setUser(savedUser);

        // 2. Kosár tartalmának lekérése axios-szal
        if (savedUser && savedUser.id) {
            setFetchPending(true);
            axios.get(`${API_URL}/cart`, {
                params: {
                    action: 'get',
                    user_id: savedUser.id
                }
            })
            .then((response) => {
                if (response.data.success && response.data.items) {
                    let count = 0;
                    response.data.items.forEach(item => count += parseInt(item.mennyiseg));
                    setCartCount(count);
                }
            })
            .catch((error) => {
                console.error("Hiba a kosár lekérésekor:", error);
                setCartCount(0);
            })
            .finally(() => setFetchPending(false));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setCartCount(0);
        // Ha szükséges az oldal teljes újratöltése:
        window.location.reload();
    };

    return (
        <div className="home-container">
            {/* HERO SECTION */}
            <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-10 md:py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-3 md:mb-4">
                        Autóalkatrészek a Legjobb Árakon
                    </h1>
                    <p className="text-gray-300 text-sm sm:text-base md:text-lg mb-6 md:mb-8">
                        BMW, Audi, Mercedes alkatrészek - Teherautók - Motorkerékpárok
                    </p>
                    <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4">
                        <Link to="/szemely" className="bg-red-600 hover:bg-red-700 px-6 sm:px-8 py-3 rounded-lg font-bold transition text-sm sm:text-base shadow-lg">Személyautó alkatrészek</Link>
                        <Link to="/teher" className="bg-white text-gray-900 hover:bg-gray-100 px-6 sm:px-8 py-3 rounded-lg font-bold transition text-sm sm:text-base shadow-lg">Teherautó alkatrészek</Link>
                        <Link to="/motor" className="border-2 border-white hover:bg-white hover:text-gray-900 px-6 sm:px-8 py-3 rounded-lg font-bold transition text-sm sm:text-base">Motorkerékpár</Link>
                    </div>
                </div>
            </section>

            {/* BRANDS SECTION (Statikus szövegként) */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-black text-center mb-10 text-gray-900 uppercase tracking-tight">Kiemelt márkáink</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="bg-white p-8 rounded-2xl shadow-sm text-center border border-gray-100">
                            <div className="text-4xl font-black text-blue-600 mb-3">BMW</div>
                            <p className="text-gray-500 text-sm font-medium">1-es, 3-as, 5-ös, X3, X5</p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm text-center border border-gray-100">
                            <div className="text-4xl font-black text-gray-800 mb-3">Audi</div>
                            <p className="text-gray-500 text-sm font-medium">A3, A4, A6, Q5, Q7</p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl shadow-sm text-center border border-gray-100">
                            <div className="text-4xl font-black text-gray-700 mb-3">Mercedes</div>
                            <p className="text-gray-500 text-sm font-medium">A, C, E, GLA, GLC, GLE</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES / TRUST SECTION */}
            <section className="py-16 bg-gray-50 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-black text-center mb-12 text-gray-900 uppercase tracking-tight">Miért válassz minket?</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* 1. Gyors szállítás */}
                        <div className="text-center bg-white p-6 rounded-2xl shadow-sm">
                            <div className="bg-red-50 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 mb-2">Villámgyors szállítás</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">Raktáron lévő termékeinket akár 24 órán belül kiszállítjuk az ország egész területén.</p>
                        </div>

                        {/* 2. Garancia */}
                        <div className="text-center bg-white p-6 rounded-2xl shadow-sm">
                            <div className="bg-red-50 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 mb-2">Prémium Garancia</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">Minden általunk forgalmazott alkatrészre minimum 1 év teljes körű cseregaranciát vállalunk.</p>
                        </div>

                        {/* 3. Szakértő segítség */}
                        <div className="text-center bg-white p-6 rounded-2xl shadow-sm">
                            <div className="bg-red-50 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 mb-2">Szakértő csapat</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">Nem vagy biztos a dolgodban? Ügyfélszolgálatunk segít kiválasztani a tökéletes alkatrészt autódhoz.</p>
                        </div>

                        {/* 4. Visszavét */}
                        <div className="text-center bg-white p-6 rounded-2xl shadow-sm">
                            <div className="bg-red-50 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                </svg>
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 mb-2">14 napos visszavét</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">Téves rendelés? Semmi gond! Kérdés nélkül visszavesszük a sértetlen alkatrészt 14 napon belül.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
