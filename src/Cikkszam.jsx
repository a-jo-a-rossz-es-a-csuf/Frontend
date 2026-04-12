import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CikkszamKereso = () => {
    const API_URL = 'http://localhost:5000/api';
    const [sku, setSku] = useState('');
    const [products, setProducts] = useState([]);
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

    const handleSkuSearch = async (e) => {
        e.preventDefault();
        const searchSku = sku.trim();
        if (!searchSku) return;

        setLoading(true);
        setError('');
        setProducts([]);

        try {
            const res = await axios.get(`${API_URL}/products`);

            if (res.status === 200) {
                const allData = res.data || [];
                // FRONTEND SZŰRÉS: Csak a karakterre pontosan megegyező cikkszámokat tartjuk meg
                const exactMatches = allData.filter(p => {
                    const productSku = String(p.cikkszam || p.Cikkszam || "").trim();
                    return productSku.toUpperCase() === searchSku.toUpperCase();
                });

                if (exactMatches.length > 0) {
                    setProducts(exactMatches);
                } else {
                    setError('Nincs pontos találat erre a cikkszámra.');
                }
            } else {
                setError('Nincs találat erre a cikkszámra.');
            }
        } catch (err) {
            console.error("Cikkszám keresési hiba:", err);
            setError('Hiba történt a szerverrel való kommunikáció során.');
        } finally {
            setLoading(false);
        }
    };

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

            if (res.status === 200) {
                alert('Termék a kosárba került!');
                window.dispatchEvent(new Event('cartUpdated'));
            } else {
                alert('Hiba történt a kosárba tételkor.');
            }
        } catch (err) {
            console.error("Kosár hiba:", err.response?.data || err);
            alert('Hiba történt a kosárba tételkor.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-slate-800 p-8 text-white">
                    <h2 className="text-xl font-bold uppercase tracking-widest">Gyorskeresés Cikkszámra</h2>
                    <p className="text-slate-400 text-sm mt-1">Ha tudja a pontos gyári kódot, itt azonnal megtalálja.</p>
                </div>

                <form onSubmit={handleSkuSearch} className="p-8 border-b">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={sku}
                            onChange={(e) => setSku(e.target.value)}
                            placeholder="Pl: 11217581008..."
                            className="flex-grow p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-orange-500 outline-none transition-all font-bold"
                        />
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="bg-orange-600 hover:bg-orange-700 text-white px-10 rounded-2xl font-bold transition-all disabled:opacity-50"
                        >
                            {loading ? 'KERESÉS...' : 'KERESÉS'}
                        </button>
                    </div>
                    {error && <p className="mt-3 text-red-500 text-sm font-semibold">{error}</p>}
                </form>

                <div className="p-8 bg-gray-50/30">
                    <div className="grid grid-cols-1 gap-4">
                        {products.length > 0 ? (
                            products.map((p) => (
                                <div key={p.id || p.Id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-orange-200 transition-colors">
                                    <div className="flex items-center gap-5">
                                        <img 
                                            src={getImageUrl(p)} 
                                            className="w-20 h-20 object-cover rounded-xl"
                                            alt={p.nev || p.Nev || "Termék kép"}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "https://placehold.co/400x300?text=Nincs+Kép";
                                            }}
                                        />
                                        <div>
                                            <div className="text-[10px] font-black text-orange-600 uppercase mb-1">{p.cikkszam || p.Cikkszam}</div>
                                            <h4 className="font-bold text-gray-900">{p.nev || p.Nev}</h4>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-black text-gray-900 mb-2">
                                            {Number(p.ar || p.Ar).toLocaleString()} Ft
                                        </div>
                                        <button 
                                            onClick={() => addToCart(p.id || p.Id)}
                                            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors"
                                        >
                                            KOSÁRBA
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            !loading && sku && <p className="text-center text-gray-400">Használja a keresőt a pontos találathoz.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CikkszamKereso;
