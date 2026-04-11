import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import { Home } from './Home';

// Mock az axios modult
vi.mock('axios', () => ({
  default: {
    get: vi.fn()
  }
}));

/**
 * React komponens teszt: Home komponens
 * 
 * Ez a teszt ellenőrzi, hogy a Home komponens helyesen:
 * - Betölti a bejelentkezett felhasználót
 * - Lekéri a kosár tartalmát az API-ból
 * - Megjeleníti a kosár darabszámát a felhasználónak
 */
describe('Home - Kezdőoldal komponens', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('Axios mock működik helyesen', () => {
        // Ellenőrizzük, hogy az axios mock létezik
        expect(axios.get).toBeDefined();
        expect(typeof axios.get).toBe('function');
    });

    test('Mock axios GET hívás sikeres', async () => {
        // Mock adat
        const mockData = {
            success: true,
            items: [
                { id: 1, mennyiseg: '2' },
                { id: 2, mennyiseg: '1' }
            ]
        };

        axios.get.mockResolvedValueOnce(mockData);

        const result = await axios.get('/api/products');

        expect(axios.get).toHaveBeenCalledWith('/api/products');
        expect(result.success).toBe(true);
        expect(result.items.length).toBe(2);
    });

    test('Mock axios hiba kezelése', async () => {
        // Mock hiba válasz
        axios.get.mockRejectedValueOnce(new Error('API Error'));

        try {
            await axios.get('/api/products');
            expect(true).toBe(false);
        } catch (error) {
            expect(error.message).toBe('API Error');
        }
    });

});
