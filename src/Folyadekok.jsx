import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Folyadekok = () => {
    const API_URL = 'http://localhost:5000/api';
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Szűrők állapotai
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [viscosities, setViscosities] = useState([]);
    
    // Aktuális választások
    const [selectedCat, setSelectedCat] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedVis, setSelectedVis] = useState('');

    const [user, setUser] = useState(null);

    useEffect(() => {
        const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
        setUser(savedUser);
        loadInitialData();
    }, []);

    // Szűrők és alaplista betöltése
    const loadInitialData = async () => {
        setLoading(true);
        try {
            const prodRes = await axios.get(`${API_URL}/olajok`);

            if (Array.isArray(prodRes.data)) {
                setProducts(prodRes.data);
                
                // Egyedi kategóriák, márkák, viszkozitások kinyerése client-side-on
                const cats = [...new Set(prodRes.data.map(p => p.nev || p.Nev).map(n => n.split('-')[0].trim()))];
                const marks = [...new Set(prodRes.data.map(p => p.gyarto || p.Gyarto).filter(Boolean))];
                const vis = [...new Set(prodRes.data.map(p => p.viszkozitas || p.Viszkozitas).filter(Boolean))];
                
                setCategories(cats.filter(c => c));
                setBrands(marks);
                setViscosities(vis);
            }
        } catch (err) {
            console.error("Hiba a betöltéskor:", err);
            setError("Nem sikerült kapcsolódni a szerverhez.");
        } finally {
            setLoading(false);
        }
    };

    // Kép URL-t generál a termékből
    const getImageUrl = (product) => {
        const nev = String(product.nev || product.Nev || '').toLowerCase();
        const path = product.kepUrl || product.KepUrl || product.kep_url;

        if (nev.includes('hutofolyadek') || nev.includes('hűtőfolyadék')) return '/images/parts/hutofolyadek.jpg';
        if (nev.includes('fekfolyadek') || nev.includes('fékfolyadék')) return '/images/parts/fekfolyadek.jpg';
        if (!path) return "https://placehold.co/400x300?text=Nincs+Kép";
        
        const fileName = String(path).trim().split(/[/\\]/).pop();
        return `/images/parts/${fileName}`;
    };

    // JAVÍTOTT KOSÁRBA TÉTEL (A backend CartRequestDto-hoz igazítva)
    const addToCart = async (productId) => {
        if (!user || !user.id) {
            return alert('A vásárláshoz be kell jelentkeznie!');
        }

        try {
            // Pontosan azokat a mezőket küldjük, amiket a C# DTO vár
            const payload = {
                userId: parseInt(user.id),
                olajId: parseInt(productId),
                alkatreszId: null,
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
            alert('Szerver hiba történt. Ellenőrizd a konzolt!');
        }
    };

    if (loading) return <div className="p-20 text-center font-bold text-gray-500">Folyadékok betöltése...</div>;

    // Client-side szűrés
    const filteredProducts = products.filter(p => {
        const cat = (p.nev || p.Nev || '').split('-')[0].trim();
        const brand = p.gyarto || p.Gyarto;
        const vis = p.viszkozitas || p.Viszkozitas;
        
        const matchCat = !selectedCat || cat === selectedCat;
        const matchBrand = !selectedBrand || brand === selectedBrand;
        const matchVis = !selectedVis || vis === selectedVis;
        
        return matchCat && matchBrand && matchVis;
    });

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-10">
                <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter mb-2">Olajok és Folyadékok</h2>
                <div className="h-2 w-24 bg-yellow-500 rounded-full"></div>
            </div>

            {/* Szűrő Sáv */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Kategória</label>
                    <select 
                        value={selectedCat} 
                        onChange={(e) => setSelectedCat(e.target.value)}
                        className="p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-yellow-500 transition-all"
                    >
                        <option value="">Összes kategória</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Gyártó</label>
                    <select 
                        value={selectedBrand} 
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        className="p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-yellow-500 transition-all"
                    >
                        <option value="">Összes márka</option>
                        {brands.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">Viszkozitás</label>
                    <select 
                        value={selectedVis} 
                        onChange={(e) => setSelectedVis(e.target.value)}
                        className="p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-yellow-500 transition-all"
                    >
                        <option value="">Összes viszkozitás</option>
                        {viscosities.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>
            </div>

            {/* Termék Rács */}
            {filteredProducts.length === 0 ? (
                <div className="bg-yellow-50 p-10 rounded-3xl text-center border border-dashed border-yellow-200">
                    <p className="text-yellow-700 font-medium italic">Sajnos nincs a keresésnek megfelelő termék.</p>
                    <button onClick={() => {setSelectedCat(''); setSelectedBrand(''); setSelectedVis('');}} className="mt-4 text-sm font-bold text-yellow-600 underline">Szűrők alaphelyzetbe állítása</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredProducts.map(p => (
                        <div key={p.id || p.Id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full overflow-hidden">
                            <div className="h-52 bg-gray-50 p-6 relative overflow-hidden">
                                <img 
                                    src={getImageUrl(p)} 
                                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" 
                                    alt={p.nev || p.Nev}
                                    onError={(e) => e.target.src = "https://placehold.co/400x300?text=Nincs+Kép"}
                                />
                                {(p.viszkozitas || p.Viszkozitas) && (
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black shadow-sm border border-gray-100">
                                        {p.viszkozitas || p.Viszkozitas}
                                    </div>
                                )}
                            </div>
                            
                            <div className="p-6 flex flex-col flex-grow text-center">
                                <span className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest mb-1">{p.gyarto || p.Gyarto}</span>
                                <h3 className="font-bold text-gray-900 leading-tight mb-4 h-12 line-clamp-2">
                                    {p.nev || p.Nev}
                                </h3>
                                
                                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between gap-4">
                                    <div className="text-left">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Ár</p>
                                        <p className="text-xl font-black text-gray-900">{Number(p.ar || p.Ar).toLocaleString()} Ft</p>
                                    </div>
                                    <button 
                                        onClick={() => addToCart(p.id || p.Id)}
                                        className="bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-yellow-500 hover:text-gray-900 transition-all font-bold text-sm shadow-md active:scale-95"
                                    >
                                        Kosárba
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Folyadekok;
