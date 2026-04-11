import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const StatCard = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
            </svg>
        </div>
        <div>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-black text-gray-900">{value}</p>
        </div>
    </div>
);

const Admin = () => {
    const API_URL = 'http://localhost:5000/api';
    const navigate = useNavigate();

    const [adminUser, setAdminUser] = useState(null);
    const [activeTab, setActiveTab] = useState('products');
    const [isFetchPending, setFetchPending] = useState(false);
    
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [supportTickets, setSupportTickets] = useState([]);
    const [stats, setStats] = useState({ termekek: 0, bevetel: 0, rendelesek: 0, felhasznalok: 0 });
    
    const [replyTexts, setReplyTexts] = useState({});
    
    const [showProductModal, setShowProductModal] = useState(false);
    const [productFormData, setProductFormData] = useState({ id: '', cikkszam: '', nev: '', ar: '', akcios_ar: '', keszlet: '', kategoriaId: '', gyarto: '' });

    const [showOrderModal, setShowOrderModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('adminUser') || 'null');
        if (user && user.szerepkor === 'admin') {
            setAdminUser(user);
            loadAllAdminData();
        } else {
            navigate('/');
        }
    }, []);

    const loadAllAdminData = async () => {
        setFetchPending(true);
        try {
            const [prodRes, orderRes, userRes, supportRes] = await Promise.all([
                axios.get(`${API_URL}/products`).catch(e => ({ data: [] })),
                axios.get(`${API_URL}/orders`).catch(e => ({ data: [] })),
                axios.get(`${API_URL}/admin`).catch(e => ({ data: [] })),
                axios.get(`${API_URL}/chat`).catch(e => ({ data: [] }))
            ]);

            setProducts(prodRes.data || []);
            setOrders(orderRes.data || []);
            setUsers(userRes.data || []);
            setSupportTickets(supportRes.data || []);
            
            setStats({
                termekek: (prodRes.data || []).length,
                bevetel: (orderRes.data || []).reduce((acc, order) => acc + (order.vegosszeg || order.vegsso_osszeg || 0), 0),
                rendelesek: (orderRes.data || []).length,
                felhasznalok: (userRes.data || []).length
            });

        } catch (error) {
            console.error("Hiba az adatok betöltésekor:", error);
        } finally {
            setFetchPending(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminUser');
        setAdminUser(null);
        navigate('/');
    };

    const deleteProduct = async (id) => {
        if (!window.confirm('Biztosan törölni szeretné ezt a terméket?')) return;
        try {
            const res = await axios.delete(`${API_URL}/products?id=${id}`);
            if (res.status === 200) {
                alert('Termék sikeresen törölve!');
                loadAllAdminData();
            } else {
                alert('Hiba törléskor.');
            }
        } catch (err) {
            console.error("Törlési hiba:", err);
            alert('Szerver hiba történt a törlés során.');
        }
    };

    const openProductModal = (product = null) => {
        if (product) {
            setProductFormData({
                id: product.id || product.Id,
                cikkszam: product.cikkszam || product.Cikkszam || '',
                nev: product.nev || product.Nev || '',
                ar: product.ar || product.Ar || '',
                akcios_ar: product.akcios_ar || product.AkciosAr || '',
                keszlet: product.keszlet || product.Keszlet || '',
                kategoriaId: product.kategoriaId || product.KategoriaId || '',
                gyarto: product.gyarto || product.Gyarto || ''
            });
        } else {
            setProductFormData({ id: '', cikkszam: '', nev: '', ar: '', akcios_ar: '', keszlet: '', kategoriaId: '', gyarto: '' });
        }
        setShowProductModal(true);
    };

    const openOrderModal = async (order) => {
        try {
            let tetelek = [];
            try {
                const tetelek_res = await axios.get(`${API_URL}/orders/${order.id}/items`).catch(() => ({ data: [] }));
                tetelek = tetelek_res.data || [];
            } catch (e) {
                console.log("Nincs rendelés tételek endpoint");
            }
            
            setSelectedOrder({
                ...order,
                tetelek: tetelek,
                vegosszeg: order.vegosszeg || order.Vegosszeg || 0,
                fizetesiMod: order.fizetesiMod || order.fizetesi_mod || order.FizetesiMod || 'Utánvét'
            });
            setShowOrderModal(true);
        } catch (err) {
            console.error(err);
            setSelectedOrder({
                ...order,
                tetelek: [],
                vegosszeg: order.vegosszeg || order.Vegosszeg || 0,
                fizetesiMod: 'Utánvét'
            });
            setShowOrderModal(true);
        }
    };

    const closeOrderModal = () => {
        setSelectedOrder(null);
        setShowOrderModal(false);
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        try {
            const productData = {
                Cikkszam: productFormData.cikkszam,
                Nev: productFormData.nev,
                Ar: parseFloat(productFormData.ar) || 0,
                AkciosAr: productFormData.akcios_ar ? parseFloat(productFormData.akcios_ar) : null,
                Keszlet: parseInt(productFormData.keszlet) || 0,
                KategoriaId: productFormData.kategoriaId ? parseInt(productFormData.kategoriaId) : null,
                Gyarto: productFormData.gyarto || null
            };
            
            let res;
            if (productFormData.id) {
                res = await axios.put(`${API_URL}/products/${productFormData.id}`, productData);
            } else {
                res = await axios.post(`${API_URL}/products`, productData);
            }

            if (res.status === 200 || res.status === 201) {
                alert(productFormData.id ? 'Termék sikeresen frissítve!' : 'Új termék sikeresen hozzáadva!');
                setShowProductModal(false);
                loadAllAdminData();
            } else {
                alert('Hiba a mentéskor.');
            }
        } catch (err) {
            console.error("Mentési hiba:", err);
            alert('Váratlan hiba történt a termék mentésekor: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleSendReply = async (ticketId) => {
        const valasz = replyTexts[ticketId];
        if (!valasz || !valasz.trim()) return;

        const adminId = adminUser?.id || 1;

        try {
            const res = await axios.put(`${API_URL}/chat/${ticketId}`, {
                adminValasz: valasz,
                adminId: adminId
            });

            if (res.status === 200) {
                alert('Válasz sikeresen elküldve!');
                setReplyTexts({ ...replyTexts, [ticketId]: '' });
                loadAllAdminData();
            } else {
                alert('Hiba a válaszadáskor.');
            }
        } catch (err) {
            console.error(err);
            alert('Szerver hiba történt a válaszadás során.');
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const res = await axios.patch(`${API_URL}/orders/${orderId}/status`, {
                ujStatusz: newStatus
            });
            
            if (res.status === 200) {
                loadAllAdminData(); 
            }
        } catch (err) {
            console.error("Hiba a státusz frissítésekor:", err);
            alert('Hiba történt a státusz frissítésekor.');
        }
    };

    const getStatusColor = (status) => {
        const s = status || 'fuggoben';
        const colors = {
            'fuggoben': 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300',
            'teljesitve': 'bg-green-50 text-green-700 border-green-200 hover:border-green-300',
            'torolve': 'bg-red-50 text-red-700 border-red-200 hover:border-red-300'
        };
        return colors[s] || colors['fuggoben'];
    };

    const handleInputChangeModal = (e) => {
        setProductFormData({ ...productFormData, [e.target.name]: e.target.value });
    };

    if (!adminUser) return null;

    return (
        <div className="bg-gray-50 min-h-screen text-gray-900">
            <nav className="bg-white border-b sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 flex gap-8 overflow-x-auto">
                    {[
                        { id: 'products', label: 'Termékek' },
                        { id: 'orders', label: 'Rendelések' },
                        { id: 'users', label: 'Felhasználók' },
                        { id: 'support', label: 'Ügyfélszolgálat' },
                        { id: 'stats', label: 'Statisztika' }
                    ].map((tab) => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-4 px-2 border-b-2 font-bold transition whitespace-nowrap ${activeTab === tab.id ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-4 sm:p-8">
                {isFetchPending ? (
                    <div className="flex justify-center p-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
                    </div>
                ) : (
                    <>
                        {activeTab === 'products' && (
                            <section>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-black">Termékek kezelése</h2>
                                    <button onClick={() => openProductModal()} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl font-bold shadow-md transition-all active:scale-95 flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                        Új termék
                                    </button>
                                </div>
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                                            <tr>
                                                <th className="p-4 font-bold">Cikkszám</th>
                                                <th className="p-4 font-bold">Név</th>
                                                <th className="p-4 font-bold">Gyártó</th>
                                                <th className="p-4 font-bold">Ár</th>
                                                <th className="p-4 font-bold">Készlet</th>
                                                <th className="p-4 font-bold text-right">Műveletek</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-sm">
                                            {products.map(p => (
                                                <tr key={p.id || p.Id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="p-4 font-mono text-gray-500">{p.cikkszam || p.Cikkszam}</td>
                                                    <td className="p-4 font-bold text-gray-900">{p.nev || p.Nev}</td>
                                                    <td className="p-4 text-gray-600">{p.gyarto || p.Gyarto || '-'}</td>
                                                    <td className="p-4 font-bold text-red-600">{Number(p.ar || p.Ar).toLocaleString()} Ft</td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded-md font-bold text-xs ${(p.keszlet || p.Keszlet) > 5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {p.keszlet || p.Keszlet} db
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <button onClick={() => openProductModal(p)} className="text-blue-600 hover:text-blue-800 font-bold mr-4 transition-colors">Szerkeszt</button>
                                                        <button onClick={() => deleteProduct(p.id || p.Id)} className="text-gray-400 hover:text-red-600 font-bold transition-colors">Törlés</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        )}

                        {activeTab === 'orders' && (
                            <section>
                                <h2 className="text-2xl font-black mb-6">Rendelések áttekintése</h2>
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                                            <tr>
                                                <th className="p-4 font-bold">Rendelésszám</th>
                                                <th className="p-4 font-bold">Vásárló</th>
                                                <th className="p-4 font-bold">Dátum</th>
                                                <th className="p-4 font-bold">Összeg</th>
                                                <th className="p-4 font-bold">Státusz</th>
                                                <th className="p-4 font-bold text-center">Műveletek</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-sm">
                                            {orders.map(o => (
                                                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="p-4 font-bold text-gray-900">{o.rendeles_szam || o.id}</td>
                                                    <td className="p-4 text-gray-600">{o.email || o.nev || 'Vendég'}</td>
                                                    <td className="p-4 text-gray-500">{new Date(o.letrehozva || o.datum).toLocaleDateString('hu-HU')}</td>
                                                    <td className="p-4 font-bold">{Number(o.vegosszeg || o.vegsso_osszeg).toLocaleString()} Ft</td>
                                                    <td className="p-4">
                                                        <select
                                                            value={o.statusz || 'fuggoben'}
                                                            onChange={(e) => handleStatusChange(o.id, e.target.value)}
                                                            className={`px-3 py-1.5 pr-8 rounded-xl text-[11px] font-black uppercase tracking-wider border-2 outline-none cursor-pointer transition-all focus:border-red-500 focus:ring-4 focus:ring-red-100 shadow-sm appearance-none ${getStatusColor(o.statusz || 'fuggoben')}`}
                                                            style={{
                                                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                                                backgroundRepeat: 'no-repeat',
                                                                backgroundPosition: 'right 0.5rem center',
                                                                backgroundSize: '1em 1em'
                                                            }}
                                                        >
                                                            <option value="fuggoben" className="text-gray-900 bg-white font-bold">Függőben</option>
                                                            <option value="teljesitve" className="text-green-700 bg-white font-bold">Teljesítve</option>
                                                            <option value="torolve" className="text-red-700 bg-white font-bold">Törölve</option>
                                                        </select>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <button 
                                                            onClick={() => openOrderModal(o)}
                                                            className="bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                        >
                                                            Részletek
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {orders.length === 0 && (
                                                <tr><td colSpan="6" className="p-8 text-center text-gray-400">Jelenleg nincs megjeleníthető rendelés.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        )}

                        {activeTab === 'users' && (
                            <section>
                                <h2 className="text-2xl font-black mb-6">Regisztrált Felhasználók</h2>
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                                            <tr>
                                                <th className="p-4 font-bold">ID</th>
                                                <th className="p-4 font-bold">Név</th>
                                                <th className="p-4 font-bold">Email</th>
                                                <th className="p-4 font-bold">Jogosultság</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-sm">
                                            {users.map(u => (
                                                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="p-4 text-gray-400 font-mono">#{u.id}</td>
                                                    <td className="p-4 font-bold text-gray-900">{u.vezeteknev} {u.keresztnev}</td>
                                                    <td className="p-4 text-gray-600">{u.email}</td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-1 rounded text-xs font-black uppercase ${u.szerepkor === 'admin' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                                                            {u.szerepkor || 'Vásárló'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {users.length === 0 && (
                                                <tr><td colSpan="4" className="p-8 text-center text-gray-400">Jelenleg nincsenek regisztrált felhasználók.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        )}

                        {activeTab === 'support' && (
                            <section>
                                <h2 className="text-2xl font-black mb-6">Ügyfélszolgálati Üzenetek</h2>
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="divide-y divide-gray-100">
                                        {supportTickets.length > 0 ? supportTickets.map(ticket => (
                                            <div key={ticket.id} className="p-6 hover:bg-gray-50 transition-colors">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xl">
                                                            {ticket.user?.vezeteknev ? ticket.user.vezeteknev.charAt(0).toUpperCase() : '?'}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-gray-900 text-lg">
                                                                {ticket.user?.vezeteknev ? `${ticket.user.vezeteknev} ${ticket.user.keresztnev}` : `Felhasználó #${ticket.userId}`}
                                                            </h4>
                                                            <p className="text-sm text-gray-500">{ticket.user?.email || 'Nincs email megadva'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex flex-col items-end gap-2">
                                                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                                                            {new Date(ticket.letrehozva || Date.now()).toLocaleString('hu-HU')}
                                                        </span>
                                                        <span className={`px-2 py-1 text-[10px] font-black uppercase rounded shadow-sm ${ticket.statusz === 'megvalaszolva' || ticket.adminValasz ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                            {ticket.statusz === 'megvalaszolva' || ticket.adminValasz ? 'Megválaszolva' : 'Várakozik'}      
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="bg-gray-100 p-4 rounded-xl border border-gray-200 text-gray-800 text-sm mb-4 relative">        
                                                    <p className="font-bold mb-1 text-xs text-gray-400 uppercase tracking-wider">Üzenet:</p>
                                                    <p className="whitespace-pre-wrap">{ticket.uzenet}</p>
                                                </div>

                                                {ticket.adminValasz ? (
                                                    <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-red-900 text-sm ml-8 relative shadow-inner">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <p className="font-black text-xs text-red-700 uppercase tracking-wider">Válaszod:</p>
                                                        </div>
                                                        <p className="whitespace-pre-wrap">{ticket.adminValasz}</p>
                                                    </div>
                                                ) : (
                                                    <div className="ml-8 mt-2">
                                                        <textarea 
                                                            className="w-full p-4 bg-white border border-gray-300 rounded-xl outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all text-sm resize-none shadow-sm"
                                                            rows="3"
                                                            placeholder="Írd ide a válaszod az ügyfélnek..."
                                                            value={replyTexts[ticket.id] || ''}
                                                            onChange={(e) => setReplyTexts({...replyTexts, [ticket.id]: e.target.value})}
                                                        ></textarea>
                                                        <div className="flex justify-end mt-3">
                                                            <button 
                                                                onClick={() => handleSendReply(ticket.id)}
                                                                disabled={!replyTexts[ticket.id] || !replyTexts[ticket.id].trim()}
                                                                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
                                                            >
                                                                Válasz küldése
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )) : (
                                            <div className="p-16 text-center">
                                                <p className="text-gray-500 font-bold text-lg">Nincsenek beérkezett üzenetek.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>
                        )}

                        {activeTab === 'stats' && (
                            <section>
                                <h2 className="text-2xl font-black mb-6">Műszerfal Statisztikák</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <StatCard title="Összes termék" value={stats.termekek || 0} icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    <StatCard title="Teljes bevétel" value={`${Number(stats.bevetel || 0).toLocaleString()} Ft`} icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    <StatCard title="Leadott rendelések" value={stats.rendelesek || 0} icon="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    <StatCard title="Regisztrált userek" value={stats.felhasznalok || 0} icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </div>
                            </section>
                        )}
                    </>
                )}
            </main>

            {/* Termék Modal */}
            {showProductModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
                        <div className="bg-gray-900 p-6 flex justify-between items-center text-white">
                            <h3 className="font-black text-xl">{productFormData.id ? 'Termék szerkesztése' : 'Új termék hozzáadása'}</h3>
                            <button onClick={() => setShowProductModal(false)} className="text-gray-400 hover:text-white transition-colors bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center">
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleSaveProduct} className="p-8 space-y-5">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Cikkszám</label>
                                <input required type="text" name="cikkszam" value={productFormData.cikkszam} onChange={handleInputChangeModal} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-500 focus:bg-white transition-colors" placeholder="Pl: BMW-3E90-FB01" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Termék Név</label>
                                <input required type="text" name="nev" value={productFormData.nev} onChange={handleInputChangeModal} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-500 focus:bg-white transition-colors" placeholder="Pl: Fékbetét garnitúra" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Ár (HUF)</label>
                                    <input required type="number" name="ar" value={productFormData.ar} onChange={handleInputChangeModal} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-500 focus:bg-white transition-colors" placeholder="0" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Akciós Ár (HUF)</label>
                                    <input type="number" name="akcios_ar" value={productFormData.akcios_ar} onChange={handleInputChangeModal} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-500 focus:bg-white transition-colors" placeholder="0 (nem kötelező)" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Készlet (DB)</label>
                                    <input required type="number" name="keszlet" value={productFormData.keszlet} onChange={handleInputChangeModal} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-500 focus:bg-white transition-colors" placeholder="0" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Kategória ID</label>
                                    <input type="number" name="kategoriaId" value={productFormData.kategoriaId} onChange={handleInputChangeModal} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-500 focus:bg-white transition-colors" placeholder="1-15" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Gyártó</label>
                                <input type="text" name="gyarto" value={productFormData.gyarto} onChange={handleInputChangeModal} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-red-500 focus:bg-white transition-colors" placeholder="Pl: TRW, Brembo" />
                            </div>
                            <div className="pt-4">
                                <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold p-4 rounded-xl shadow-md transition-all">
                                    {productFormData.id ? 'Változtatások mentése' : 'Termék hozzáadása'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Rendelés Részletek Modal */}
            {showOrderModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
                            <div>
                                <h3 className="text-2xl font-black">Rendelés #{selectedOrder.rendeles_szam || selectedOrder.id}</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Leadva: {new Date(selectedOrder.letrehozva || selectedOrder.datum).toLocaleString('hu-HU')}
                                </p>
                            </div>
                            <button onClick={closeOrderModal} className="text-gray-400 hover:text-red-600 transition-colors p-2 bg-white rounded-xl shadow-sm border border-gray-200">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Vásárló adatai</h4>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="font-bold text-gray-700">Név:</span> {selectedOrder.nev}</p>
                                        <p><span className="font-bold text-gray-700">Email:</span> <a href={`mailto:${selectedOrder.email}`} className="text-red-600 hover:underline">{selectedOrder.email}</a></p>
                                        <p><span className="font-bold text-gray-700">Telefon:</span> {selectedOrder.telefon || '-'}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Szállítás & Fizetés</h4>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="font-bold text-gray-700">Cím:</span> {selectedOrder.iranyitoszam} {selectedOrder.varos}, {selectedOrder.utca} {selectedOrder.hazszam || ''}</p>
                                        <p><span className="font-bold text-gray-700">Fizetési mód:</span> <span className="uppercase font-bold text-red-600">{selectedOrder.fizetesiMod || selectedOrder.fizetesi_mod || 'Utánvét'}</span></p>
                                    </div>
                                </div>
                            </div>

                            {selectedOrder.megjegyzes && (
                                <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl text-sm">
                                    <span className="font-bold text-yellow-800 block mb-1">Vásárló megjegyzése:</span>
                                    <p className="text-yellow-900">{selectedOrder.megjegyzes}</p>
                                </div>
                            )}

                            <div>
                                <h4 className="text-lg font-black mb-4 border-b border-gray-200 pb-2">Megrendelt termékek ({(selectedOrder.tetelek || []).length})</h4>
                                <div className="space-y-3">
                                    {selectedOrder.tetelek && selectedOrder.tetelek.length > 0 ? (
                                        selectedOrder.tetelek.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <span className="bg-gray-200 text-gray-700 font-bold w-8 h-8 rounded-lg flex items-center justify-center text-sm">{item.mennyiseg}x</span>
                                                    <div>
                                                        <p className="font-bold text-sm">{item.termekNev || item.TermekNev || `Termék #${item.alkatreszId || item.olajId}`}</p>
                                                        <p className="text-xs text-gray-500">{Number(item.egysegar || item.Egysegar).toLocaleString()} Ft/db</p>
                                                    </div>
                                                </div>
                                                <span className="font-black">{Number(item.osszeg || item.Osszeg).toLocaleString()} Ft</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">Nincsenek tételadatok ehhez a rendeléshez.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-900 text-white flex justify-between items-center">
                            <span className="font-bold text-gray-400 uppercase tracking-wider text-sm">Végösszeg</span>
                            <span className="text-2xl font-black text-white">{Number(selectedOrder.vegosszeg || selectedOrder.vegsso_osszeg).toLocaleString()} Ft</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;
