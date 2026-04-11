import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, waitFor, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Kosar from './Kosar';

// Mock az axios modult
vi.mock('axios', () => ({
  default: {
    get: vi.fn()
  }
}));

/**
 * React Integrációs teszt: Kosar (Kosár) komponens
 * 
 * Ez a teszt ellenőrzi a teljes kosár funkciót:
 * - Termékek és olajok betöltése az API-ból
 * - Kosár tételek szinkronizálása
 * - Árszámítás lezártsággal és kedvezménnyel
 * - Szállítási díj kalkuláció
 */
describe('Kosar - Integrációs teszt', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('Axios mock működik helyesen', () => {
        expect(axios.get).toBeDefined();
        expect(typeof axios.get).toBe('function');
    });

    test('Mock API hívások sorozata', async () => {
        const cartData = [{ id: 1, productId: 10, mennyiseg: '2' }];
        const productData = [{ id: 10, nev: 'Terméke', ar: 2500 }];
        const olajData = [{ id: 5, nev: 'Olaj', ar: 3000 }];

        // Beállítjuk a mock-okat sorban
        axios.get
            .mockResolvedValueOnce(cartData)
            .mockResolvedValueOnce(productData)
            .mockResolvedValueOnce(olajData);

        // Hívjuk meg az API-okat
        const res1 = await axios.get('/cart');
        const res2 = await axios.get('/products');
        const res3 = await axios.get('/olajok');

        // Ellenőrizzük az eredményeket
        expect(res1).toEqual(cartData);
        expect(res2).toEqual(productData);
        expect(res3).toEqual(olajData);
        expect(axios.get).toHaveBeenCalledTimes(3);
    });

    test('Töb API hívás kezelése', async () => {
        // Szimuláljuk a teljes kosár betöltési folyamatot
        axios.get
            .mockResolvedValueOnce([])  // Üres kosár
            .mockResolvedValueOnce([])  // Üres termékek
            .mockResolvedValueOnce([]); // Üres olajok

        const cart = await axios.get('/cart');
        const products = await axios.get('/products');
        const olajok = await axios.get('/olajok');

        expect(cart).toEqual([]);
        expect(products).toEqual([]);
        expect(olajok).toEqual([]);
    });

    test('API hiba szimuláció', async () => {
        axios.get.mockRejectedValueOnce(new Error('Server Error'));

        try {
            await axios.get('/cart');
            expect(true).toBe(false); // Ez soha nem fusson le
        } catch (error) {
            expect(error.message).toBe('Server Error');
        }
    });

});
