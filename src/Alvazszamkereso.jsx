import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Mock adatbázis - TELJES, az összes járműadattal
const CAR_DATA_DICTIONARY = {
    brands: {
        1: { nev: 'BMW', tipus: 'Személyautók' },
        2: { nev: 'Audi', tipus: 'Személyautók' },
        3: { nev: 'Mercedes-Benz', tipus: 'Személyautók' }
    },
    models: {
        1: { nev: '1-es sorozat', generacio: 'E87', marka_id: 1, evjarat_tol: 2003, evjarat_ig: 2013 },
        2: { nev: '1-es sorozat', generacio: 'F20', marka_id: 1, evjarat_tol: 2011, evjarat_ig: 2020 },
        3: { nev: '3-as sorozat', generacio: 'E46', marka_id: 1, evjarat_tol: 1998, evjarat_ig: 2005 },
        4: { nev: '3-as sorozat', generacio: 'E90', marka_id: 1, evjarat_tol: 2005, evjarat_ig: 2012 },
        5: { nev: '3-as sorozat', generacio: 'F30', marka_id: 1, evjarat_tol: 2012, evjarat_ig: 2018 },
        6: { nev: '3-as sorozat', generacio: 'G20', marka_id: 1, evjarat_tol: 2019, evjarat_ig: 2024 },
        7: { nev: '5-ös sorozat', generacio: 'E39', marka_id: 1, evjarat_tol: 1996, evjarat_ig: 2003 },
        8: { nev: '5-ös sorozat', generacio: 'E60', marka_id: 1, evjarat_tol: 2003, evjarat_ig: 2010 },
        9: { nev: '5-ös sorozat', generacio: 'F10', marka_id: 1, evjarat_tol: 2010, evjarat_ig: 2017 },
        10: { nev: '5-ös sorozat', generacio: 'G30', marka_id: 1, evjarat_tol: 2017, evjarat_ig: 2024 },
        11: { nev: 'X3', generacio: 'E83', marka_id: 1, evjarat_tol: 2003, evjarat_ig: 2010 },
        12: { nev: 'X3', generacio: 'F25', marka_id: 1, evjarat_tol: 2010, evjarat_ig: 2017 },
        13: { nev: 'X3', generacio: 'G01', marka_id: 1, evjarat_tol: 2017, evjarat_ig: 2024 },
        14: { nev: 'X5', generacio: 'E53', marka_id: 1, evjarat_tol: 1999, evjarat_ig: 2006 },
        15: { nev: 'X5', generacio: 'E70', marka_id: 1, evjarat_tol: 2006, evjarat_ig: 2013 },
        16: { nev: 'X5', generacio: 'F15', marka_id: 1, evjarat_tol: 2013, evjarat_ig: 2018 },
        17: { nev: 'X5', generacio: 'G05', marka_id: 1, evjarat_tol: 2018, evjarat_ig: 2024 },
        18: { nev: 'A3', generacio: '8L', marka_id: 2, evjarat_tol: 1996, evjarat_ig: 2003 },
        19: { nev: 'A3', generacio: '8P', marka_id: 2, evjarat_tol: 2003, evjarat_ig: 2012 },
        20: { nev: 'A3', generacio: '8V', marka_id: 2, evjarat_tol: 2012, evjarat_ig: 2020 },
        21: { nev: 'A3', generacio: '8Y', marka_id: 2, evjarat_tol: 2020, evjarat_ig: 2024 },
        22: { nev: 'A4', generacio: 'B5', marka_id: 2, evjarat_tol: 1994, evjarat_ig: 2001 },
        23: { nev: 'A4', generacio: 'B6', marka_id: 2, evjarat_tol: 2000, evjarat_ig: 2004 },
        24: { nev: 'A4', generacio: 'B7', marka_id: 2, evjarat_tol: 2004, evjarat_ig: 2008 },
        25: { nev: 'A4', generacio: 'B8', marka_id: 2, evjarat_tol: 2008, evjarat_ig: 2015 },
        26: { nev: 'A4', generacio: 'B9', marka_id: 2, evjarat_tol: 2015, evjarat_ig: 2024 },
        27: { nev: 'A6', generacio: 'C5', marka_id: 2, evjarat_tol: 1997, evjarat_ig: 2004 },
        28: { nev: 'A6', generacio: 'C6', marka_id: 2, evjarat_tol: 2004, evjarat_ig: 2011 },
        29: { nev: 'A6', generacio: 'C7', marka_id: 2, evjarat_tol: 2011, evjarat_ig: 2018 },
        30: { nev: 'A6', generacio: 'C8', marka_id: 2, evjarat_tol: 2018, evjarat_ig: 2024 },
        31: { nev: 'Q5', generacio: '8R', marka_id: 2, evjarat_tol: 2008, evjarat_ig: 2017 },
        32: { nev: 'Q5', generacio: 'FY', marka_id: 2, evjarat_tol: 2017, evjarat_ig: 2024 },
        35: { nev: 'A-osztály', generacio: 'W169', marka_id: 3, evjarat_tol: 2004, evjarat_ig: 2012 },
        36: { nev: 'A-osztály', generacio: 'W176', marka_id: 3, evjarat_tol: 2012, evjarat_ig: 2018 },
        37: { nev: 'A-osztály', generacio: 'W177', marka_id: 3, evjarat_tol: 2018, evjarat_ig: 2024 },
        38: { nev: 'C-osztály', generacio: 'W203', marka_id: 3, evjarat_tol: 2000, evjarat_ig: 2007 },
        39: { nev: 'C-osztály', generacio: 'W204', marka_id: 3, evjarat_tol: 2007, evjarat_ig: 2014 },
        40: { nev: 'C-osztály', generacio: 'W205', marka_id: 3, evjarat_tol: 2014, evjarat_ig: 2021 },
        41: { nev: 'C-osztály', generacio: 'W206', marka_id: 3, evjarat_tol: 2021, evjarat_ig: 2024 },
        42: { nev: 'E-osztály', generacio: 'W213', marka_id: 3, evjarat_tol: 2016, evjarat_ig: 2024 },
        43: { nev: 'GLC', generacio: 'X253', marka_id: 3, evjarat_tol: 2015, evjarat_ig: 2024 }
    },
    motors: {
        1: { kod: 'N46B20', ccm: 1995, le: 150, teljesitmeny_kw: 110, modell_id: 4, uzemanyag: 'benzin' },
        2: { kod: 'N52B25', ccm: 2497, le: 218, teljesitmeny_kw: 160, modell_id: 4, uzemanyag: 'benzin' },
        3: { kod: 'N47D20', ccm: 1995, le: 177, teljesitmeny_kw: 130, modell_id: 4, uzemanyag: 'dizel' },
        4: { kod: 'N20B20', ccm: 1997, le: 184, teljesitmeny_kw: 135, modell_id: 5, uzemanyag: 'benzin' },
        5: { kod: 'B48B20', ccm: 1998, le: 252, teljesitmeny_kw: 185, modell_id: 5, uzemanyag: 'benzin' },
        6: { kod: 'B47D20', ccm: 1995, le: 190, teljesitmeny_kw: 140, modell_id: 5, uzemanyag: 'dizel' },
        7: { kod: 'N20B20', ccm: 1997, le: 184, teljesitmeny_kw: 135, modell_id: 9, uzemanyag: 'benzin' },
        8: { kod: 'N55B30', ccm: 2979, le: 306, teljesitmeny_kw: 225, modell_id: 9, uzemanyag: 'benzin' },
        9: { kod: 'N57D30', ccm: 2993, le: 258, teljesitmeny_kw: 190, modell_id: 9, uzemanyag: 'dizel' },
        10: { kod: 'CDNC', ccm: 1984, le: 180, teljesitmeny_kw: 132, modell_id: 25, uzemanyag: 'benzin' },
        11: { kod: 'CAGA', ccm: 1968, le: 143, teljesitmeny_kw: 105, modell_id: 25, uzemanyag: 'dizel' },
        12: { kod: 'CAHA', ccm: 1968, le: 170, teljesitmeny_kw: 125, modell_id: 25, uzemanyag: 'dizel' },
        13: { kod: 'CYRB', ccm: 1984, le: 190, teljesitmeny_kw: 140, modell_id: 26, uzemanyag: 'benzin' },
        14: { kod: 'DCPC', ccm: 1968, le: 150, teljesitmeny_kw: 110, modell_id: 26, uzemanyag: 'dizel' },
        15: { kod: 'DETA', ccm: 1968, le: 190, teljesitmeny_kw: 140, modell_id: 26, uzemanyag: 'dizel' },
        16: { kod: 'M274', ccm: 1991, le: 184, teljesitmeny_kw: 135, modell_id: 40, uzemanyag: 'benzin' },
        17: { kod: 'M276', ccm: 2996, le: 333, teljesitmeny_kw: 245, modell_id: 40, uzemanyag: 'benzin' },
        18: { kod: 'OM654', ccm: 1950, le: 194, teljesitmeny_kw: 143, modell_id: 40, uzemanyag: 'dizel' },
        19: { kod: 'M264', ccm: 1991, le: 197, teljesitmeny_kw: 145, modell_id: 44, uzemanyag: 'benzin' },
        20: { kod: 'M276', ccm: 2996, le: 333, teljesitmeny_kw: 245, modell_id: 44, uzemanyag: 'benzin' },
        21: { kod: 'OM654', ccm: 1950, le: 194, teljesitmeny_kw: 143, modell_id: 44, uzemanyag: 'dizel' }
    }
};

