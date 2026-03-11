/**
 * Mobile Navigation + Dark Mode Toggle
 * Automatically injects hamburger button, mobile menu overlay, and dark mode toggle
 */
(function() {
    // ===== DARK MODE =====
    function initDarkMode() {
        const saved = localStorage.getItem('darkMode');
        if (saved === 'true') {
            document.documentElement.classList.add('dark');
        }
    }
    // Apply immediately (before DOMContentLoaded) to avoid flash
    initDarkMode();

    function toggleDarkMode() {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('darkMode', isDark);
        // Update all toggle button icons
        document.querySelectorAll('.dark-mode-toggle').forEach(btn => {
            updateDarkModeIcon(btn, isDark);
        });
    }

    function updateDarkModeIcon(btn, isDark) {
        if (isDark) {
            btn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>`;
            btn.setAttribute('aria-label', 'Vilagos mod');
            btn.title = 'Vilagos mod';
        } else {
            btn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
            </svg>`;
            btn.setAttribute('aria-label', 'Sotet mod');
            btn.title = 'Sotet mod';
        }
    }

    // Make global
    window.toggleDarkMode = toggleDarkMode;

    document.addEventListener('DOMContentLoaded', function() {
        // ===== DARK MODE BUTTON IN HEADER =====
        const headerRightSide = document.querySelector('header .flex.items-center.gap-4');
        if (headerRightSide) {
            const darkBtn = document.createElement('button');
            darkBtn.className = 'dark-mode-toggle p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors';
            darkBtn.onclick = toggleDarkMode;
            const isDark = document.documentElement.classList.contains('dark');
            updateDarkModeIcon(darkBtn, isDark);
            // Insert before the cart link (last child) or at the start
            const cartLink = headerRightSide.querySelector('a[href="kosar.html"]');
            if (cartLink) {
                headerRightSide.insertBefore(darkBtn, cartLink);
            } else {
                headerRightSide.insertBefore(darkBtn, headerRightSide.firstChild);
            }
        }

        // ===== MOBILE NAV =====
        const header = document.querySelector('header .flex.items-center.justify-between');
        const nav = document.querySelector('nav.bg-gray-100') || document.querySelector('nav.bg-gray-50');
        if (!header || !nav) return;

        // Insert hamburger button before the right side icons
        const rightSide = header.querySelector('.flex.items-center.gap-4');
        if (!rightSide) return;

        const hamburger = document.createElement('button');
        hamburger.id = 'hamburgerBtn';
        hamburger.className = 'md:hidden p-2 text-gray-600 hover:text-gray-900 focus:outline-none';
        hamburger.setAttribute('aria-label', 'Menu megnyitasa');
        hamburger.innerHTML = `
            <svg class="w-6 h-6" id="hamburgerIcon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
            <svg class="w-6 h-6 hidden" id="hamburgerCloseIcon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
        `;
        header.insertBefore(hamburger, rightSide);

        // Don't modify loginLink/logoutBtn visibility here - let checkLoginStatus() handle it
        // Mobile menu has its own auth links that check user status

        // Hide the desktop nav on mobile
        nav.classList.add('hidden', 'md:block');

        // Create mobile menu overlay
        const mobileMenu = document.createElement('div');
        mobileMenu.id = 'mobileMenu';
        mobileMenu.className = 'fixed inset-0 z-40 hidden';
        
        // Gather nav links
        const navLinks = nav.querySelectorAll('a');
        let linksHTML = '';
        navLinks.forEach(link => {
            const isActive = link.classList.contains('text-red-600');
            const isHidden = link.classList.contains('hidden');
            const activeClass = isActive ? 'text-red-600 bg-red-50 border-l-4 border-red-600' : 'text-gray-700 hover:bg-gray-50 hover:text-red-600';
            const hiddenClass = isHidden ? 'hidden' : '';
            linksHTML += `<a href="${link.href}" class="${activeClass} ${hiddenClass} block px-6 py-3 font-medium transition-colors" ${link.id ? `id="mobile-${link.id}"` : ''}>${link.textContent}</a>`;
        });

        // Add login/logout to mobile menu
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        const isDarkNow = document.documentElement.classList.contains('dark');
        const darkModeMenuHTML = `
            <div class="border-t border-gray-200 mt-2 pt-2">
                <button onclick="toggleDarkMode()" class="dark-mode-toggle flex items-center gap-3 w-full text-left px-6 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        ${isDarkNow 
                            ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>'
                            : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>'}
                    </svg>
                    ${isDarkNow ? 'Vilagos mod' : 'Sotet mod'}
                </button>
            </div>`;

        const authHTML = user 
            ? `<div class="border-t border-gray-200 mt-2 pt-2">
                 <div class="px-6 py-2 text-sm text-gray-500">Bejelentkezve: ${user.felhasznalonev || user.email}</div>
                 <button onclick="logout(); closeMobileMenu();" class="block w-full text-left px-6 py-3 text-red-600 font-medium hover:bg-red-50">Kijelentkezes</button>
               </div>`
            : `<div class="border-t border-gray-200 mt-2 pt-2">
                 <a href="bejelentkezes.html" class="block px-6 py-3 text-gray-700 font-medium hover:bg-gray-50">Bejelentkezes</a>
                 <a href="register.html" class="block px-6 py-3 text-gray-700 font-medium hover:bg-gray-50">Regisztracio</a>
               </div>`;

        mobileMenu.innerHTML = `
            <div id="mobileMenuBackdrop" class="absolute inset-0 bg-black bg-opacity-50"></div>
            <div id="mobileMenuPanel" class="absolute top-0 left-0 w-72 max-w-[80vw] h-full bg-white shadow-xl transform -translate-x-full transition-transform duration-300 ease-in-out overflow-y-auto">
                <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <a href="index.html" class="text-xl font-bold text-red-600">AutoParts Pro</a>
                    <button id="mobileMenuCloseBtn" class="p-2 text-gray-500 hover:text-gray-700" aria-label="Menu bezarasa">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                <div class="py-2">
                    ${linksHTML}
                    ${darkModeMenuHTML}
                    ${authHTML}
                </div>
            </div>
        `;

        document.body.appendChild(mobileMenu);

        const panel = document.getElementById('mobileMenuPanel');
        const backdrop = document.getElementById('mobileMenuBackdrop');
        const closeBtn = document.getElementById('mobileMenuCloseBtn');
        const openIcon = document.getElementById('hamburgerIcon');
        const closeIcon = document.getElementById('hamburgerCloseIcon');

        function openMobileMenu() {
            mobileMenu.classList.remove('hidden');
            requestAnimationFrame(() => {
                panel.classList.remove('-translate-x-full');
                panel.classList.add('translate-x-0');
            });
            document.body.style.overflow = 'hidden';
            openIcon.classList.add('hidden');
            closeIcon.classList.remove('hidden');
        }

        function closeMobileMenu() {
            panel.classList.remove('translate-x-0');
            panel.classList.add('-translate-x-full');
            document.body.style.overflow = '';
            openIcon.classList.remove('hidden');
            closeIcon.classList.add('hidden');
            setTimeout(() => mobileMenu.classList.add('hidden'), 300);
        }

        // Make closeMobileMenu global so the logout button can use it
        window.closeMobileMenu = closeMobileMenu;

        hamburger.addEventListener('click', function() {
            if (mobileMenu.classList.contains('hidden')) {
                openMobileMenu();
            } else {
                closeMobileMenu();
            }
        });

        backdrop.addEventListener('click', closeMobileMenu);
        closeBtn.addEventListener('click', closeMobileMenu);

        // Close on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
                closeMobileMenu();
            }
        });

        // Sync admin link visibility
        const desktopAdminLink = document.getElementById('adminLink');
        const mobileAdminLink = document.getElementById('mobile-adminLink');
        if (desktopAdminLink && mobileAdminLink) {
            if (desktopAdminLink.classList.contains('hidden')) {
                mobileAdminLink.classList.add('hidden');
            } else {
                mobileAdminLink.classList.remove('hidden');
            }
        }
    });
})();
