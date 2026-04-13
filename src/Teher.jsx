import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Kliens oldali (Mock) adatbázis a valós autoalkatresz_db.sql alapján (Teherautók)
const TRUCK_DATA_DICTIONARY = {
    brands: {
        4: 'MAN',
        5: 'Scania'
    },
    models: {
        52: { nev: 'TGX 1. gen', gen: '1. gen', marka_id: 4 },
        53: { nev: 'TGX 2. gen', gen: '2. gen', marka_id: 4 },
        54: { nev: 'TGS 1. gen', gen: '1. gen', marka_id: 4 },
        55: { nev: 'TGS 2. gen', gen: '2. gen', marka_id: 4 },
        56: { nev: 'TGM', gen: '', marka_id: 4 },
        57: { nev: 'TGL', gen: '', marka_id: 4 },
        58: { nev: 'R-series R', gen: 'R', marka_id: 5 },
        59: { nev: 'R-series New R', gen: 'New R', marka_id: 5 },
        60: { nev: 'S-series', gen: '', marka_id: 5 },
        61: { nev: 'G-series', gen: '', marka_id: 5 },
        62: { nev: 'P-series', gen: '', marka_id: 5 },
        63: { nev: 'L-series', gen: '', marka_id: 5 }
    },
    motors: {
        22: { kod: 'D2676', ccm: 12419, le: 440, modell_id: 52 },
        23: { kod: 'D2676', ccm: 12419, le: 480, modell_id: 52 },
        24: { kod: 'D2676', ccm: 12419, le: 510, modell_id: 53 },
        25: { kod: 'DC13', ccm: 12700, le: 450, modell_id: 58 },
        26: { kod: 'DC13', ccm: 12700, le: 500, modell_id: 59 },
        27: { kod: 'DC16', ccm: 16400, le: 580, modell_id: 59 }
    }
};

const _generateYearsForTruckModel = (modelId) => {
    // Alapértelmezett évek, ha valami nem stimmel
    const defaultYears = ['2025', '2024', '2023', '2022', '2021', '2020'];
    const modelMap = {
        52: { tol: 2007, ig: 2020 },
        53: { tol: 2020, ig: 2025 },
        54: { tol: 2007, ig: 2020 },
        55: { tol: 2020, ig: 2025 },
        56: { tol: 2007, ig: 2025 },
        57: { tol: 2005, ig: 2025 },
        58: { tol: 2004, ig: 2016 },
        59: { tol: 2016, ig: 2025 },
        60: { tol: 2016, ig: 2025 },
        61: { tol: 2009, ig: 2025 },
        62: { tol: 2004, ig: 2025 },
        63: { tol: 2018, ig: 2025 },
    };
    if (modelMap[modelId]) {
        const { tol, ig } = modelMap[modelId];
        const res = [];
        let currentYear = new Date().getFullYear();
        let endYear = ig > currentYear ? currentYear : ig;

        for (let i = endYear; i >= tol; i--) {
            res.push(i.toString());
        }
        return res;
    }
    return defaultYears;
};

