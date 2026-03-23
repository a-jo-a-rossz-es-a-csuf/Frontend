import React from 'react'
import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <div>
      <header class="bg-white shadow-md sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex items-center justify-between">
            <Link to="/" class="text-2xl font-bold text-red-600">AutoParts Pro</Link>

            <div class="hidden md:flex flex-1 max-w-md mx-8">
              <input type="text" id="header-search" placeholder="Keresés alkatrészek között..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600" />
            </div>

            <div class="flex items-center gap-4">
              <span id="userInfo" class="text-gray-600 text-sm hidden"></span>
              <Link to="/bejelentkezes" id="loginLink" class="text-gray-600 hover:text-gray-900 font-medium">Bejelentkezés</Link>
              <button onclick="logout()" id="logoutBtn" class="text-red-600 hover:text-red-700 font-medium hidden">Kijelentkezés</button>
              <Link to="/kosar" class="relative p-2 text-gray-600 hover:text-gray-900">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
                <span id="cart-count" class="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">0</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* <!-- NAVIGATION --> */}
      <nav class="bg-gray-100 border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-center gap-8 h-12">
            <Link to="/" class="text-red-600 font-medium">Főoldal</Link>
            <Link to="/szemely" class="text-gray-600 hover:text-red-600 font-medium">Személygépkocsi</Link>
            <Link to="/teher" class="text-gray-600 hover:text-red-600 font-medium">Teherautó</Link>
            <Link to="/motor" class="text-gray-600 hover:text-red-600 font-medium">Motorkerékpár</Link>
            <Link to="/alvazszamkereso" class="text-gray-600 hover:text-red-600 font-medium">Alvázszám kereső</Link>
            <Link to="/folyadekok" class="text-gray-600 hover:text-red-600 font-medium">Olajok/folyadékok</Link>
            <Link to="/cikkszam" class="text-gray-600 hover:text-red-600 font-medium">Cikkszám</Link>
            <Link to="/segitsegkeres" class="text-gray-600 hover:text-red-600 font-medium">Segítségkérés</Link>
            <Link to="/admin" id="adminLink" class="text-gray-600 hover:text-red-600 font-medium hidden">Admin</Link>
          </div>
        </div>
      </nav>
    </div>
  )
}
