// Formatting shared by the Sales Reports boxes.

const pesoFormat = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 });

/** ₱1,500 (whole pesos: the report rounds, the receipts keep the centavos). */
export function peso(amount) {
    return pesoFormat.format(Math.round(amount ?? 0));
}

const oneDecimal = (value) => Number(value.toFixed(1)).toString();

/** Short axis labels: ₱0, ₱950, ₱1.5K, ₱20K, ₱1.2M. */
export function compactPeso(amount) {
    if (amount >= 1_000_000) return `₱${oneDecimal(amount / 1_000_000)}M`;
    if (amount >= 1_000) return `₱${oneDecimal(amount / 1_000)}K`;
    return `₱${Math.round(amount)}`;
}

/** 14.4% (no sign: the arrow and the word Up/Down say the direction). */
export function percent(value) {
    return `${oneDecimal(Math.abs(value))}%`;
}

/** Share of a total, as a whole percent; 0 when the total is 0. */
export function share(part, total) {
    return total > 0 ? Math.round((part / total) * 100) : 0;
}

/** The card style used by every box on the page. */
export const CARD = "rounded-2xl border border-[#ece8f5] bg-white p-5 shadow-sm";
