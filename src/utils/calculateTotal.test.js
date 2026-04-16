import { describe, test, expect } from 'vitest';
import { calculateTotal } from './calculateTotal';

/**
 * Egység teszt: calculateTotal függvény
 * 
 * Ez a teszt ellenőrzi, hogy a calculateTotal függvény helyesen
 * számítja ki a kosár végösszegét, a szállítási díjat és a kedvezményeket.
 */
describe('calculateTotal - Árszámítás függvény', () => {
    
    test('Üres kosár esetén 0 összeget ad vissza', () => {
        const result = calculateTotal([]);
        expect(result.total).toBe(0);
        expect(result.subtotal).toBe(0);
        expect(result.discount).toBe(0);
    });

    test('Egyetlen termék árát helyesen kiszámítja', () => {
        const items = [
            { ar: 1000, mennyiseg: 1 }
        ];
        const result = calculateTotal(items);
        expect(result.subtotal).toBe(1000);
        expect(result.deliveryFee).toBe(1490); // Szállítási díj hozzáadódik
        expect(result.total).toBe(2490);
    });

    test('Több termék árát összeadja helyesen', () => {
        const items = [
            { ar: 1000, mennyiseg: 2 },
            { ar: 500, mennyiseg: 3 }
        ];
        const result = calculateTotal(items);
        expect(result.subtotal).toBe(3500); // 1000*2 + 500*3
        expect(result.total).toBe(4990); // 3500 + 1490 szállítás
    });

    test('10% kedvezmény alkalmazódik első vásárláskor', () => {
        const items = [
            { ar: 10000, mennyiseg: 1, isFirstPurchaseDiscount: true }
        ];
        const result = calculateTotal(items);
        expect(result.discount).toBe(1000); // 10000 * 0.1
        expect(result.subtotal).toBe(10000);
        expect(result.total).toBe(10490); // 10000 - 1000 + 1490
    });

    test('Ingyenes szállítás 20000 Ft felett', () => {
        const items = [
            { ar: 20000, mennyiseg: 1 }
        ];
        const result = calculateTotal(items);
        expect(result.deliveryFee).toBe(0); // 20000 >= 20000, ezért ingyenes
        expect(result.total).toBe(20000);
    });

    test('Ingyenes szállítás a kedvezmény után is 20000 Ft felett', () => {
        const items = [
            { ar: 22000, mennyiseg: 1, isFirstPurchaseDiscount: true }
        ];
        const result = calculateTotal(items);
        // 22000 - 2200 (10% kedvezmény) = 19800, ez alatt van 20000, ezért van szállítás
        expect(result.discount).toBe(2200);
        expect(result.deliveryFee).toBe(1490); // Van szállítási díj
    });

});
