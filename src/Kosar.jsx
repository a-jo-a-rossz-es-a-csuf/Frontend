import React from 'react'

export default function Kosar() {

    const API_URL = 'http://localhost:5000/api';
    let currentUser = null;

    function getUserId() {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        return user ? user.id : null;
    }

    document.addEventListener('DOMContentLoaded', function () {
        checkLoginStatus();
        loadCart();
    });

    function checkLoginStatus() {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        currentUser = user;

        const loginLink = document.getElementById('loginLink');
        const logoutBtn = document.getElementById('logoutBtn');
        const userInfo = document.getElementById('userInfo');
        const loginWarning = document.getElementById('loginWarning');
        const adminLink = document.getElementById('adminLink');

        if (user) {
            loginLink.classList.add('hidden');
            logoutBtn.classList.remove('hidden');
            userInfo.textContent = user.email;
            userInfo.classList.remove('hidden');
            loginWarning.classList.add('hidden');

            // Pre-fill form
            const nev = ((user.vezeteknev || '') + ' ' + (user.keresztnev || '')).trim();
            document.getElementById('orderName').value = nev || '';
            document.getElementById('orderEmail').value = user.email || '';
            document.getElementById('orderPhone').value = user.telefon || '';

            if (user.szerepkor === 'admin') {
                adminLink.classList.remove('hidden');
            }
        } else {
            loginLink.classList.remove('hidden');
            logoutBtn.classList.add('hidden');
            userInfo.classList.add('hidden');
            loginWarning.classList.remove('hidden');

            // Kosár üres ha nincs bejelentkezve
            renderCart([], 0);
        }
    }

    function logout() {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.reload();
    }

    function handleCheckout() {
        if (!currentUser) {
            alert('A rendelés leadásához kérjük, jelentkezzen be!');
            window.location.href = 'bejelentkezes.html?redirect=kosar.html';
            return;
        }
        showCheckout();
    }

    async function loadCart() {
        const userId = getUserId();

        if (!userId) {
            renderCart([], 0);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/cart?action=get&user_id=${userId}`);
            const data = await response.json();

            if (data.success) {
                renderCart(data.items || [], data.total || 0);
            } else {
                renderCart([], 0);
            }
        } catch (error) {
            console.error('Hiba a kosár betöltésekor:', error);
            renderCart([], 0);
        }
    }

    function renderCart(items, total) {
        const container = document.getElementById('cartItems');
        const cartCount = document.getElementById('cart-count');
        const userId = getUserId();

        if (!userId) {
            container.innerHTML = `
                    <div class="text-center py-8">
                        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                        </svg>
                        <p class="text-gray-500 mb-4">A kosár megtekintéséhez jelentkezzen be</p>
                        <a href="bejelentkezes.html" class="text-red-600 hover:text-red-700 font-medium">Bejelentkezés</a>
                    </div>
                `;
            cartCount.textContent = '0';
            document.getElementById('checkoutBtn').disabled = true;
            return;
        }

        if (!items || items.length === 0) {
            container.innerHTML = `
                    <div class="text-center py-8">
                        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                        </svg>
                        <p class="text-gray-500 mb-4">A kosár üres</p>
                        <a href="szemely.html" class="text-red-600 hover:text-red-700 font-medium">Böngésszen termékeink között</a>
                    </div>
                `;
            cartCount.textContent = '0';
            document.getElementById('checkoutBtn').disabled = true;
            return;
        }

        let html = '<div class="space-y-4">';
        let totalItems = 0;

        items.forEach(item => {
            totalItems += parseInt(item.mennyiseg);
            html += `
                    <div class="p-4 border border-gray-200 rounded-lg">
                        <div class="flex items-start gap-3 sm:gap-4">
                            <div class="w-14 h-14 sm:w-20 sm:h-20 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                <svg class="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                                </svg>
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-start justify-between gap-2">
                                    <div class="min-w-0">
                                        <h3 class="font-medium text-sm sm:text-base truncate">${item.nev}</h3>
                                        <p class="text-xs sm:text-sm text-gray-500 truncate">${item.cikkszam || ''} | ${item.gyarto || ''}</p>
                                    </div>
                                    <button onclick="removeItem(${item.id})" class="p-1.5 text-gray-400 hover:text-red-600 shrink-0">
                                        <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                        </svg>
                                    </button>
                                </div>
                                <div class="flex items-center justify-between mt-2 flex-wrap gap-2">
                                    <p class="text-red-600 font-bold text-sm sm:text-base">${parseInt(item.ar).toLocaleString('hu-HU')} Ft</p>
                                    <div class="flex items-center gap-2">
                                        <button onclick="updateQuantity(${item.id}, ${item.mennyiseg - 1})" class="w-7 h-7 sm:w-8 sm:h-8 border border-gray-300 rounded hover:bg-gray-100 text-sm">-</button>
                                        <span class="w-6 sm:w-8 text-center text-sm">${item.mennyiseg}</span>
                                        <button onclick="updateQuantity(${item.id}, ${item.mennyiseg + 1})" class="w-7 h-7 sm:w-8 sm:h-8 border border-gray-300 rounded hover:bg-gray-100 text-sm">+</button>
                                    </div>
                                    <p class="font-bold text-sm sm:text-base">${parseInt(item.osszeg).toLocaleString('hu-HU')} Ft</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
        });

        html += '</div>';
        container.innerHTML = html;

        cartCount.textContent = totalItems;
        document.getElementById('subtotal').textContent = parseInt(total).toLocaleString('hu-HU') + ' Ft';
        document.getElementById('totalPrice').textContent = (parseInt(total) + 1490).toLocaleString('hu-HU') + ' Ft';
        document.getElementById('checkoutBtn').disabled = false;
    }

    async function updateQuantity(cartId, quantity) {
        const userId = getUserId();
        if (!userId) return;

        if (quantity < 1) {
            removeItem(cartId);
            return;
        }
        try {
            await fetch(`${API_URL}/cart?action=update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart_id: cartId, mennyiseg: quantity, user_id: userId })
            });
            loadCart();
        } catch (error) {
            console.error('Hiba:', error);
        }
    }

    async function removeItem(cartId) {
        const userId = getUserId();
        if (!userId) return;

        try {
            await fetch(`${API_URL}/cart?action=remove`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart_id: cartId, user_id: userId })
            });
            loadCart();
        } catch (error) {
            console.error('Hiba:', error);
        }
    }

    function showCheckout() {
        document.getElementById('checkoutForm').classList.remove('hidden');
        document.getElementById('checkoutForm').scrollIntoView({ behavior: 'smooth' });
    }

    function hideCheckout() {
        document.getElementById('checkoutForm').classList.add('hidden');
    }

    // ===== KARTYA FIZETES FUGGVENYEK =====

    function toggleCardForm() {
        const isCard = document.querySelector('input[name="payment"]:checked').value === 'kartya';
        const section = document.getElementById('cardFormSection');
        if (isCard) {
            section.classList.remove('hidden');
            section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            section.classList.add('hidden');
        }
        // Active style for selected option
        document.querySelectorAll('.payment-option').forEach(opt => {
            opt.classList.remove('border-red-500', 'bg-red-50');
            opt.classList.add('border-transparent');
        });
        const active = document.querySelector('input[name="payment"]:checked').closest('.payment-option');
        if (active) {
            active.classList.remove('border-transparent');
            active.classList.add('border-red-500', 'bg-red-50');
        }
    }

    function toggleBillingAddress() {
        const same = document.getElementById('sameBillingAddress').checked;
        document.getElementById('billingAddressSection').classList.toggle('hidden', same);
    }

    function toggleCvvVisibility() {
        const input = document.getElementById('cardCvv');
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
    }

    function formatCardNumber(input) {
        let v = input.value.replace(/\D/g, '').substring(0, 16);
        let formatted = v.replace(/(.{4})/g, '$1 ').trim();
        input.value = formatted;
        // Detect card type
        detectCardType(v);
    }

    function detectCardType(num) {
        const icon = document.getElementById('cardTypeIcon');
        icon.classList.remove('hidden');
        if (/^4/.test(num)) {
            icon.className = 'absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700';
            icon.textContent = 'VISA';
        } else if (/^5[1-5]/.test(num) || /^2[2-7]/.test(num)) {
            icon.className = 'absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold px-2 py-0.5 rounded bg-red-100 text-red-700';
            icon.textContent = 'MC';
        } else if (/^3[47]/.test(num)) {
            icon.className = 'absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold px-2 py-0.5 rounded bg-green-100 text-green-700';
            icon.textContent = 'AMEX';
        } else if (num.length === 0) {
            icon.classList.add('hidden');
        } else {
            icon.className = 'absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600';
            icon.textContent = 'KARTYA';
        }
    }

    function formatExpiry(input) {
        let v = input.value.replace(/\D/g, '').substring(0, 4);
        if (v.length >= 2) {
            v = v.substring(0, 2) + '/' + v.substring(2);
        }
        input.value = v;
    }

    function validateField(fieldId) {
        const el = document.getElementById(fieldId);
        const err = document.getElementById(fieldId + 'Error');
        if (!el || !err) return true;
        err.classList.add('hidden');
        let value = el.value.trim();
        let valid = true;

        switch (fieldId) {
            case 'cardNumber': {
                const digits = value.replace(/\s/g, '');
                if (digits.length < 13 || digits.length > 19) {
                    err.textContent = 'A kartyaszam 13-19 szamjegyet kell tartalmazzon';
                    valid = false;
                } else if (!luhnCheck(digits)) {
                    err.textContent = 'Ervenytelen kartyaszam';
                    valid = false;
                }
                break;
            }
            case 'cardName': {
                if (value.length < 3) {
                    err.textContent = 'Adja meg a kartyatulajdonos nevet';
                    valid = false;
                } else if (!/^[A-Z\s\-\.]+$/.test(value)) {
                    err.textContent = 'Csak betuk, szokozok es kotojel megengedett';
                    valid = false;
                }
                break;
            }
            case 'cardExpiry': {
                if (!/^\d{2}\/\d{2}$/.test(value)) {
                    err.textContent = 'Formatum: HH/EE (pl. 03/27)';
                    valid = false;
                } else {
                    const [m, y] = value.split('/').map(Number);
                    const now = new Date();
                    const expYear = 2000 + y;
                    const expMonth = m;
                    if (m < 1 || m > 12) {
                        err.textContent = 'Ervenytelen honap (01-12)';
                        valid = false;
                    } else if (expYear < now.getFullYear() || (expYear === now.getFullYear() && expMonth < now.getMonth() + 1)) {
                        err.textContent = 'A kartya lejart';
                        valid = false;
                    }
                }
                break;
            }
            case 'cardCvv': {
                if (!/^\d{3,4}$/.test(value)) {
                    err.textContent = 'A CVV 3 vagy 4 szamjegy';
                    valid = false;
                }
                break;
            }
        }
        if (!valid) err.classList.remove('hidden');
        el.classList.toggle('border-red-500', !valid);
        el.classList.toggle('border-gray-300', valid);
        return valid;
    }

    // Luhn algorithm - kartyaszam ellenorzes
    function luhnCheck(num) {
        let sum = 0;
        let alt = false;
        for (let i = num.length - 1; i >= 0; i--) {
            let n = parseInt(num[i], 10);
            if (alt) {
                n *= 2;
                if (n > 9) n -= 9;
            }
            sum += n;
            alt = !alt;
        }
        return sum % 10 === 0;
    }

    function validateAllCardFields() {
        const f1 = validateField('cardNumber');
        const f2 = validateField('cardName');
        const f3 = validateField('cardExpiry');
        const f4 = validateField('cardCvv');

        // Szamlazasi cim ellenorzes ha kulonbozo
        if (!document.getElementById('sameBillingAddress').checked) {
            const bz = document.getElementById('billingZip').value.trim();
            const bc = document.getElementById('billingCity').value.trim();
            const bs = document.getElementById('billingStreet').value.trim();
            if (!bz || !bc || !bs) {
                document.getElementById('orderError').textContent = 'Kerem toltse ki a szamlazasi cim osszes mezot!';
                document.getElementById('orderError').classList.remove('hidden');
                return false;
            }
        }
        return f1 && f2 && f3 && f4;
    }

    // Init default selected style
    document.addEventListener('DOMContentLoaded', function () {
        setTimeout(toggleCardForm, 100);
    });

    async function submitOrder(event) {
        event.preventDefault();
        const userId = getUserId();
        if (!userId) {
            alert('A rendeléshez be kell jelentkezni!');
            return;
        }

        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

        // Kartyas fizetes validacio
        if (paymentMethod === 'kartya') {
            document.getElementById('orderError').classList.add('hidden');
            if (!validateAllCardFields()) {
                return;
            }
        }

        const orderData = {
            user_id: userId,
            nev: document.getElementById('orderName').value,
            email: document.getElementById('orderEmail').value,
            telefon: document.getElementById('orderPhone').value,
            iranyitoszam: document.getElementById('orderZip').value,
            varos: document.getElementById('orderCity').value,
            utca: document.getElementById('orderStreet').value,
            hazszam: document.getElementById('orderHouse').value,
            megjegyzes: document.getElementById('orderNote').value,
            fizetes_mod: paymentMethod
        };

        try {
            const response = await fetch(`${API_URL}/orders?action=create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            const responseText = await response.text();
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                document.getElementById('orderError').textContent = 'Szerver hiba: ' + responseText.substring(0, 200);
                document.getElementById('orderError').classList.remove('hidden');
                return;
            }

            if (data.success) {
                document.getElementById('orderNumber').textContent = data.rendeles_szam;
                document.getElementById('checkoutForm').classList.add('hidden');
                document.querySelector('.grid').classList.add('hidden');

                // Kartyas fizetes eseten frissitsuk a success uzenetet
                if (paymentMethod === 'kartya') {
                    const cardNum = document.getElementById('cardNumber').value.replace(/\s/g, '');
                    const lastFour = cardNum.slice(-4);
                    document.querySelector('#orderSuccess h2').textContent = 'Sikeres fizetes es rendeles!';
                    document.querySelector('#orderSuccess p:first-of-type').innerHTML =
                        'Rendelesi szam: <span class="font-bold">' + data.rendeles_szam + '</span>' +
                        '<br><span class="text-green-600">Kartyas fizetes sikeres</span> - **** **** **** ' + lastFour;
                }

                document.getElementById('orderSuccess').classList.remove('hidden');

                await fetch(`${API_URL}/cart?action=clear&user_id=${userId}`);
                document.getElementById('cart-count').textContent = '0';
            } else {
                document.getElementById('orderError').textContent = data.error || 'Hiba tortent a rendeles soran';
                document.getElementById('orderError').classList.remove('hidden');
            }
        } catch (error) {
            document.getElementById('orderError').textContent = 'Halozati hiba: ' + error.message;
            document.getElementById('orderError').classList.remove('hidden');
        }
    }

    return (
        <div>

            <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 class="text-3xl font-bold mb-8">Kosár</h1>

                {/* Bejelentkezési figyelmeztetés */}
                <div id="loginWarning" class="hidden mb-6 p-4 bg-yellow-50 border border-yellow-400 rounded-lg">
                    <div class="flex items-center gap-3">
                        <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                        <div>
                            <p class="font-medium text-yellow-800">A kosár használatához bejelentkezés szükséges!</p>
                            <p class="text-sm text-yellow-700">Kérjük <a href="bejelentkezes.html" class="underline font-medium">jelentkezzen be</a> vagy <a href="register.html" class="underline font-medium">regisztráljon</a> a vásárláshoz.</p>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div class="lg:col-span-2">
                        <div id="cartItems" class="bg-white rounded-lg shadow-md p-6">
                            <p class="text-gray-500 text-center py-8">Betöltés...</p>
                        </div>
                    </div>

                    <div class="lg:col-span-1">
                        <div class="bg-white rounded-lg shadow-md p-6 sticky top-24">
                            <h2 class="text-xl font-bold mb-4">Összesítés</h2>
                            <div class="space-y-3 mb-6">
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Részösszeg:</span>
                                    <span id="subtotal" class="font-medium">0 Ft</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Szállítási díj:</span>
                                    <span class="font-medium">1 490 Ft</span>
                                </div>
                                <hr />
                                <div class="flex justify-between text-lg">
                                    <span class="font-bold">Végösszeg:</span>
                                    <span id="totalPrice" class="font-bold text-red-600">1 490 Ft</span>
                                </div>
                            </div>
                            <button onclick="handleCheckout()" id="checkoutBtn" class="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                                Tovább a fizetéshez
                            </button>
                        </div>
                    </div>
                </div>

                {/* Checkout Form */}
                <div id="checkoutForm" class="hidden mt-8">
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h2 class="text-2xl font-bold mb-6">Szállítási adatok</h2>
                        <form onsubmit="submitOrder(event)">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="md:col-span-2">
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Teljes név *</label>
                                    <input type="text" id="orderName" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600" />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Email cím *</label>
                                    <input type="email" id="orderEmail" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600" />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Telefonszám *</label>
                                    <input type="tel" id="orderPhone" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600" />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Irányítószám *</label>
                                    <input type="text" id="orderZip" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600" />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Város *</label>
                                    <input type="text" id="orderCity" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600" />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Utca *</label>
                                    <input type="text" id="orderStreet" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600" />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Házszám</label>
                                    <input type="text" id="orderHouse" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600" />
                                </div>
                                <div class="md:col-span-2">
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Megjegyzés</label>
                                    <textarea id="orderNote" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"></textarea>
                                </div>
                            </div>

                            <div class="mt-6 p-4 bg-gray-50 rounded-lg">
                                <h3 class="font-bold mb-3">Fizetesi mod</h3>
                                <div class="space-y-2">
                                    <label class="flex items-center gap-3 p-3 rounded-lg border-2 border-transparent hover:bg-gray-100 cursor-pointer transition payment-option" data-method="utanvet">
                                        <input type="radio" name="payment" value="utanvet" checked class="text-red-600 w-4 h-4" onchange="toggleCardForm()" />
                                        <svg class="w-5 h-5 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <span class="font-medium">Utanvet (keszpenz a futarnal)</span>
                                    </label>
                                    <label class="flex items-center gap-3 p-3 rounded-lg border-2 border-transparent hover:bg-gray-100 cursor-pointer transition payment-option" data-method="kartya">
                                        <input type="radio" name="payment" value="kartya" class="text-red-600 w-4 h-4" onchange="toggleCardForm()" />
                                        <svg class="w-5 h-5 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                        <span class="font-medium">Bankkartyas fizetes</span>
                                        <div class="flex items-center gap-1 ml-auto">
                                            <span class="text-xs font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">VISA</span>
                                            <span class="text-xs font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">MC</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Kartya adatok */}
                            <div id="cardFormSection" class="hidden mt-4 p-4 sm:p-6 bg-gray-50 rounded-lg border-2 border-blue-200">
                                <div class="flex items-center gap-2 mb-4">
                                    <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <h4 class="font-bold text-gray-800">Kartya adatok</h4>
                                    <span class="text-xs text-gray-500 ml-auto">Biztonsagos fizetes</span>
                                </div>

                                <div class="space-y-4">
                                    {/* Kartyaszam */}
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Kartyaszam *</label>
                                        <div class="relative">
                                            <input type="text" id="cardNumber" maxlength="19" placeholder="0000 0000 0000 0000"
                                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg tracking-wider"
                                                oninput="formatCardNumber(this)" onblur="validateField('cardNumber')" />
                                            <div id="cardTypeIcon" class="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold px-2 py-0.5 rounded hidden"></div>
                                        </div>
                                        <p id="cardNumberError" class="text-red-600 text-xs mt-1 hidden"></p>
                                    </div>

                                    {/* Kartyatulajdonos */}
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">Kartyatulajdonos neve *</label>
                                        <input type="text" id="cardName" placeholder="NAGY PETER"
                                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                                            oninput="this.value = this.value.toUpperCase()" onblur="validateField('cardName')" />
                                        <p id="cardNameError" class="text-red-600 text-xs mt-1 hidden"></p>
                                    </div>

                                    {/* Lejartat + CVV */}
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">Lejarati datum *</label>
                                            <input type="text" id="cardExpiry" maxlength="5" placeholder="HH/EE"
                                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-center text-lg"
                                                oninput="formatExpiry(this)" onblur="validateField('cardExpiry')" />
                                            <p id="cardExpiryError" class="text-red-600 text-xs mt-1 hidden"></p>
                                        </div>
                                        <div>
                                            <label class="block text-sm font-medium text-gray-700 mb-1">CVV/CVC *</label>
                                            <div class="relative">
                                                <input type="password" id="cardCvv" maxlength="4" placeholder="***"
                                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-center text-lg"
                                                    oninput="this.value = this.value.replace(/\D/g,'')" onblur="validateField('cardCvv')" />
                                                <button type="button" onclick="toggleCvvVisibility()" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                                    <svg id="cvvEyeIcon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <p id="cardCvvError" class="text-red-600 text-xs mt-1 hidden"></p>
                                        </div>
                                    </div>

                                    {/* Számlázási cím egyezik */}
                                    <label class="flex items-center gap-2 cursor-pointer mt-2">
                                        <input type="checkbox" id="sameBillingAddress" checked class="text-blue-600 w-4 h-4 rounded" onchange="toggleBillingAddress()" />
                                        <span class="text-sm text-gray-600">A szamlazasi cim megegyezik a szallitasi cimmel</span>
                                    </label>

                                    {/* <!-- Kulonallo szmlazasi cim --> */}
                                    <div id="billingAddressSection" class="hidden space-y-3 pt-3 border-t border-gray-200">
                                        <h5 class="font-medium text-sm text-gray-700">Szamlazasi cim</h5>
                                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label class="block text-xs font-medium text-gray-600 mb-1">Iranyitoszam *</label>
                                                <input type="text" id="billingZip" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                                            </div>
                                            <div>
                                                <label class="block text-xs font-medium text-gray-600 mb-1">Varos *</label>
                                                <input type="text" id="billingCity" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                                            </div>
                                            <div class="sm:col-span-2">
                                                <label class="block text-xs font-medium text-gray-600 mb-1">Utca, hazszam *</label>
                                                <input type="text" id="billingStreet" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div id="orderError" class="hidden mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg"></div>

                            <div class="mt-6 flex gap-4">
                                <button type="button" onclick="hideCheckout()" class="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">Vissza</button>
                                <button type="submit" id="submitOrderBtn" class="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold transition">Megrendelés elküldése</button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Success Message */}
                <div id="orderSuccess" class="hidden mt-8">
                    <div class="bg-green-50 border border-green-400 rounded-lg p-8 text-center">
                        <svg class="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <h2 class="text-2xl font-bold text-green-700 mb-2">Sikeres rendelés!</h2>
                        <p class="text-green-600 mb-2">Rendelési szám: <span id="orderNumber" class="font-bold"></span></p>
                        <p class="text-gray-600 mb-6">Hamarosan emailben küldjük a visszaigazolást.</p>
                        <a href="index.html" class="inline-block bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold transition">Vissza a főoldalra</a>
                    </div>
                </div>
            </main>

            <footer class="bg-gray-900 text-white py-8 mt-12">
                <div class="max-w-7xl mx-auto px-4 text-center">
                    <p class="text-gray-400">&copy; 2025 AutoParts Pro. Minden jog fenntartva.</p>
                </div>
            </footer>
        </div>
    )
}