const Teher = () => {
    const API_URL = 'http://localhost:5000/api';

    // Modell ID → Alkatrészek kódja mapping
    const TRUCK_MODEL_CODES = {
        52: "TGX", // TGX 1. gen
        53: "TGX", // TGX 2. gen
        54: "TGS", // TGS 1. gen
        55: "TGS", // TGS 2. gen
        56: "TGM", // TGM
        57: "TGL", // TGL
        58: "R",   // R-series R
        59: "R",   // R-series New R
        60: "S",   // S-series
        61: "G",   // G-series
        62: "P",   // P-series
        63: "L"    // L-series
    };

    // --- Választási állapotok ---
    const [selections, setSelections] = useState({
        brand: '',
        model: '',
        year: '',
        motor: ''
    });

    // --- Adatlisták tárolása ---
    const [lists, setLists] = useState({
        brands: [],
        models: [],
        years: [],
        motors: []
    });

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);

    // Kezdeti betöltés
    useEffect(() => {
        const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
        setUser(savedUser);
        
        // --- FRONTEND GENERÁLÁS (Teherautókhoz) ---
        const availableBrands = Object.entries(TRUCK_DATA_DICTIONARY.brands).map(([id, name]) => ({
             id, nev: name
        }));
        setLists(prev => ({ ...prev, brands: availableBrands }));
    }, []);

    // Ha a márka változik
    useEffect(() => {
        if (selections.brand) {
            const brandModels = Object.entries(TRUCK_DATA_DICTIONARY.models)
                .filter(([id, data]) => data.marka_id.toString() === selections.brand)
                .map(([id, data]) => ({ id, nev: data.nev }));

            setLists(prev => ({ ...prev, models: brandModels, years: [], motors: [] }));
            setSelections(prev => ({ ...prev, model: '', year: '', motor: '' }));
        }
    }, [selections.brand]);

    // Ha a modell változik
    useEffect(() => {
        if (selections.model) {
            const modelMotors = Object.entries(TRUCK_DATA_DICTIONARY.motors)
                .filter(([id, data]) => data.modell_id.toString() === selections.model);
            
            setLists(prev => ({ 
                ...prev, 
                years: _generateYearsForTruckModel(parseInt(selections.model)),
                motors: modelMotors.map(([id, data]) => ({ 
                    id, 
                    kod: data.kod, 
                    ccm: data.ccm, 
                    le: data.le 
                }))
            }));

            setSelections(prev => ({ ...prev, year: '', motor: '' }));
        }
    }, [selections.model]);

    // Termék keresés
    const handleSearch = async () => {
        if (!selections.model) return alert('Kérjük, válasszon ki egy modellt!');

        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/products`);

            if (res.status === 200) {
                const safeProducts = res.data || [];
                
                // Szűrés 1: Teherautók kategória ID-ja 14
                let filtered = safeProducts.filter(p => (p.kategoriaId || p.KategoriaId) === 14);
                
                // Szűrés 2: Modell alapján a cikkszámban keresünk
                const selectedModelId = parseInt(selections.model);
                const modelCode = TRUCK_MODEL_CODES[selectedModelId];
                
                if (modelCode) {
                    filtered = filtered.filter(p => {
                        const cikkszam = String(p.cikkszam || p.Cikkszam || '');
                        // Az alkatrészek formátuma: "MAN-TGX-FB01" vagy "SCAN-R-FB01"
                        // Split by "-" és az 2. elem ellenőrzése
                        const parts = cikkszam.split('-');
                        return parts.length >= 2 && parts[1] === modelCode;
                    });
                }
                
                setProducts(filtered);
            } else {
                setProducts([]);
            }
            
        } catch (err) {
            console.error("Keresési hiba:", err);
            setProducts([]);
            alert('Hiba történt az adatok lekérésekor.');
        } finally {
            setLoading(false);
        }
    };

    // JAVÍTOTT KOSÁRBA TÉTEL (Backend DTO-hoz igazítva)
    const addToCart = async (productId) => {
        if (!user || !user.id) return alert('A vásárláshoz be kell jelentkeznie!');
        
        try {
            const payload = {
                userId: parseInt(user.id),
                alkatreszId: parseInt(productId),
                olajId: null,
                mennyiseg: 1
            };

            const res = await axios.post(`${API_URL}/cart`, payload);
            
            if (res.status === 200 || res.status === 201) {
                alert('Termék a kosárba került!');
                window.dispatchEvent(new Event('cartUpdated'));
            } else {
                alert('Hiba történt a kosárba tételkor.');
            }
        } catch (err) {
            console.error("Hiba kosárba rakáskor:", err.response?.data || err);
            alert('Hiba történt a kosárba tételkor. Ellenőrizd a konzolt!');
        }
    };

    const getImageUrl = (product) => {
        const path = product.kepUrl || product.kep_url || product.KepUrl;
        if (!path) return "https://placehold.co/400x300?text=Nincs+Kép";
        
        const fileName = String(path).trim().split(/[/\\]/).pop();
        return `/images/parts/${fileName}`;
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <section className="bg-white border-b py-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                            Tehergépjármű Alkatrészek
                        </h1>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase px-1">Márka</label>
                            <select 
                                value={selections.brand}
                                onChange={(e) => setSelections({...selections, brand: e.target.value})}
                                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none transition"
                            >
                                <option value="">Összes márka</option>
                                {lists.brands?.map((b) => <option key={b.id} value={b.id}>{b.nev}</option>)}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase px-1">Modell</label>
                            <select 
                                disabled={!selections.brand}
                                value={selections.model}
                                onChange={(e) => setSelections({...selections, model: e.target.value})}
                                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none disabled:opacity-50 transition"
                            >
                                <option value="">Válasszon modellt</option>
                                {lists.models?.map((m) => <option key={m.id} value={m.id}>{m.nev}</option>)}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase px-1">Évjárat</label>
                            <select 
                                disabled={!selections.model}
                                value={selections.year}
                                onChange={(e) => setSelections({...selections, year: e.target.value})}
                                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none disabled:opacity-50 transition"
                            >
                                <option value="">Bármely évjárat</option>
                                {lists.years?.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase px-1">Motor</label>
                            <select 
                                disabled={!selections.model}
                                value={selections.motor}
                                onChange={(e) => setSelections({...selections, motor: e.target.value})}
                                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none disabled:opacity-50 transition"
                            >
                                <option value="">Összes motortípus</option>
                                {lists.motors?.map(m => (
                                    <option key={m.id} value={m.id}>
                                        {m.kod} - {m.ccm}ccm ({m.le}LE)
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-center">
                        <button 
                            onClick={handleSearch}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
                        >
                            ALKATRÉSZEK KERESÉSE
                        </button>
                    </div>
                </div>
            </section>

            <main className="max-w-7xl mx-auto px-4 py-12">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products?.length > 0 ? (
                            products.map(product => (
                                <div key={product.id || product.Id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group">
                                    <div className="relative h-48 bg-gray-100 overflow-hidden flex items-center justify-center">
                                        <img 
                                            src={getImageUrl(product)} 
                                            alt={product.nev || product.Nev} 
                                            onError={(e) => { 
                                                e.target.onerror = null; 
                                                e.target.src = "https://placehold.co/400x300?text=Kép+Hiba"; 
                                            }}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md">
                                            {product.cikkszam || product.Cikkszam}
                                        </div>
                                    </div>
                                    <div className="p-5 flex-grow flex flex-col">
                                        <h3 className="font-bold text-gray-900 mb-2 h-12 line-clamp-2">{product.nev || product.Nev}</h3>
                                        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{product.leiras || product.Leiras}</p>
                                        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                                            <span className="text-xl font-black text-gray-900">
                                                {Number(product.ar || product.Ar).toLocaleString()} Ft
                                            </span>
                                            <button 
                                                onClick={() => addToCart(product.id || product.Id)}
                                                className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-bold text-sm"
                                            >
                                                Kosárba
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-20">
                                <p className="text-gray-400 text-lg">
                                    {selections.model ? 'Nincs találat a kiválasztott szűrésre.' : 'Kérjük, válasszon ki egy típust a kereséshez.'}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Teher;
