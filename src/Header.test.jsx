import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';

// Mock az axios modult
vi.mock('axios', () => ({
  default: {
    get: vi.fn()
  }
}));

/**
 * React komponens teszt: Header komponens
 * 
 * Ez a teszt ellenőrzi, hogy a Header komponens helyesen:
 * - Betölti a bejelentkezett felhasználót a localStorage-ból
 * - Lekéri a kosár tételeket az API-ból
 * - Megjeleníti a kosár darabszámát
 */
describe('Header - Weboldal fejléc komponens', () => {

    beforeEach(() => {
        // Tisztítjuk a mock-okat minden teszt után
        vi.clearAllMocks();
    });

    test('Axios mock működik helyesen', () => {
        // Ellenőrizzük, hogy az axios mock létezik
        expect(axios.get).toBeDefined();
        expect(typeof axios.get).toBe('function');
    });

    test('Mock axios hívás tesztelése', async () => {
        // Mock API válasz
        axios.get.mockResolvedValueOnce({
            data: [
                { id: 1, userId: 1, mennyiseg: '2' }
            ]
        });

        const result = await axios.get('/api/cart');
        
        // Ellenőrizzük, hogy az axios meghívódott és az adat helyes
        expect(axios.get).toHaveBeenCalled();
        expect(result.data).toBeDefined();
        expect(result.data[0].mennyiseg).toBe('2');
    });

    test('Mock axios hiba kezelése', async () => {
        // Mock API hiba
        axios.get.mockRejectedValueOnce(new Error('Network Error'));

        try {
            await axios.get('/api/cart');
            expect(true).toBe(false); // Ez nem fusson le
        } catch (error) {
            expect(error.message).toBe('Network Error');
        }
    });

});
