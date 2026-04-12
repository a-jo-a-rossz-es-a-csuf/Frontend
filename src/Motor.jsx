import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Kliens oldali (Mock) adatbázis a valós autoalkatresz_db.sql alapján (Motorok)
const MOTORCYCLE_DATA_DICTIONARY = {
    brands: {
        6: 'Honda',
        7: 'Yamaha'
    },
    models: {
        64: { nev: 'CBR600RR', marka_id: 6 },
        65: { nev: 'CBR1000RR Fireblade', marka_id: 6 },
        66: { nev: 'CB500F', marka_id: 6 },
        67: { nev: 'CB650R', marka_id: 6 },
        68: { nev: 'Africa Twin CRF1100L', marka_id: 6 },
        69: { nev: 'NC750X', marka_id: 6 },
        70: { nev: 'Forza 350', marka_id: 6 },
        71: { nev: 'PCX125', marka_id: 6 },
        72: { nev: 'YZF-R6', marka_id: 7 },
        73: { nev: 'YZF-R1', marka_id: 7 },
        74: { nev: 'MT-07', marka_id: 7 },
        75: { nev: 'MT-09', marka_id: 7 },
        76: { nev: 'Tenere 700', marka_id: 7 },
        77: { nev: 'Tracer 9', marka_id: 7 },
        78: { nev: 'XMAX 300', marka_id: 7 },
        79: { nev: 'NMAX 125', marka_id: 7 }
    },
    motors: {
        28: { kod: 'PC40E', ccm: 599, le: 120, modell_id: 64 },
        29: { kod: 'SC82E', ccm: 999, le: 217, modell_id: 65 },
        30: { kod: 'PC60E', ccm: 471, le: 47, modell_id: 66 },
        31: { kod: 'RH03E', ccm: 649, le: 95, modell_id: 67 },
        32: { kod: 'RJ27', ccm: 599, le: 118, modell_id: 72 },
        33: { kod: 'RN65', ccm: 998, le: 200, modell_id: 73 },
        34: { kod: 'RM33', ccm: 689, le: 73, modell_id: 74 },
        35: { kod: 'RN69', ccm: 890, le: 119, modell_id: 75 }
    }
};

const _generateYearsForMotorModel = (modelId) => {
    // Alapértelmezett évek, ha valami nem stimmel
    const defaultYears = ['2025', '2024', '2023', '2022', '2021', '2020'];
    const modelMap = {
        64: { tol: 2003, ig: 2025 },
        65: { tol: 2004, ig: 2025 },
        66: { tol: 2013, ig: 2025 },
        67: { tol: 2019, ig: 2025 },
        68: { tol: 2016, ig: 2025 },
        69: { tol: 2012, ig: 2025 },
        70: { tol: 2018, ig: 2025 },
        71: { tol: 2010, ig: 2025 },
        72: { tol: 1999, ig: 2025 },
        73: { tol: 1998, ig: 2025 },
        74: { tol: 2014, ig: 2025 },
        75: { tol: 2013, ig: 2025 },
        76: { tol: 2019, ig: 2025 },
        77: { tol: 2015, ig: 2025 },
        78: { tol: 2017, ig: 2025 },
        79: { tol: 2015, ig: 2025 },
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

const Motor = () => {
    const API_URL = 'http://localhost:5000/api';

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
        
        // --- FRONTEND GENERÁLÁS (Motorokhoz) ---
        const availableBrands = Object.entries(MOTORCYCLE_DATA_DICTIONARY.brands).map(([id, name]) => ({
             id, nev: name
        }));
        setLists(prev => ({ ...prev, brands: availableBrands }));
    }, []);

    // Ha a márka változik
    useEffect(() => {
        if (selections.brand) {
            const brandModels = Object.entries(MOTORCYCLE_DATA_DICTIONARY.models)
                .filter(([id, data]) => data.marka_id.toString() === selections.brand)
                .map(([id, data]) => ({ id, nev: data.nev }));

            setLists(prev => ({ ...prev, models: brandModels, years: [], motors: [] }));
            setSelections(prev => ({ ...prev, model: '', year: '', motor: '' }));
        }
    }, [selections.brand]);

    // Ha a modell változik
    useEffect(() => {
        if (selections.model) {
            const modelMotors = Object.entries(MOTORCYCLE_DATA_DICTIONARY.motors)
                .filter(([id, data]) => data.modell_id.toString() === selections.model);
            
            setLists(prev => ({ 
                ...prev, 
                years: _generateYearsForMotorModel(parseInt(selections.model)),
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
                
                // Szűrés 1: Motorok kategória ID-ja 15
                let filtered = safeProducts.filter(p => (p.kategoriaId || p.KategoriaId) === 15);
                
                // Szűrés 2: Modell alapján a cikkszámban keresünk
                if (selections.model && MOTORCYCLE_DATA_DICTIONARY.models[selections.model]) {
                    const modelName = MOTORCYCLE_DATA_DICTIONARY.models[selections.model].nev.toUpperCase();
                    filtered = filtered.filter(p => {
                        const cikkszam = String(p.cikkszam || p.Cikkszam || '').toUpperCase();
                        const nev = String(p.nev || p.Nev || '').toUpperCase();
                        return cikkszam.includes(modelName) || nev.includes(modelName);
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
                        <div className="w-2 h-8 bg-green-600 rounded-full"></div>
                        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                            Motorkerékpár Alkatrészek
                        </h1>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase px-1">Márka</label>
                            <select 
                                value={selections.brand}
                                onChange={(e) => setSelections({...selections, brand: e.target.value})}
                                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-600 outline-none transition"
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
                                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-600 outline-none disabled:opacity-50 transition"
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
                                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-600 outline-none disabled:opacity-50 transition"
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
                                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-600 outline-none disabled:opacity-50 transition"
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
                            className="bg-green-600 hover:bg-green-700 text-white px-12 py-3 rounded-xl font-bold shadow-lg shadow-green-200 transition-all active:scale-95"
                        >
                            ALKATRÉSZEK KERESÉSE
                        </button>
                    </div>
                </div>
            </section>

            <main className="max-w-7xl mx-auto px-4 py-12">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
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
                                        <div className="absolute top-3 left-3 bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md">
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
                                                className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-bold text-sm"
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

export default Motor;
