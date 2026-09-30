// Concatenate class names — bỏ falsy, join space. Không cần clsx/twmerge
// để tránh thêm dep runtime cho consumer.
export function cn(...args) {
  const out = [];
  for (const a of args) {
    if (!a) continue;
    if (typeof a === "string") out.push(a);
    else if (Array.isArray(a)) {
      const s = cn(...a);
      if (s) out.push(s);
    } else if (typeof a === "object") {
      for (const k of Object.keys(a)) if (a[k]) out.push(k);
    }
  }
  return out.join(" ");
}
