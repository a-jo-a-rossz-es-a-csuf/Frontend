import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Kliens oldali (Mock) adatbázis a valós autoalkatresz_db.sql alapján (Személyautók)
const CAR_DATA_DICTIONARY = {
    brands: {
        1: 'BMW',
        2: 'Audi',
        3: 'Mercedes-Benz'
    },
    models: {
        1: { nev: '1-es sorozat', generacio: 'E87', marka_id: 1 },
        2: { nev: '1-es sorozat', generacio: 'F20', marka_id: 1 },
        3: { nev: '3-as sorozat', generacio: 'E46', marka_id: 1 },
        4: { nev: '3-as sorozat', generacio: 'E90', marka_id: 1 },
        5: { nev: '3-as sorozat', generacio: 'F30', marka_id: 1 },
        6: { nev: '3-as sorozat', generacio: 'G20', marka_id: 1 },
        7: { nev: '5-ös sorozat', generacio: 'E39', marka_id: 1 },
        8: { nev: '5-ös sorozat', generacio: 'E60', marka_id: 1 },
        9: { nev: '5-ös sorozat', generacio: 'F10', marka_id: 1 },
        10: { nev: '5-ös sorozat', generacio: 'G30', marka_id: 1 },
        11: { nev: 'X3', generacio: 'E83', marka_id: 1 },
        12: { nev: 'X3', generacio: 'F25', marka_id: 1 },
        13: { nev: 'X3', generacio: 'G01', marka_id: 1 },
        14: { nev: 'X5', generacio: 'E53', marka_id: 1 },
        15: { nev: 'X5', generacio: 'E70', marka_id: 1 },
        16: { nev: 'X5', generacio: 'F15', marka_id: 1 },
        17: { nev: 'X5', generacio: 'G05', marka_id: 1 },
        18: { nev: 'A3', generacio: '8L', marka_id: 2 },
        19: { nev: 'A3', generacio: '8P', marka_id: 2 },
        20: { nev: 'A3', generacio: '8V', marka_id: 2 },
        21: { nev: 'A3', generacio: '8Y', marka_id: 2 },
        22: { nev: 'A4', generacio: 'B5', marka_id: 2 },
        23: { nev: 'A4', generacio: 'B6', marka_id: 2 },
        24: { nev: 'A4', generacio: 'B7', marka_id: 2 },
        25: { nev: 'A4', generacio: 'B8', marka_id: 2 },
        26: { nev: 'A4', generacio: 'B9', marka_id: 2 },
        27: { nev: 'A6', generacio: 'C5', marka_id: 2 },
        28: { nev: 'A6', generacio: 'C6', marka_id: 2 },
        29: { nev: 'A6', generacio: 'C7', marka_id: 2 },
        30: { nev: 'A6', generacio: 'C8', marka_id: 2 },
        31: { nev: 'Q5', generacio: '8R', marka_id: 2 },
        32: { nev: 'Q5', generacio: 'FY', marka_id: 2 },
        33: { nev: 'Q7', generacio: '4L', marka_id: 2 },
        34: { nev: 'Q7', generacio: '4M', marka_id: 2 },
        35: { nev: 'A-osztály', generacio: 'W169', marka_id: 3 },
        36: { nev: 'A-osztály', generacio: 'W176', marka_id: 3 },
        37: { nev: 'A-osztály', generacio: 'W177', marka_id: 3 },
        38: { nev: 'C-osztály', generacio: 'W203', marka_id: 3 },
        39: { nev: 'C-osztály', generacio: 'W204', marka_id: 3 },
        40: { nev: 'C-osztály', generacio: 'W205', marka_id: 3 },
        41: { nev: 'C-osztály', generacio: 'W206', marka_id: 3 },
        42: { nev: 'E-osztály', generacio: 'W211', marka_id: 3 },
        43: { nev: 'E-osztály', generacio: 'W212', marka_id: 3 },
        44: { nev: 'E-osztály', generacio: 'W213', marka_id: 3 },
        45: { nev: 'GLA', generacio: 'X156', marka_id: 3 },
        46: { nev: 'GLA', generacio: 'H247', marka_id: 3 },
        47: { nev: 'GLC', generacio: 'X253', marka_id: 3 },
        48: { nev: 'GLC', generacio: 'X254', marka_id: 3 },
        49: { nev: 'GLE', generacio: 'W166', marka_id: 3 },
        50: { nev: 'GLE', generacio: 'V167', marka_id: 3 },
        51: { nev: 'S-osztály', generacio: 'W222', marka_id: 3 }
    },
    motors: {
        1: { kod: 'N46B20', ccm: 1995, le: 150, modell_id: 4 },
        2: { kod: 'N52B25', ccm: 2497, le: 218, modell_id: 4 },
        3: { kod: 'N47D20', ccm: 1995, le: 177, modell_id: 4 },
        4: { kod: 'N20B20', ccm: 1997, le: 184, modell_id: 5 },
        5: { kod: 'B48B20', ccm: 1998, le: 252, modell_id: 5 },
        6: { kod: 'B47D20', ccm: 1995, le: 190, modell_id: 5 },
        7: { kod: 'N20B20', ccm: 1997, le: 184, modell_id: 9 },
        8: { kod: 'N55B30', ccm: 2979, le: 306, modell_id: 9 },
        9: { kod: 'N57D30', ccm: 2993, le: 258, modell_id: 9 },
        10: { kod: 'CDNC', ccm: 1984, le: 180, modell_id: 25 },
        11: { kod: 'CAGA', ccm: 1968, le: 143, modell_id: 25 },
        12: { kod: 'CAHA', ccm: 1968, le: 170, modell_id: 25 },
        13: { kod: 'CYRB', ccm: 1984, le: 190, modell_id: 26 },
        14: { kod: 'DCPC', ccm: 1968, le: 150, modell_id: 26 },
        15: { kod: 'DETA', ccm: 1968, le: 190, modell_id: 26 },
        16: { kod: 'M274', ccm: 1991, le: 184, modell_id: 40 },
        17: { kod: 'M276', ccm: 2996, le: 333, modell_id: 40 },
        18: { kod: 'OM654', ccm: 1950, le: 194, modell_id: 40 },
        19: { kod: 'M264', ccm: 1991, le: 197, modell_id: 44 },
        20: { kod: 'M276', ccm: 2996, le: 333, modell_id: 44 },
        21: { kod: 'OM654', ccm: 1950, le: 194, modell_id: 44 }
    }
};

