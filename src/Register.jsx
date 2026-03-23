import React, { useState } from 'react'

export default function Register() {
  const API_URL = 'http://localhost:5000/api';
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    terms: false
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setMessage('A jelszavak nem egyeznek!');
      setMessageType('error');
      return;
    }
    setLoading(true);
    setMessage('');
    setMessageType('');
    try {
      const response = await fetch(`${API_URL}/auth?action=register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vezeteknev: form.firstName,
          keresztnev: form.lastName,
          email: form.email,
          telefon: form.phone,
          jelszo: form.password
        })
      });
      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        setMessage('Szerver hiba! A válasz nem JSON formátumú. Ellenőrizd a PHP fájlokat.');
        setMessageType('error');
        setLoading(false);
        return;
      }
      if (result.success) {
        setMessage('Sikeres regisztráció! Átirányítás a bejelentkezéshez...');
        setMessageType('success');
        setTimeout(() => {
          window.location.href = '/bejelentkezes';
        }, 2000);
      } else {
        setMessage(result.error || 'Hiba történt a regisztráció során');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Kapcsolódási hiba! Ellenőrizd:\n1) XAMPP Apache és MySQL fut-e\n2) Az api mappa a htdocs/autoparts/api helyen van-e\n3) Az adatbázis importálva van-e');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* REGISTER SECTION */}
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 py-12 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Regisztráció</h2>
            <p className="text-gray-600">Hozzon létre új fiókot</p>
          </div>

          {/* Error/Success Messages */}
          {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${messageType === 'success' ? 'bg-green-100 text-green-700 border border-green-400' : 'bg-red-100 text-red-700 border border-red-400'}`}>{message}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">Vezetéknév</label>
                <input type="text" id="firstName" name="firstName" value={form.firstName} onChange={handleChange} placeholder="Kovács" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent" />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">Keresztnév</label>
                <input type="text" id="lastName" name="lastName" value={form.lastName} onChange={handleChange} placeholder="János" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent" />
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email cím</label>
              <input type="email" id="email" name="email" value={form.email} onChange={handleChange} placeholder="pelda@email.hu" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent" />
            </div>
            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Telefonszám</label>
              <input type="tel" id="phone" name="phone" value={form.phone} onChange={handleChange} placeholder="+36 30 123 4567" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent" />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Jelszó</label>
              <input type="password" id="password" name="password" value={form.password} onChange={handleChange} placeholder="Minimum 6 karakter" required minLength={6} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent" />
            </div>
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Jelszó megerősítése</label>
              <input type="password" id="confirmPassword" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Jelszó újra" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent" />
            </div>
            <div className="flex items-start gap-2 mb-4">
              <input type="checkbox" id="terms" name="terms" checked={form.terms} onChange={handleChange} className="rounded text-green-600 mt-1" required />
              <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                Elfogadom az <a href="#" className="text-green-600 hover:underline">Általános Szerződési Feltételeket</a>
              </label>
            </div>
            <button type="submit" id="registerBtn" className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition-colors" disabled={loading}>
              {loading ? 'Regisztráció...' : 'Regisztráció'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-gray-600">Már van fiókja?</span>
            <a href="/bejelentkezes" className="text-green-600 font-medium hover:underline ml-1">Bejelentkezés</a>
          </div>
        </div>
      </main>
      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400 text-sm">&copy; 2025 AutoParts Pro. Minden jog fenntartva.</p>
        </div>
      </footer>
    </div>
  );
}
