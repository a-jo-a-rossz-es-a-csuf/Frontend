import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Kosar = () => {
    const API_URL = 'http://localhost:5000/api';
    const SZALLITASI_DIJ = 1490;

    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [eredetiTotal, setEredetiTotal] = useState(0);
    const [isFirstPurchase, setIsFirstPurchase] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    const [isCheckout, setIsCheckout] = useState(false);

    const [formData, setFormData] = useState({
        vezeteknev: '',
        keresztnev: '',
        email: '',
        telefon: '',
        iranyitoszam: '',
        varos: '',
        utca: '',
        kartyaszam: '',
        lejarat: '',
        cvc: ''
    });

    const [fizetesiMod, setFizetesiMod] = useState('utanvet');
    const [errors, setErrors] = useState({});

    // === LOCALSTORAGE TAKARÍTÁS ===
    const cleanOldDiscountFlag = (savedUser) => {
        // már nem szükséges, mivel az ElsoVasarolasKedvezmeny helyes az adatbázisban
        return savedUser;
    };

    const fetchCart = async (userId) => {
        try {
            // Lekérjük az összes terméket és olajt, hogy tudjuk a neveket és árakat
            const [cartRes, productsRes, olajokRes] = await Promise.all([
                axios.get(`${API_URL}/cart`),
                axios.get(`${API_URL}/products`),
                axios.get(`${API_URL}/olajok`)
            ]);
            
            const allProducts = productsRes.data || [];
            const allOlajok = olajokRes.data || [];
            const allCartItems = cartRes.data || [];
            
            const rawUserItems = allCartItems.filter(item => (item.userId || item.UserId) === userId);
            
            const userItems = rawUserItems.map(item => {
                const alkatreszId = item.alkatreszId || item.AlkatreszId;
                const olajId = item.olajId || item.OlajId;
                const mennyiseg = item.mennyiseg || item.Mennyiseg || 1;
                
                let termek = null;
                let ar = 0;
                
                // Ha alkatrészről van szó
                if (alkatreszId && alkatreszId > 0) {
                    termek = allProducts.find(p => (p.id || p.Id) === alkatreszId);
                    if (termek) {
                        ar = termek.ar || termek.Ar || 0;
                    }
                }
                // Ha olajról van szó
                else if (olajId && olajId > 0) {
                    termek = allOlajok.find(o => (o.id || o.Id) === olajId);
                    if (termek) {
                        ar = termek.ar || termek.Ar || 0;
                    }
                }
                
                return {
                    id: item.id || item.Id,
                    userId: item.userId || item.UserId,
                    alkatreszId: alkatreszId,
                    olajId: olajId,
                    mennyiseg: mennyiseg,
                    hozzaadva: item.hozzaadva || item.Hozzaadva,
                    nev: termek ? (termek.nev || termek.Nev) : `Ismeretlen termék #${alkatreszId || olajId}`,
                    gyarto: termek ? (termek.gyarto || termek.Gyarto || '-') : '-',
                    cikkszam: termek ? (termek.cikkszam || termek.Cikkszam || '-') : '-',
                    ar: ar,
                    osszeg: mennyiseg * ar
                };
            });
            
            setCartItems(userItems);
            
            // Kiszámolás:
            let calcTotal = 0;
            userItems.forEach(i => {
              calcTotal += i.osszeg; 
            });
            
            setTotal(calcTotal);
            setEredetiTotal(calcTotal);
            // Az isFirstPurchase az usuario elsoVasarolasKedvezmeny flag-je alapján (backend)
            const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
            const isFirstPurchaseValue = savedUser?.elsoVasarolasKedvezmeny === true;
            setIsFirstPurchase(isFirstPurchaseValue); 
        } catch (err) {
            console.error("Hiba a kosár lekérésekor:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let savedUser = JSON.parse(localStorage.getItem('user') || 'null');
        
        savedUser = cleanOldDiscountFlag(savedUser);
        setUser(savedUser);

        if (savedUser?.id) {
            setFormData(prev => ({
                ...prev,
                vezeteknev: savedUser.vezeteknev || '',
                keresztnev: savedUser.keresztnev || '',
                email: savedUser.email || ''
            }));
            fetchCart(savedUser.id);
        } else {
            setLoading(false);
        }

        const handleStorageChange = () => {
            let updatedUser = JSON.parse(localStorage.getItem('user') || 'null');
            updatedUser = cleanOldDiscountFlag(updatedUser);
            setUser(updatedUser);
            if (updatedUser?.id) fetchCart(updatedUser.id);
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const updateQuantity = async (cartId, currentQty, change) => {
        const newQty = currentQty + change;
        if (newQty < 1) return;
        try {
            // Megkeressük az adott cart itemet a state-nkből, hogy tudjuk az adatait a PUT-hoz
            const item = cartItems.find(i => i.id === cartId);
            if (!item) return;

            const res = await axios.put(`${API_URL}/cart/${cartId}`, {
                userId: user.id,
                alkatreszId: item.alkatreszId,
                olajId: item.olajId,
                mennyiseg: newQty
            });
            if (res.status === 200) {
                fetchCart(user.id);
                window.dispatchEvent(new Event('storage'));
                window.dispatchEvent(new Event('cartUpdated'));
            }
        } catch (err) { console.error(err); }
    };

    const removeItem = async (cartId) => {
        try {
            const res = await axios.delete(`${API_URL}/cart/${cartId}`);
            if (res.status === 200) {
                fetchCart(user.id);
                window.dispatchEvent(new Event('storage'));
                window.dispatchEvent(new Event('cartUpdated'));
            }
        } catch (err) { console.error(err); }
    };

    const handleInputChange = (e) => {
        let { name, value } = e.target;

        if (name === 'kartyaszam') {
            value = value.replace(/\D/g, '').substring(0, 16);
            value = value.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
        } else if (name === 'lejarat') {
            value = value.replace(/\D/g, '').substring(0, 4);
            if (value.length > 2) value = `${value.substring(0, 2)}/${value.substring(2, 4)}`;
        } else if (name === 'cvc') {
            value = value.replace(/\D/g, '').substring(0, 3);
        }

        setFormData({ ...formData, [name]: value });

        if (errors[name]) setErrors({ ...errors, [name]: null });
    };

    const handleFizetesiModChange = (mod) => {
        setFizetesiMod(mod);
        if (mod === 'utanvet') {
            const newErrors = { ...errors };
            delete newErrors.kartyaszam;
            delete newErrors.lejarat;
            delete newErrors.cvc;
            setErrors(newErrors);
        }
    };

    const validateForm = () => {
        let newErrors = {};

        if (!formData.vezeteknev.trim()) newErrors.vezeteknev = 'Kötelező mező';
        if (!formData.keresztnev.trim()) newErrors.keresztnev = 'Kötelező mező';

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) newErrors.email = 'Érvénytelen e-mail cím';

        const phoneRegex = /^(\+36|06)[\s\-]?\d{1,2}[\s\-]?\d{3}[\s\-]?\d{3,4}$/;
        if (!phoneRegex.test(formData.telefon)) newErrors.telefon = 'Formátum: +36 30 123 4567';

        if (!/^\d{4}$/.test(formData.iranyitoszam)) newErrors.iranyitoszam = 'Pontosan 4 számjegy';
        if (!formData.varos.trim()) newErrors.varos = 'Kötelező mező';
        if (!formData.utca.trim()) newErrors.utca = 'Kötelező mező';

        if (fizetesiMod === 'kartya') {
            const cleanCard = formData.kartyaszam.replace(/\s/g, '');
            if (cleanCard.length !== 16) newErrors.kartyaszam = 'A kártyaszámnak pontosan 16 számjegyből kell állnia!';
            const expRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
            if (!expRegex.test(formData.lejarat)) {
                newErrors.lejarat = 'Érvénytelen formátum (HH/ÉÉ)';
            } else {
                const [month, year] = formData.lejarat.split('/');
                const expiryDate = new Date(`20${year}`, parseInt(month) - 1);
                const today = new Date();
                if (expiryDate < new Date(today.getFullYear(), today.getMonth(), 1)) {
                    newErrors.lejarat = 'Ez a bankkártya már lejárt!';
                }
            }
            if (formData.cvc.length !== 3) newErrors.cvc = 'Pontosan 3 számjegy szükséges!';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleOrderSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        // Kedvezmény kalkuláció az orderData-hoz szükséges
        const kedvezmenyOsszege = isFirstPurchase ? Math.round(eredetiTotal * 0.15) : 0;
        const fizetendoVegosszeg = total + SZALLITASI_DIJ - kedvezmenyOsszege;

        // 1. Generálunk egy egyedi rendelésszámot az aktuális időbélyeg alapján
        const generaltRendelesSzam = "R-" + Date.now();

        // Biztos ami biztos, számként kezeljük a mezőket
        const tisztaOsszeg = Number(String(total).replace(/[^0-9]/g, ''));
        const tisztaVegosszeg = Number(String(fizetendoVegosszeg).replace(/[^0-9]/g, ''));

        // C# API-hoz igazított DTO, szigorúan PascalCase propertykkel, ahogy az EF modell várja
        const orderData = {
            RendelesSzam: generaltRendelesSzam,
            UserId: parseInt(user.id),
            Nev: `${formData.vezeteknev} ${formData.keresztnev}`.trim(),
            Email: formData.email,
            Telefon: formData.telefon,
            Iranyitoszam: formData.iranyitoszam,
            Varos: formData.varos,
            Utca: formData.utca,
            Hazszam: '',
            Megjegyzes: '',
            FizetesiMod: fizetesiMod,
            Osszeg: tisztaOsszeg,
            SzallitasiDij: SZALLITASI_DIJ,
            Vegosszeg: Number(String(fizetendoVegosszeg).replace(/[^0-9]/g, '')),
            Statusz: "fuggoben"
        };

        // Tételek konvertálása a backend DTO formátumára
        const tetelek = cartItems.map(item => ({
            AlkatreszId: item.alkatreszId && item.alkatreszId > 0 ? item.alkatreszId : null,
            OlajId: item.olajId && item.olajId > 0 ? item.olajId : null,
            TermekNev: item.nev,
            Mennyiseg: item.mennyiseg,
            Egysegar: item.ar,
            Osszeg: item.osszeg
        }));

        // Az OrderWithItemsDto objektum, amit a backend vár
        const requestData = {
            Order: orderData,
            Tetelek: tetelek
        };

        try {
            const res = await axios.post(`${API_URL}/orders`, requestData);

            if (res.status === 200 || res.status === 201 || (res.data && res.data.success)) {

                // === JAVÍTÁS: KOSÁR ÜRÍTÉSE SIKERES RENDELÉS UTÁN ===
                try {
                    // Töröljük az összes user által birtokolt kosár tételt
                    for (const item of cartItems) {
                        await axios.delete(`${API_URL}/cart/${item.id}`);
                    }
                } catch (clearErr) {
                    console.error("Nem sikerült törölni a kosarat az adatbázisból:", clearErr);
                }

                // Helyi state-ek nullázása a biztonság kedvéért
                setCartItems([]);
                setTotal(0);
                setEredetiTotal(0);
                // ====================================================

                // Az usuario elsoVasarolasKedvezmeny flag-ét false-ra állítjuk, mivel már felhasználta az első vásárlás kedvezményt
                const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
                if (savedUser && savedUser.id) {
                    const updatedUser = { 
                        ...savedUser, 
                        elsoVasarolasKedvezmeny: false,  // Backend már módosította, de szinkronba hozzuk a frontendot is
                        hasOrders: true 
                    };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                }

                window.dispatchEvent(new Event('storage'));
                alert(`Sikeres rendelés! Rendelésszám: ${res.data.rendeles_szam || generaltRendelesSzam}`);
                window.location.href = '/';
            } else {
                alert(`Hiba történt: ${res.data.error || 'Ismeretlen hiba'}`);
            }
        } catch (err) {
            console.error("Hiba a beküldéskor:", err.response?.data || err);
            
            // Jelenítsük meg a pontos backend hibát is, ha van
            const backendHiba = err.response?.data?.title || err.response?.data || "Ismeretlen hiba";
            alert(`Váratlan hiba történt a rendelés elküldésekor:\n${JSON.stringify(backendHiba)}`);
        }
    };

    if (loading) return <div className="p-20 text-center font-bold text-gray-500">Adatok betöltése...</div>;

    if (!user) return (
        <div className="max-w-3xl mx-auto p-6 mt-10 text-center bg-white rounded-3xl border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-black text-gray-900 mb-2">Hoppá!</h2>
            <p className="text-gray-500 font-medium">A kosár megtekintéséhez be kell jelentkezned.</p>
        </div>
    );

    const kedvezmenyOsszege = isFirstPurchase ? Math.round(eredetiTotal * 0.15) : 0;
    const fizetendoVegosszeg = total + SZALLITASI_DIJ - kedvezmenyOsszege;

    return (
        <div className="max-w-6xl mx-auto p-6 text-gray-900">
            <div className="mb-10 flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">
                        {isCheckout ? 'Pénztár' : 'Kosaram'}
                    </h2>
                    <div className="h-2 w-24 bg-yellow-500 rounded-full"></div>
                </div>
                {isCheckout && (
                    <button
                        onClick={() => setIsCheckout(false)}
                        className="text-sm font-bold text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Vissza a kosárhoz
                    </button>
                )}
            </div>

            {cartItems.length === 0 ? (
                <div className="bg-white p-16 rounded-3xl text-center border border-gray-200 shadow-sm">
                    <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-xl text-gray-500 font-bold mb-6">A kosarad jelenleg üres.</p>
                    <a href="/folyadekok" className="bg-yellow-500 text-gray-900 px-8 py-3 rounded-xl font-bold hover:bg-yellow-400 transition-all shadow-md inline-block">
                        Vásárlás folytatása
                    </a>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-8">

                    <div className="flex-grow space-y-4">
                        {!isCheckout ? (
                            cartItems.map((item) => (
                                <div key={item.id} className="flex flex-col sm:flex-row items-center bg-white p-4 rounded-3xl border border-gray-200 shadow-sm gap-4 hover:shadow-md transition-shadow">
                                    <div className="flex-grow text-center sm:text-left">
                                        <span className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest">{item.gyarto}</span>
                                        <h3 className="font-bold leading-tight">{item.nev}</h3>
                                        <p className="text-xs text-gray-500 mt-1">Cikkszám: {item.cikkszam}</p>
                                    </div>
                                    <div className="flex items-center bg-white rounded-xl p-1 border border-gray-200">
                                        <button onClick={() => updateQuantity(item.id, item.mennyiseg, -1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-bold">-</button>
                                        <span className="w-10 text-center font-black">{item.mennyiseg}</span>
                                        <button onClick={() => updateQuantity(item.id, item.mennyiseg, 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-bold">+</button>
                                    </div>
                                    <div className="flex items-center gap-6 sm:ml-4">
                                        <div className="text-right">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Összesen</p>
                                            <p className="text-lg font-black">{Number(item.osszeg).toLocaleString('hu-HU')} Ft</p>
                                        </div>
                                        <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors p-2" title="Termék törlése">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <form id="checkout-form" onSubmit={handleOrderSubmit} className="space-y-6">
                                <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
                                    <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                                        <span className="bg-yellow-500 text-gray-900 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                                        Szállítási adatok
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Vezetéknév</label>
                                            <input type="text" name="vezeteknev" value={formData.vezeteknev} onChange={handleInputChange} className={`w-full p-3 bg-white border ${errors.vezeteknev ? 'border-red-500' : 'border-gray-200'} rounded-xl outline-none focus:border-yellow-500 transition-all`} />
                                            {errors.vezeteknev && <p className="text-red-500 text-xs mt-1 ml-1">{errors.vezeteknev}</p>}
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Keresztnév</label>
                                            <input type="text" name="keresztnev" value={formData.keresztnev} onChange={handleInputChange} className={`w-full p-3 bg-white border ${errors.keresztnev ? 'border-red-500' : 'border-gray-200'} rounded-xl outline-none focus:border-yellow-500 transition-all`} />
                                            {errors.keresztnev && <p className="text-red-500 text-xs mt-1 ml-1">{errors.keresztnev}</p>}
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">E-mail cím</label>
                                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={`w-full p-3 bg-white border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-xl outline-none focus:border-yellow-500 transition-all`} />
                                            {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Telefonszám</label>
                                            <input type="tel" name="telefon" value={formData.telefon} onChange={handleInputChange} placeholder="+36 30 123 4567" className={`w-full p-3 bg-white border ${errors.telefon ? 'border-red-500' : 'border-gray-200'} rounded-xl outline-none focus:border-yellow-500 transition-all`} />
                                            {errors.telefon && <p className="text-red-500 text-xs mt-1 ml-1">{errors.telefon}</p>}
                                        </div>
                                        <div className="md:col-span-2 grid grid-cols-3 gap-4">
                                            <div className="col-span-1">
                                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Irányítószám</label>
                                                <input type="text" name="iranyitoszam" value={formData.iranyitoszam} onChange={handleInputChange} className={`w-full p-3 bg-white border ${errors.iranyitoszam ? 'border-red-500' : 'border-gray-200'} rounded-xl outline-none focus:border-yellow-500 transition-all`} />
                                                {errors.iranyitoszam && <p className="text-red-500 text-xs mt-1 ml-1">{errors.iranyitoszam}</p>}
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Település</label>
                                                <input type="text" name="varos" value={formData.varos} onChange={handleInputChange} className={`w-full p-3 bg-white border ${errors.varos ? 'border-red-500' : 'border-gray-200'} rounded-xl outline-none focus:border-yellow-500 transition-all`} />
                                                {errors.varos && <p className="text-red-500 text-xs mt-1 ml-1">{errors.varos}</p>}
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Utca, házszám, emelet</label>
                                            <input type="text" name="utca" value={formData.utca} onChange={handleInputChange} className={`w-full p-3 bg-white border ${errors.utca ? 'border-red-500' : 'border-gray-200'} rounded-xl outline-none focus:border-yellow-500 transition-all`} />
                                            {errors.utca && <p className="text-red-500 text-xs mt-1 ml-1">{errors.utca}</p>}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
                                    <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                                        <span className="bg-yellow-500 text-gray-900 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                                        Fizetési mód
                                    </h3>
                                    <div className="space-y-4">
                                        <label className={`flex items-center p-4 border rounded-2xl cursor-pointer transition-all ${fizetesiMod === 'utanvet' ? 'border-yellow-500 bg-white shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                                            <input type="radio" name="fizetes" value="utanvet" checked={fizetesiMod === 'utanvet'} onChange={() => handleFizetesiModChange('utanvet')} className="w-5 h-5 text-yellow-500" />
                                            <div className="ml-4">
                                                <span className="block font-bold">Utánvét (Fizetés a futárnál)</span>
                                                <span className="block text-sm text-gray-500">Készpénzzel vagy bankkártyával az átvételkor.</span>
                                            </div>
                                        </label>
                                        <label className={`flex items-center p-4 border rounded-2xl cursor-pointer transition-all ${fizetesiMod === 'kartya' ? 'border-yellow-500 bg-white shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                                            <input type="radio" name="fizetes" value="kartya" checked={fizetesiMod === 'kartya'} onChange={() => handleFizetesiModChange('kartya')} className="w-5 h-5 text-yellow-500" />
                                            <div className="ml-4">
                                                <span className="block font-bold">Online Bankkártya</span>
                                                <span className="block text-sm text-gray-500">Biztonságos teszt fizetési felület.</span>
                                            </div>
                                        </label>

                                        {fizetesiMod === 'kartya' && (
                                            <div className="mt-4 p-6 bg-white border border-gray-200 rounded-2xl">
                                                <p className="text-xs text-gray-500 mb-4 font-bold uppercase tracking-widest">Kártyaadatok (Teszt)</p>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Kártyaszám</label>
                                                        <input type="text" name="kartyaszam" value={formData.kartyaszam} onChange={handleInputChange} placeholder="0000 0000 0000 0000" maxLength="19" className={`w-full p-3 bg-white border ${errors.kartyaszam ? 'border-red-500' : 'border-gray-200'} rounded-xl outline-none focus:border-yellow-500`} />
                                                        {errors.kartyaszam && <p className="text-red-500 text-xs mt-1 ml-1">{errors.kartyaszam}</p>}
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Lejárat (HH/ÉÉ)</label>
                                                            <input type="text" name="lejarat" value={formData.lejarat} onChange={handleInputChange} placeholder="12/25" maxLength="5" className={`w-full p-3 bg-white border ${errors.lejarat ? 'border-red-500' : 'border-gray-200'} rounded-xl outline-none focus:border-yellow-500`} />
                                                            {errors.lejarat && <p className="text-red-500 text-xs mt-1 ml-1">{errors.lejarat}</p>}
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">CVC</label>
                                                            <input type="text" name="cvc" value={formData.cvc} onChange={handleInputChange} placeholder="123" maxLength="3" className={`w-full p-3 bg-white border ${errors.cvc ? 'border-red-500' : 'border-gray-200'} rounded-xl outline-none focus:border-yellow-500`} />
                                                            {errors.cvc && <p className="text-red-500 text-xs mt-1 ml-1">{errors.cvc}</p>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>

                    <div className="w-full lg:w-80 flex-shrink-0">
                        <div className="bg-white border border-gray-200 rounded-3xl p-6 sticky top-6 shadow-sm">
                            <h3 className="text-xl font-black mb-6 border-b border-gray-200 pb-4 text-gray-900">
                                {isCheckout ? 'Rendelés áttekintése' : 'Összesítés'}
                            </h3>

                            {isCheckout && (
                                <div className="space-y-3 mb-6 max-h-48 overflow-y-auto pr-2 text-sm">
                                    {cartItems.map(item => (
                                        <div key={item.id} className="flex justify-between">
                                            <span className="text-gray-500 truncate mr-2">{item.mennyiseg}x {item.nev}</span>
                                            <span className="font-bold flex-shrink-0">{Number(item.osszeg).toLocaleString('hu-HU')} Ft</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-between items-center mb-4 text-gray-600">
                                <span>Részösszeg:</span>
                                <span className={isFirstPurchase ? "line-through text-gray-400" : ""}>
                                    {Number(eredetiTotal).toLocaleString('hu-HU')} Ft
                                </span>
                            </div>

                            {isFirstPurchase && (
                                <div className="flex justify-between items-center mb-4 text-green-600 font-bold">
                                    <span>Új vásárlói kedvezmény (15%):</span>
                                    <span>-{Number(kedvezmenyOsszege).toLocaleString('hu-HU')} Ft</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center mb-6 text-gray-600">
                                <span>Szállítás:</span>
                                <span className="font-bold">{Number(SZALLITASI_DIJ).toLocaleString('hu-HU')} Ft</span>
                            </div>

                            <div className="flex justify-between items-center mb-8 border-t border-gray-200 pt-4">
                                <span className="font-bold text-lg">Fizetendő:</span>
                                <span className="text-2xl font-black text-gray-900">{Number(fizetendoVegosszeg).toLocaleString('hu-HU')} Ft</span>
                            </div>

                            {!isCheckout ? (
                                <button
                                    onClick={() => setIsCheckout(true)}
                                    className="w-full bg-yellow-500 text-gray-900 font-black py-4 rounded-xl hover:bg-yellow-400 transition-all shadow-sm active:scale-95"
                                >
                                    Tovább a pénztárba
                                </button>
                            ) : (
                                <div>
                                    <button
                                        form="checkout-form"
                                        type="submit"
                                        className="w-full bg-yellow-500 text-gray-900 font-black py-4 rounded-xl hover:bg-yellow-400 transition-all shadow-sm active:scale-95"
                                    >
                                        {fizetesiMod === 'kartya' ? `Fizetés ${Number(fizetendoVegosszeg).toLocaleString('hu-HU')} Ft` : 'Rendelés leadása'}
                                    </button>
                                    <p className="text-center text-[10px] text-gray-400 mt-4">A gomb megnyomásával elfogadod az <a href="/aszf" className="text-blue-500 hover:underline">ÁSZF</a>-et.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Kosar;