const _generateYearsForModel = (modelId) => {
    // Alapértelmezett évek, ha valami nem stimmel
    const defaultYears = ['2024', '2023', '2022', '2021', '2020', '2019', '2018'];
    const modelMap = {
        1: { tol: 2004, ig: 2011 },
        2: { tol: 2011, ig: 2019 },
        3: { tol: 1998, ig: 2006 },
        4: { tol: 2005, ig: 2012 },
        5: { tol: 2012, ig: 2019 },
        6: { tol: 2019, ig: 2025 },
        7: { tol: 1995, ig: 2004 },
        8: { tol: 2003, ig: 2010 },
        9: { tol: 2010, ig: 2017 },
        10: { tol: 2017, ig: 2025 },
        11: { tol: 2003, ig: 2010 },
        12: { tol: 2010, ig: 2017 },
        13: { tol: 2017, ig: 2025 },
        14: { tol: 1999, ig: 2006 },
        15: { tol: 2006, ig: 2013 },
        16: { tol: 2013, ig: 2018 },
        17: { tol: 2018, ig: 2025 },
        18: { tol: 1996, ig: 2003 },
        19: { tol: 2003, ig: 2012 },
        20: { tol: 2012, ig: 2020 },
        21: { tol: 2020, ig: 2025 },
        22: { tol: 1994, ig: 2001 },
        23: { tol: 2000, ig: 2006 },
        24: { tol: 2004, ig: 2009 },
        25: { tol: 2007, ig: 2015 },
        26: { tol: 2015, ig: 2025 },
        27: { tol: 1997, ig: 2004 },
        28: { tol: 2004, ig: 2011 },
        29: { tol: 2011, ig: 2018 },
        30: { tol: 2018, ig: 2025 },
        31: { tol: 2008, ig: 2017 },
        32: { tol: 2017, ig: 2025 },
        33: { tol: 2005, ig: 2015 },
        34: { tol: 2015, ig: 2025 },
        35: { tol: 2004, ig: 2012 },
        36: { tol: 2012, ig: 2018 },
        37: { tol: 2018, ig: 2025 },
        38: { tol: 2000, ig: 2007 },
        39: { tol: 2007, ig: 2014 },
        40: { tol: 2014, ig: 2021 },
        41: { tol: 2021, ig: 2025 },
        42: { tol: 2002, ig: 2009 },
        43: { tol: 2009, ig: 2016 },
        44: { tol: 2016, ig: 2023 },
        45: { tol: 2013, ig: 2020 },
        46: { tol: 2020, ig: 2025 },
        47: { tol: 2015, ig: 2022 },
        48: { tol: 2022, ig: 2025 },
        49: { tol: 2015, ig: 2019 },
        50: { tol: 2019, ig: 2025 },
        51: { tol: 2013, ig: 2020 },
    };
    
    if (modelMap[modelId]) {
        const { tol, ig } = modelMap[modelId];
        const res = [];
        // Fordított sorrendben jelenítjük meg a frissebbtől a régebbiig
        let currentYear = new Date().getFullYear();
        let endYear = ig > currentYear ? currentYear : ig;

        for (let i = endYear; i >= tol; i--) {
            res.push(i.toString());
        }
        return res;
    }
    return defaultYears;
};

