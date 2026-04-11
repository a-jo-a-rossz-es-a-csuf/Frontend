import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Bejelentkezes = () => {
    const API_URL = 'http://localhost:5000/api';
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        
        if (token && user) {
            setMessage({ text: 'Már be van jelentkezve! Átirányítás...', type: 'success' });
            setTimeout(() => navigate('/'), 1500);
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const response = await axios.post(`${API_URL}/login`, {
                email: formData.email,
                password: formData.password
            });

            if (response.data.success) {
                setMessage({ text: 'Sikeres bejelentkezés!', type: 'success' });
                
                localStorage.setItem('authToken', response.data.token);
                const userToSave = {
                    ...response.data.user,
                    elsoVasarolasKedvezmeny: response.data.user.elsoVasarolasKedvezmeny || response.data.user.elso_vasarolas_kedvezmeny
                };
                localStorage.setItem('user', JSON.stringify(userToSave));
                
                if (userToSave.szerepkor === 'admin') {
                    localStorage.setItem('adminUser', JSON.stringify(userToSave));
                }

                setTimeout(() => {
                    window.location.href = '/'; 
                }, 1000);
            } else {
                setMessage({ text: response.data.message || 'Helytelen adatok!', type: 'error' });
            }
        } catch (error) {
            console.error("Login hiba:", error);
            setMessage({ 
                text: error.response?.data?.message || 'Hiba történt a szerverrel való kapcsolat során.', 
                type: 'error' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 uppercase tracking-tight">
                    Bejelentkezés
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Vagy <Link to="/register" className="font-medium text-red-600 hover:text-red-500 underline underline-offset-4">regisztráljon új fiókot</Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border-t-4 border-red-600">
                    
                    {/* Üzenet visszajelzés */}
                    {message.text && (
                        <div className={`mb-6 p-4 rounded-lg text-sm font-medium border ${
                            message.type === 'success' 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                            {message.text}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">Email cím</label>
                            <input 
                                id="email" 
                                type="email" 
                                required 
                                value={formData.email}
                                onChange={handleChange}
                                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all placeholder-gray-400"
                                placeholder="pelda@email.hu"
                            />
                        </div>

                        {/* Jelszó */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">Jelszó</label>
                            <div className="relative">
                                <input 
                                    id="password" 
                                    type={showPassword ? "text" : "password"} 
                                    required 
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all placeholder-gray-400 pr-12"
                                    placeholder="••••••••"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-red-600 transition-colors"
                                >
                                    {showPassword ? (
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                        </svg>
                                    ) : (
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all uppercase tracking-widest disabled:opacity-50"
                            >
                                {isLoading ? 'Feldolgozás...' : 'Bejelentkezés'}
                            </button>
                        </div>
                    </form>

                    {/* Segítség */}
                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-400 italic">
                            Problémája van a belépéssel? Keressen minket:<br/>
                            <span className="text-gray-600 font-semibold">+36 30 123 4567</span> | <span className="text-gray-600 font-semibold">info@autoparts.hu</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Bejelentkezes;
