/**
 * Összesen ár kiszámítása
 * @param {Array} items - Kosár tételek
 * @param {Number} deliveryFee - Szállítási díj
 * @returns {Object} Végösszeg és adatok
 */
export const calculateTotal = (items, deliveryFee = 1490) => {
    if (!Array.isArray(items) || items.length === 0) {
        return {
            subtotal: 0,
            deliveryFee: 0,
            discount: 0,
            total: 0
        };
    }

    // Részösszeg kiszámítása
    const subtotal = items.reduce((sum, item) => {
        const price = parseFloat(item.ar || 0);
        const quantity = parseInt(item.mennyiseg || 1);
        return sum + (price * quantity);
    }, 0);

    // Első vásárlás kedvezmény (10%)
    const hasDiscount = items.some(item => item.isFirstPurchaseDiscount);
    const discount = hasDiscount ? Math.floor(subtotal * 0.1) : 0;

    // Szállítási díj (ingyenes 20000 Ft felett)
    const finalDeliveryFee = subtotal - discount >= 20000 ? 0 : deliveryFee;

    const total = subtotal - discount + finalDeliveryFee;

    return {
        subtotal: Math.round(subtotal),
        deliveryFee: finalDeliveryFee,
        discount: Math.round(discount),
        total: Math.round(total)
    };
};