const Szemely = () => {
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

    // Raw (Nyers) API adatok a Jarmuvek táblából
    const [rawVehicles, setRawVehicles] = useState([]);

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);

    // Kezdeti betöltés
    useEffect(() => {
        const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
        setUser(savedUser);
        fetchBaseVehicles();
    }, []);

    // A C# endpoint teljes jrmuvek() listájának bekérése
    const fetchBaseVehicles = async () => {
        try {
            const res = await axios.get(`${API_URL}/cars`); 
            if (res.status === 200) {
                const vehicles = res.data || [];
                setRawVehicles(vehicles);

                // --- FRONTEND GENERÁLÁS (Csak a személyautók mock listáját állítjuk össze) ---
                const availableBrands = Object.entries(CAR_DATA_DICTIONARY.brands).map(([id, name]) => ({
                    id: id,
                    nev: name
                }));
                // Bármi amire rányomhatunk (összes márka betöltése kezdéskor)
                setLists(prev => ({ ...prev, brands: availableBrands }));
            }
        } catch (err) {
            console.error(`Hiba a Járművek lekérésekor:`, err);
        }
    };

    // Ha a márka változik
    useEffect(() => {
        if (selections.brand) {
            const brandModels = Object.entries(CAR_DATA_DICTIONARY.models)
                .filter(([id, data]) => data.marka_id.toString() === selections.brand)
                .map(([id, data]) => ({ id, nev: `${data.nev} (${data.generacio})` })); // Generáció is mehet a névhez

            setLists(prev => ({ ...prev, models: brandModels, years: [], motors: [] }));
            setSelections(prev => ({ ...prev, model: '', year: '', motor: '' }));
        }
    }, [selections.brand]);

    // Ha a modell változik, kiszámítja a lehetséges évjáratokat és lekéri a motorokat
    useEffect(() => {
        if (selections.model) {
            const modelMotors = Object.entries(CAR_DATA_DICTIONARY.motors)
                .filter(([id, data]) => data.modell_id.toString() === selections.model);
            
            setLists(prev => ({ 
                ...prev, 
                years: _generateYearsForModel(parseInt(selections.model)),
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

    // Termék kiválasztása a backend API termékeiből
    const handleSearch = async () => {
        if (!selections.model) return alert('Kérjük, válasszon ki egy modellt!');

        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/products`);
            if (res.status === 200) {
                const fullList = res.data || [];
                
                // Szűrés 1: Személyautó alkatrészek (kategória_id 1-13)
                let filtered = fullList.filter(p => {
                    const kategId = p.kategoriaId || p.KategoriaId;
                    return kategId && kategId < 14;
                });

                // Szűrés 2: Modell generáció alapján (pl. E90, F30, G20)
                if (selections.model) {
                    const selectedModelData = CAR_DATA_DICTIONARY.models[selections.model];
                    if (selectedModelData && selectedModelData.generacio) {
                        const generacio = selectedModelData.generacio.toUpperCase();
                        // A cikkszám vagy név tartalmazza a generációt
                        filtered = filtered.filter(p => {
                            const cikkszam = String(p.cikkszam || p.Cikkszam || '').toUpperCase();
                            const nev = String(p.nev || p.Nev || '').toUpperCase();
                            return cikkszam.includes(generacio) || nev.includes(generacio);
                        });
                    }
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

    // Egységesített kép-útvonal generáló
    const getImageUrl = (product) => {
        const path = product.kepUrl || product.KepUrl || product.kep_url;
        if (!path) return "https://placehold.co/400x300?text=Nincs+Kép";
        
        const fileName = String(path).trim().split(/[/\\]/).pop();
        return `/images/parts/${fileName}`;
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <section className="bg-white border-b py-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-2 h-8 bg-red-600 rounded-full"></div>
                        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                            Személygépkocsi Alkatrészek
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
                            className="bg-red-600 hover:bg-red-700 text-white px-12 py-3 rounded-xl font-bold shadow-lg shadow-red-200 transition-all active:scale-95"
                        >
                            ALKATRÉSZEK KERESÉSE
                        </button>
                    </div>
                </div>
            </section>

            {/* RESULTS GRID */}
            <main className="max-w-7xl mx-auto px-4 py-12">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
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
                                        <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md">
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
                                                className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-bold text-sm"
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

export default Szemely;
