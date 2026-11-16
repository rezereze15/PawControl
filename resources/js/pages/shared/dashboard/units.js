/** Supply unit for a quantity: "1 box", "3 boxes", "5 vials"; pcs and ml never change. */
export function unitLabel(unit, quantity) {
    if (quantity === 1 || ["pcs", "ml"].includes(unit))
        return unit;
    return unit === "box" ? "boxes" : `${unit}s`;
}
