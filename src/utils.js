// Small helper functions used by the pages.
export const money = (n) => "₦" + n.toLocaleString();

export const grade = (total) => (total >= 70 ? "A" : total >= 60 ? "B" : total >= 50 ? "C" : "D");
export const gradeClass = (total) => (total >= 60 ? "tag g" : "tag a");
// chip-based version for school admin pages
export const chipGradeClass = (total) => (total >= 60 ? "chip" : "chip a");

export const ordinal = (n) => {
  if (!n || isNaN(n)) return "—";
  const num = Number(n);
  const s = ["th", "st", "nd", "rd"];
  const v = num % 100;
  return num + (s[(v - 20) % 10] || s[v] || s[0]);
};

// Share a student's payments across their fee items, oldest first.
export function splitPayment(items, paid) {
  let left = paid;
  return items.map((item) => {
    const p = Math.min(item.charged, left);
    left = left - p;
    const full = p === item.charged;
    return {
      name: item.name,
      charged: item.charged,
      paid: p,
      status: full ? "Paid" : p > 0 ? "Part paid" : "Unpaid",
      chipClass: full ? "chip" : "chip a",
    };
  });
}
