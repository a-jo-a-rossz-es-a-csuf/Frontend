import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
    const API_URL = 'http://localhost:5000/api';
    const navigate = useNavigate();

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        terms: false
    });

    const [status, setStatus] = useState({ loading: false, message: '', type: '' });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validációk
        if (form.password !== form.confirmPassword) {
            return setStatus({ loading: false, message: 'A jelszavak nem egyeznek!', type: 'error' });
        }
        if (!form.terms) {
            return setStatus({ loading: false, message: 'El kell fogadnia a feltételeket!', type: 'error' });
        }

        setStatus({ loading: true, message: '', type: '' });

        try {
            // Itt a javított rész: a végpont /register, és a jelszót "password" néven küldjük
            const res = await axios.post(`${API_URL}/register`, {
                vezeteknev: form.lastName,
                keresztnev: form.firstName,
                email: form.email,
                telefon: form.phone,
                password: form.password
            });

            if (res.data.success) {
                setStatus({ loading: false, message: 'Sikeres regisztráció! Átirányítás...', type: 'success' });
                setTimeout(() => navigate('/bejelentkezes'), 2000);
            } else {
                setStatus({ loading: false, message: res.data.message || 'Hiba történt.', type: 'error' });
            }
        } catch (err) {
            // Ha a backend pl. Conflict-ot (409) ad vissza (foglalt email), azt itt kapjuk el
            const errorMessage = err.response?.data?.error || 'Szerver hiba történt. Próbálja később!';
            setStatus({ loading: false, message: errorMessage, type: 'error' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                
                {/* Header Dekoráció */}
                <div className="bg-emerald-600 h-2 w-full"></div>
                
                <div className="p-8">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Fiók létrehozása</h2>
                        <p className="mt-2 text-gray-500 text-sm">Csatlakozzon az AutoParts Pro közösségéhez</p>
                    </div>

                    {status.message && (
                        <div className={`mb-6 p-4 rounded-xl text-sm font-bold ${
                            status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                            {status.message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1">Vezetéknév</label>
                                <input name="lastName" type="text" required value={form.lastName} onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1">Keresztnév</label>
                                <input name="firstName" type="text" required value={form.firstName} onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1">E-mail cím</label>
                            <input name="email" type="email" required value={form.email} onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1">Telefonszám</label>
                            <input name="phone" type="tel" value={form.phone} onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1">Jelszó</label>
                                <input name="password" type="password" required value={form.password} onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1">Jelszó újra</label>
                                <input name="confirmPassword" type="password" required value={form.confirmPassword} onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition" />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <input name="terms" type="checkbox" checked={form.terms} onChange={handleChange}
                                className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500" />
                            <label className="text-xs text-gray-500">
                                Elfogadom az <Link to="/aszf" className="text-emerald-600 font-bold hover:underline">Általános Szerződési Feltételeket</Link>
                            </label>
                        </div>

                        <button type="submit" disabled={status.loading}
                            className="w-full bg-gray-900 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black transition-all active:scale-95 shadow-lg disabled:opacity-50">
                            {status.loading ? 'FELDOLGOZÁS...' : 'REGISZTRÁCIÓ'}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm">
                        <span className="text-gray-500">Már van fiókja?</span>
                        <Link to="/bejelentkezes" className="ml-2 text-emerald-600 font-black hover:underline uppercase tracking-tighter">Bejelentkezés</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
