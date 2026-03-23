import React from 'react'

export default function Motor() {
    const API_URL = 'http://localhost:5000/api';
        let currentModellId = null;
        let allProducts = [];

        function getUserId() {
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            return user ? user.id : null;
        }

        document.addEventListener('DOMContentLoaded', function() {
            checkLoginStatus();
            updateCartCount();
            loadBrands();
            
            document.getElementById('brandSelect').addEventListener('change', function() {
                if (this.value) loadModels(this.value);
                else resetSelects(['modelSelect', 'yearSelect', 'motorSelect']);
            });
            
            document.getElementById('modelSelect').addEventListener('change', function() {
                if (this.value) {
                    currentModellId = this.value;
                    loadYearsAndMotors(this.value);
                } else {
                    resetSelects(['yearSelect', 'motorSelect']);
                }
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
            const userId = getUserId();
            const cartCount = document.getElementById('cart-count');
            
            if (!userId) {
                cartCount.textContent = '0';
                return;
            }
            
            try {
                const response = await fetch(`${API_URL}/cart?action=get&user_id=${userId}`);
                const data = await response.json();
                if (data.success && data.items) {
                    let count = 0;
                    data.items.forEach(item => count += parseInt(item.mennyiseg));
                    cartCount.textContent = count;
                }
            } catch (error) {
                cartCount.textContent = '0';
            }
        }

        function resetSelects(ids) {
            ids.forEach(id => {
                const s = document.getElementById(id);
                s.innerHTML = '<option value="">Először válasszon ' + (id === 'modelSelect' ? 'márkát' : 'modellt') + '</option>';
                s.disabled = true;
            });
        }

        function showStatus(msg, type) {
            const d = document.getElementById('statusMessage');
            d.textContent = msg;
            d.className = `mb-4 p-3 rounded-lg text-sm ${type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;
            d.classList.remove('hidden');
        }

        async function loadBrands() {
            try {
                const response = await fetch(`${API_URL}/cars?action=markak&tipus=motor`);
                const result = await response.json();
                const select = document.getElementById('brandSelect');
                if (result.success && result.data) {
                    select.innerHTML = '<option value="">Válasszon márkát</option>';
                    result.data.forEach(b => select.innerHTML += `<option value="${b.id}">${b.nev}</option>`);
                }
            } catch (e) { showStatus('Kapcsolódási hiba', 'error'); }
        }

        async function loadModels(markaId) {
            const s = document.getElementById('modelSelect');
            s.innerHTML = '<option value="">Betöltés...</option>';
            s.disabled = false;
            resetSelects(['yearSelect', 'motorSelect']);
            
            try {
                const response = await fetch(`${API_URL}/cars?action=modellek&marka_id=${markaId}`);
                const result = await response.json();
                if (result.success && result.data) {
                    s.innerHTML = '<option value="">Válasszon modellt</option>';
                    result.data.forEach(m => {
                        const name = m.generacio ? `${m.modell_nev} ${m.generacio}` : m.modell_nev;
                        s.innerHTML += `<option value="${m.id}" data-start="${m.evjarat_tol}" data-end="${m.evjarat_ig || 2025}">${name} (${m.evjarat_tol}-${m.evjarat_ig || 'napjainkig'})</option>`;
                    });
                }
            } catch (e) { showStatus('Hiba', 'error'); }
        }

        async function loadYearsAndMotors(modellId) {
            const yearS = document.getElementById('yearSelect');
            const motorS = document.getElementById('motorSelect');
            const opt = document.getElementById('modelSelect').selectedOptions[0];
            
            if (opt && opt.dataset.start) {
                const start = parseInt(opt.dataset.start), end = parseInt(opt.dataset.end);
                yearS.innerHTML = '<option value="">Válasszon évjáratot</option>';
                for (let y = end; y >= start; y--) yearS.innerHTML += `<option value="${y}">${y}</option>`;
                yearS.disabled = false;
            }

            try {
                const response = await fetch(`${API_URL}/cars?action=motorok&modell_id=${modellId}`);
                const result = await response.json();
                motorS.innerHTML = '<option value="">Válasszon motort</option>';
                if (result.success && result.data) {
                    result.data.forEach(m => motorS.innerHTML += `<option value="${m.id}">${m.hengerurtartalom} cm³ ${m.teljesitmeny_le} LE (${m.motor_kod})</option>`);
                    motorS.disabled = false;
                }
            } catch (e) {}
        }

        async function searchProducts() {
            if (!currentModellId) { alert('Válasszon modellt!'); return; }
            try {
                const response = await fetch(`${API_URL}/products?action=search&modell_id=${currentModellId}&tipus=motor`);
                const result = await response.json();
                if (result.success) { allProducts = result.products || []; displayProducts(); }
            } catch (e) { showStatus('Hiba', 'error'); }
        }

        function displayProducts() {
            const grid = document.getElementById('productsGrid');
            document.getElementById('resultsInfo').classList.remove('hidden');
            document.getElementById('resultsCount').textContent = allProducts.length;
            
            if (!allProducts.length) { grid.innerHTML = '<p class="col-span-4 text-center text-gray-500 py-8">Nincs találat.</p>'; return; }
            
            grid.innerHTML = allProducts.map(p => `
                <div class="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
                    <div class="h-40 bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                        ${p.kep_url
                            ? `<img src="${p.kep_url}" alt="${p.nev}" class="h-full w-full object-cover rounded-lg">`
                            : `<svg class="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>`}
                    </div>
                    <p class="text-xs text-gray-500 mb-1">${p.cikkszam}</p>
                    <h3 class="font-medium text-gray-900 mb-2">${p.nev}</h3>
                    <span class="text-xl font-bold text-orange-500">${parseInt(p.akcios_ar || p.ar).toLocaleString('hu-HU')} Ft</span>
                    <button onclick="addToCart(${p.id})" class="w-full mt-3 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium">Kosarba</button>
                </div>
            `).join('');
        }

        async function addToCart(productId) {
            const userId = getUserId();
            
            if (!userId) {
                alert('A kosárba helyezéshez be kell jelentkezni!');
                window.location.href = 'bejelentkezes.html?redirect=motor.html';
                return;
            }
            
            try {
                const response = await fetch(`${API_URL}/cart?action=add`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: userId, alkatresz_id: productId, mennyiseg: 1 })
                });
                const data = await response.json();
                if (data.success) { updateCartCount(); alert('Kosárba téve!'); }
            } catch (e) { alert('Hiba'); }
        }
  return (
    <div>
         {/* <!-- SEARCH SECTION --> */}
    <section class="bg-white border-b-4 border-orange-500 py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="bg-gray-50 rounded-lg p-6">
                <div class="flex items-center gap-3 mb-6">
                    <div class="bg-orange-500 p-3 rounded-lg">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                    </div>
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900">Motorkerékpár alkatrész kereső</h1>
                        <p class="text-gray-600">Honda és Yamaha alkatrészek</p>
                    </div>
                </div>

                <div id="statusMessage" class="hidden mb-4 p-3 rounded-lg text-sm"></div>

                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Márka:</label>
                        <select id="brandSelect" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                            <option value="">Válasszon márkát</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Modell:</label>
                        <select id="modelSelect" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" disabled>
                            <option value="">Először válasszon márkát</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Évjárat:</label>
                        <select id="yearSelect" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" disabled>
                            <option value="">Először válasszon modellt</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Motor:</label>
                        <select id="motorSelect" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" disabled>
                            <option value="">Először válasszon modellt</option>
                        </select>
                    </div>
                </div>

                <div class="mt-6 flex justify-center">
                    <button onclick="searchProducts()" class="bg-orange-500 hover:bg-orange-600 text-white px-12 py-3 rounded-lg font-bold transition-colors">
                        Alkatrészek keresése
                    </button>
                </div>
            </div>
        </div>
    </section>

    {/* <!-- Products Section --> */}
    <section class="py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div id="resultsInfo" class="hidden mb-6">
                <h2 class="text-xl font-bold text-gray-900">Találatok: <span id="resultsCount">0</span> termék</h2>
            </div>
            <div id="productsGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"></div>
        </div>
    </section>

    <footer class="bg-gray-900 text-white py-8">
        <div class="max-w-7xl mx-auto px-4 text-center">
            <p class="text-gray-400">&copy; 2025 AutoParts Pro. Minden jog fenntartva.</p>
        </div>
    </footer></div>
  )
}
