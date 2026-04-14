import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AlvazszamKereso = () => {
    const API_URL = 'http://localhost:5000/api';
    const [vin, setVin] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    
    const [dictionaryLoaded, setDictionaryLoaded] = useState(false);
    
    // A teljes adatbázis szótár tárolása a React state-ben
    const [carData, setCarData] = useState({
        brands: {},
        models: {},
        motors: {}
    });

    // Dictionary betöltése az adatbázisból
    useEffect(() => {
        const loadDictionary = async () => {
            try {
                // Mivel az alvázszám keresőnek minden járművet ismernie kell, 
                // lekérjük a személy, teher és motor adatokat is, és összefűzzük őket.
                const endpoints = [
                    axios.get(`${API_URL}/brands/szemely`).catch(() => ({ data: [] })),
                    axios.get(`${API_URL}/models/szemely`).catch(() => ({ data: [] })),
                    axios.get(`${API_URL}/motors/szemely`).catch(() => ({ data: [] })),
                    
                    axios.get(`${API_URL}/brands/teher`).catch(() => ({ data: [] })),
                    axios.get(`${API_URL}/models/teher`).catch(() => ({ data: [] })),
                    axios.get(`${API_URL}/motors/teher`).catch(() => ({ data: [] })),
                    
                    axios.get(`${API_URL}/brands/motor`).catch(() => ({ data: [] })),
                    axios.get(`${API_URL}/models/motor`).catch(() => ({ data: [] })),
                    axios.get(`${API_URL}/motors/motor`).catch(() => ({ data: [] }))
                ];

                const results = await Promise.all(endpoints);

                // Összesítjük a 3 kategória adatait
                const allBrands = [...results[0].data, ...results[3].data, ...results[6].data];
                const allModels = [...results[1].data, ...results[4].data, ...results[7].data];
                const allMotors = [...results[2].data, ...results[5].data, ...results[8].data];

                const newCarData = { brands: {}, models: {}, motors: {} };

                // Brands
                allBrands.forEach(b => {
                    newCarData.brands[b.id || b.Id] = {
                        nev: b.nev || b.Nev,
                        tipus: b.tipus || b.Tipus
                    };
                });

                // Models
                allModels.forEach(m => {
                    newCarData.models[m.id || m.Id] = {
                        nev: m.modellNev || m.ModellNev,
                        generacio: m.generacio || m.Generacio,
                        marka_id: m.markaId || m.MarkaId,
                        evjarat_tol: m.evjaratTol || m.EvjaratTol,
                        evjarat_ig: m.evjaratIg || m.EvjaratIg
                    };
                });

                // Motors
                allMotors.forEach(mo => {
                    newCarData.motors[mo.id || mo.Id] = {
                        kod: mo.motorKod || mo.MotorKod,
                        ccm: mo.hengerurtartalom || mo.Hengerurtartalom,
                        le: mo.teljesitmenyLe || mo.TeljesitmenyLe,
                        teljesitmeny_kw: mo.teljesitmenyKw || mo.TeljesitmenyKw,
                        modell_id: mo.modellId || mo.ModellId,
                        uzemanyag: mo.uzemanyag || mo.Uzemanyag
                    };
                });

                setCarData(newCarData);
                setDictionaryLoaded(true);
            } catch (err) {
                console.error("Dictionary betöltési hiba:", err);
                setError('Nem sikerült betölteni a járműadatokat.');
            }
        };

        loadDictionary();
    }, []);

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

        if (!dictionaryLoaded) {
            setError('Az adatok még töltődnek, kérlek várj...');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
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

            const modellId = foundVehicle.modellId || foundVehicle.ModellId;
            const motor_id = foundVehicle.motorId || foundVehicle.MotorId;
            
            const modelData = carData.models[modellId];
            const markaId = modelData?.marka_id;
            const markaData = carData.brands[markaId];
            const motorData = carData.motors[motor_id];

            if (!modelData || !markaData) {
                setError('Az adatbázisban nincsenek teljes járműadatok ehhez az alvázszámhoz.');
                setLoading(false);
                return;
            }

            const jarmuTipus = (markaData.tipus || '').toLowerCase();
            let compatibleProducts = allProducts;

            // UNIVERZÁLIS SZŰRÉS JÁRMŰTÍPUS ALAPJÁN
            if (jarmuTipus === 'szemely' || jarmuTipus === '') {
                // 1. Személyautók (1-13 kategória és Generáció alapú keresés)
                compatibleProducts = compatibleProducts.filter(p => {
                    const kategId = p.kategoriaId || p.KategoriaId;
                    return kategId >= 1 && kategId <= 13;
                });
                const generacio = (modelData.generacio || '').toUpperCase();
                if (generacio) {
                    compatibleProducts = compatibleProducts.filter(p => {
                        const cikkszam = String(p.cikkszam || p.Cikkszam || '').toUpperCase();
                        const nev = String(p.nev || p.Nev || '').toUpperCase();
                        return cikkszam.includes(generacio) || nev.includes(generacio);
                    });
                }
            } 
            else if (jarmuTipus === 'teher') {
                // 2. Teherautók (14-es kategória és Kötőjeles Modellkód alapú keresés)
                compatibleProducts = compatibleProducts.filter(p => {
                    const kategId = p.kategoriaId || p.KategoriaId;
                    return kategId === 14;
                });
                const nevSzavak = modelData.nev ? modelData.nev.toUpperCase().split(/[- ]/) : [];
                const modelCode = nevSzavak.length > 0 ? nevSzavak[0] : '';
                if (modelCode) {
                    compatibleProducts = compatibleProducts.filter(p => {
                        const cikkszam = String(p.cikkszam || p.Cikkszam || '').toUpperCase();
                        const parts = cikkszam.split('-');
                        return parts.length >= 2 && parts[1] === modelCode;
                    });
                }
            } 
            else if (jarmuTipus === 'motor') {
                // 3. Motorok (15-ös kategória és Név alapú keresés)
                compatibleProducts = compatibleProducts.filter(p => {
                    const kategId = p.kategoriaId || p.KategoriaId;
                    return kategId === 15;
                });
                const modelName = modelData.nev ? modelData.nev.toUpperCase() : '';
                if (modelName) {
                    compatibleProducts = compatibleProducts.filter(p => {
                        const cikkszam = String(p.cikkszam || p.Cikkszam || '').toUpperCase();
                        const nev = String(p.nev || p.Nev || '').toUpperCase();
                        return cikkszam.includes(modelName) || nev.includes(modelName);
                    });
                }
            }

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

    // Javított Kosárba Tétel
    const addToCart = async (productId) => {
        const currentUserId = user?.id || user?.Id;
        
        if (!currentUserId) return alert('A vásárláshoz be kell jelentkeznie!');
        
        try {
            const payload = {
                felhasznaloId: parseInt(currentUserId),
                alkatreszId: parseInt(productId),
                olajId: null,
                mennyiseg: 1
            };

            const res = await axios.post(`${API_URL}/cart`, payload);
            
            if (res.status === 200 || res.status === 201) {
                alert('Termék a kosárba került!');
                window.dispatchEvent(new Event('cartUpdated'));
            } else {
                alert(res.data?.message || res.data?.error || 'Hiba történt a kosárba tételkor.');
            }
        } catch (err) {
            console.error("Kosár hiba:", err.response?.data || err);
            alert('Hiba történt a kosárba tételkor. Ellenőrizd a konzolt!');
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
                            disabled={loading || !dictionaryLoaded}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loading ? 'KERESÉS...' : !dictionaryLoaded ? 'ADATOK TÖLTÉSE...' : 'AZONOSÍTÁS'}
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
                                        Generáció: <span className="text-gray-700 font-bold">{result.generacio || '-'}</span>
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