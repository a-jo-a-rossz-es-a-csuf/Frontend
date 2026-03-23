import React from 'react'

export default function Cikkszam() {
    const API_URL = 'http://localhost:5000/api';

        document.addEventListener('DOMContentLoaded', function() {
            checkLoginStatus();
            updateCartCount();
            
            document.getElementById('partNumber').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') searchByPartNumber();
            });
        });

        function checkLoginStatus() {
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            const loginLink = document.getElementById('loginLink');
            const logoutBtn = document.getElementById('logoutBtn');
            const userInfo = document.getElementById('userInfo');
            const adminLink = document.getElementById('adminLink');
            
            if (user) {
                userInfo.textContent = user.email;
                userInfo.classList.remove('hidden');
                loginLink.classList.add('hidden');
                logoutBtn.classList.remove('hidden');
                if (user.szerepkor === 'admin') adminLink.classList.remove('hidden');
            } else {
                loginLink.classList.remove('hidden');
                logoutBtn.classList.add('hidden');
                userInfo.classList.add('hidden');
            }
        }

        function logout() {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            window.location.reload();
        }

        async function updateCartCount() {
            let sessionId = localStorage.getItem('cartSessionId');
            if (!sessionId) {
                sessionId = 'sess_' + Math.random().toString(36).substr(2, 16);
                localStorage.setItem('cartSessionId', sessionId);
            }
            try {
                const response = await fetch(`${API_URL}/cart?action=get&session_id=${sessionId}`);
                const data = await response.json();
                if (data.success && data.items) {
                    let count = 0;
                    data.items.forEach(item => count += parseInt(item.mennyiseg));
                    document.getElementById('cart-count').textContent = count;
                }
            } catch (error) {}
        }

        async function searchByPartNumber() {
            const partNumber = document.getElementById('partNumber').value.trim();
            if (!partNumber) { 
                alert('Adjon meg cikkszámot!'); 
                return; 
            }
            
            const grid = document.getElementById('resultsGrid');
            const info = document.getElementById('resultsInfo');
            grid.innerHTML = '<p class="col-span-4 text-center py-8"><span class="text-gray-500">Keresés...</span></p>';
            
            try {
                const response = await fetch(`${API_URL}/products?action=search_cikkszam&cikkszam=${encodeURIComponent(partNumber)}`);
                const text = await response.text();
                
                let result;
                try {
                    result = JSON.parse(text);
                } catch (e) {
                    grid.innerHTML = '<p class="col-span-4 text-center text-red-500 py-8">Szerverhiba történt.</p>';
                    return;
                }
                
                if (result.success && result.products && result.products.length > 0) {
                    info.textContent = `${result.products.length} találat a(z) "${partNumber}" keresésre`;
                    info.classList.remove('hidden');
                    
                    grid.innerHTML = result.products.map(p => `
                        <div class="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
                            <div class="h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                                ${p.kep_url
                                    ? `<img src="${p.kep_url}" alt="${p.nev}" class="h-full w-full object-cover rounded-lg">`
                                    : `<svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                                    </svg>`}
                            </div>
                            <p class="text-xs text-red-600 font-mono mb-1">${p.cikkszam}</p>
                            <h3 class="font-medium text-gray-900 mb-1 line-clamp-2">${p.nev}</h3>
                            <p class="text-xs text-gray-500 mb-2">${p.kategoria || 'Alkatresz'}</p>
                            <div class="flex items-center justify-between">
                                <span class="text-xl font-bold text-red-600">${parseInt(p.ar).toLocaleString('hu-HU')} Ft</span>
                                <span class="text-xs ${p.keszlet > 0 ? 'text-green-600' : 'text-red-500'}">${p.keszlet > 0 ? 'Raktaron' : 'Nincs raktaron'}</span>
                            </div>
                            <button onclick="addToCart(${p.id})" class="w-full mt-3 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition ${p.keszlet <= 0 ? 'opacity-50 cursor-not-allowed' : ''}" ${p.keszlet <= 0 ? 'disabled' : ''}>
                                Kosarba
                            </button>
                        </div>
                    `).join('');
                } else {
                    info.classList.add('hidden');
                    grid.innerHTML = `
                        <div class="col-span-4 text-center py-12">
                            <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <p class="text-gray-500 text-lg">Nincs találat a(z) "${partNumber}" cikkszámra.</p>
                            <p class="text-gray-400 text-sm mt-2">Próbáljon meg egy másik cikkszámot vagy annak egy részét.</p>
                        </div>
                    `;
                }
            } catch (error) {
                grid.innerHTML = '<p class="col-span-4 text-center text-red-500 py-8">Hiba történt a keresés során.</p>';
            }
        }

        async function addToCart(productId) {
            let sessionId = localStorage.getItem('cartSessionId');
            if (!sessionId) {
                sessionId = 'sess_' + Math.random().toString(36).substr(2, 16);
                localStorage.setItem('cartSessionId', sessionId);
            }
            
            try {
                const response = await fetch(`${API_URL}/cart?action=add`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ session_id: sessionId, alkatresz_id: productId, mennyiseg: 1 })
                });
                const data = await response.json();
                if (data.success) { 
                    updateCartCount(); 
                    alert('Termék a kosárba került!'); 
                }
            } catch (e) { 
                alert('Hiba történt a kosárba rakáskor'); 
            }
        }
  return (
    <div>
        {/* <!-- SEARCH SECTION --> */}
    <section class="bg-white border-b-4 border-red-600 py-8">
        <div class="max-w-4xl mx-auto px-4">
            <div class="bg-gray-50 rounded-lg p-6">
                <h1 class="text-2xl font-bold text-gray-900 mb-4">Cikkszám alapú keresés</h1>
                <p class="text-gray-600 mb-6">Keressen OE, OEM vagy utángyártott cikkszám alapján</p>
                
                <div class="flex gap-2">
                    <input type="text" id="partNumber" placeholder="Pl.: BMW-FEKBETET-001, AUD-OLAJSZ-001" 
                        class="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-red-600"/>
                    <button onclick="searchByPartNumber()" class="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold transition">
                        Keresés
                    </button>
                </div>
                
                <div class="mt-4 text-sm text-gray-500">
                    <p>Tipp: Írja be a cikkszámot vagy annak egy részét. A rendszer az összes egyező terméket megjeleníti.</p>
                </div>
            </div>
        </div>
    </section>

    {/* <!-- Results --> */}
    <section class="py-8">
        <div class="max-w-7xl mx-auto px-4">
            <div id="resultsInfo" class="mb-4 text-gray-600 hidden"></div>
            <div id="resultsGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"></div>
        </div>
    </section>

    {/* <!-- FOOTER --> */}
    <footer class="bg-gray-900 text-white py-8">
        <div class="max-w-7xl mx-auto px-4 text-center">
            <p class="text-gray-400">&copy; 2025 AutoParts Pro. Minden jog fenntartva.</p>
        </div>
    </footer></div>
  )
}