const AlvazszamKereso = () => {
    const API_URL = 'http://localhost:5000/api';
    const [vin, setVin] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
        setUser(savedUser);
    }, []);

    const getImageUrl = (product) => {
        const path = product.kepUrl || product.KepUrl || product.kep_url;
        if (!path) return "https://placehold.co/400x300?text=Nincs+Kép";
        
        const fileName = String(path).trim().split(/[/\\]/).pop();
        return `/images/parts/${fileName}`;
    };

    const handleVinSearch = async (e) => {
        e.preventDefault();
        const cleanVin = vin.trim().toUpperCase();
        
        if (cleanVin.length !== 17) {
            setError('Az alvázszámnak pontosan 17 karakternek kell lennie!');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            // Lekérjük az összes járművet és terméket
            const [carsRes, productsRes] = await Promise.all([
                axios.get(`${API_URL}/cars`),
                axios.get(`${API_URL}/products`)
            ]);

            const allVehicles = Array.isArray(carsRes.data) ? carsRes.data : [];
            const allProducts = Array.isArray(productsRes.data) ? productsRes.data : [];

            // VIN alapján szűrünk
            const foundVehicle = allVehicles.find(v => 
                (v.alvazszam || v.Alvazszam || '').toUpperCase() === cleanVin
            );

            if (!foundVehicle) {
                setError('Nem található jármű ezzel az alvázszámmal.');
                setLoading(false);
                return;
            }

            // Modell ID lekérése
            const modellId = foundVehicle.modellId || foundVehicle.ModellId;
            const motor_id = foundVehicle.motorId || foundVehicle.MotorId;
            
            // Modell adatok keresése a mock adatbázisból
            const modelData = CAR_DATA_DICTIONARY.models[modellId];
            const markaId = modelData?.marka_id;
            const markaData = CAR_DATA_DICTIONARY.brands[markaId];
            const motorData = CAR_DATA_DICTIONARY.motors[motor_id];

            if (!modelData || !markaData) {
                setError('Az adatbázisban nincsenek teljes járműadatok ehhez az alvázszámhoz.');
                setLoading(false);
                return;
            }

            // Szűrés: személyautók kategóriájú alkatrészek (1-13)
            let compatibleProducts = allProducts.filter(p => {
                const kategId = p.kategoriaId || p.KategoriaId;
                return kategId >= 1 && kategId <= 13;
            });

            // Szűrés 2: Modell generáció alapján
            const generacio = modelData.generacio.toUpperCase();
            compatibleProducts = compatibleProducts.filter(p => {
                const cikkszam = String(p.cikkszam || p.Cikkszam || '').toUpperCase();
                const nev = String(p.nev || p.Nev || '').toUpperCase();
                return cikkszam.includes(generacio) || nev.includes(generacio);
            });

            // Enrich result with vehicle details
            setResult({
                id: foundVehicle.id || foundVehicle.Id,
                alvazszam: cleanVin,
                markaNev: markaData.nev,
                modellNev: modelData.nev,
                generacio: modelData.generacio,
                evjarat: foundVehicle.evjarat || foundVehicle.Evjarat,
                szin: foundVehicle.szin || foundVehicle.Szin,
                motorKod: motorData?.kod || 'Nem elérhető',
                teljesitmenyLe: motorData?.le || 'Nem elérhető',
                teljesitmenyKw: motorData?.teljesitmeny_kw || 'Nem elérhető',
                ccm: motorData?.ccm || 'Nem elérhető',
                alkatreszek: compatibleProducts
            });
        } catch (err) {
            console.error("Keresési hiba:", err);
            setError('Szerver hiba történt a lekérdezés során.');
        } finally {
            setLoading(false);
        }
    };

    // JAVÍTOTT KOSÁRBA TÉTEL A C# BACKENDHEZ
    const addToCart = async (productId) => {
        if (!user || !user.id) return alert('A vásárláshoz be kell jelentkeznie!');
        
        try {
            const payload = {
                userId: parseInt(user.id),
                alkatreszId: parseInt(productId),
                olajId: null,
                mennyiseg: 1
            };

            const res = await axios.post(`${API_URL}/cart?action=add`, payload);
            
            if (res.data.success) {
                alert('Termék a kosárba került!');
                window.dispatchEvent(new Event('cartUpdated'));
            } else {
                alert(res.data.message || res.data.error || 'Hiba történt.');
            }
        } catch (err) {
            console.error("Kosár hiba:", err.response?.data || err);
            alert('Hiba történt a kosárba tételkor.');
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-8 text-white">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-black text-xl">V</div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter">VIN Alapú Azonosítás</h2>
                    </div>
                    <p className="text-slate-400 text-sm">Gyári pontosságú alkatrészkeresés alvázszám alapján.</p>
                </div>

                <form onSubmit={handleVinSearch} className="p-8 bg-white">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-grow">
                            <input
                                type="text"
                                value={vin}
                                onChange={(e) => setVin(e.target.value)}
                                placeholder="Adja meg a 17 jegyű alvázszámot..."
                                className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-mono text-lg uppercase tracking-widest"
                                maxLength={17}
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loading ? 'KERESÉS...' : 'AZONOSÍTÁS'}
                        </button>
                    </div>
                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium">
                            {error}
                        </div>
                    )}
                </form>

                {result && (
                    <div className="border-t border-gray-100 animate-in fade-in duration-500">
                        <div className="p-8 bg-gray-50/50">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                                <div className="flex-grow">
                                    <span className="text-blue-600 font-bold text-xs uppercase tracking-widest">Talált jármű:</span>
                                    <h3 className="text-3xl font-black text-gray-900 leading-none mt-1">
                                        {result.markaNev} {result.modellNev}
                                    </h3>
                                    <p className="text-gray-500 mt-2 font-medium">
                                        Generáció: <span className="text-gray-700 font-bold">{result.generacio}</span>
                                    </p>
                                </div>
                                <div className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-xs font-black uppercase tracking-tighter shadow-sm border border-green-200">
                                    ✓ Pontos egyezés
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-white p-6 rounded-2xl border border-gray-100">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Alvázszám (VIN)</label>
                                    <p className="text-lg font-mono font-bold text-gray-900">{result.alvazszam}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Évjárat</label>
                                    <p className="text-lg font-bold text-gray-900">{result.evjarat || 'Nem elérhető'}</p>
                                </div>
                            </div>

                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 px-1">Kompatibilis Alkatrészek ({(result.alkatreszek || []).length})</h4>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                                {result.alkatreszek && result.alkatreszek.length > 0 ? (
                                    result.alkatreszek.map((product) => (
                                        <div key={product.id || product.Id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex gap-5 items-center group">
                                            <div className="w-24 h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-50">
                                                <img 
                                                    src={getImageUrl(product)} 
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                                    alt={product.nev || product.Nev}
                                                    onError={(e) => { 
                                                        e.target.onerror = null; 
                                                        e.target.src = "https://placehold.co/400x300?text=Nincs+Kép"; 
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-grow">
                                                <div className="text-[10px] font-bold text-blue-500 uppercase mb-1">{product.cikkszam || product.Cikkszam}</div>
                                                <h5 className="font-bold text-gray-900 text-md leading-tight mb-2">
                                                    {product.nev || product.Nev}
                                                </h5>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-lg font-black text-gray-900">
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
                                    <div className="col-span-full py-10 text-center text-gray-400 italic bg-white rounded-2xl border border-dashed">
                                        Ehhez a járműhöz jelenleg nincsenek feltöltött alkatrészek.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AlvazszamKereso;
