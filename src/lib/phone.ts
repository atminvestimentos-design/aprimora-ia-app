// Normalização de telefone brasileiro para WhatsApp

export function phoneVariants(raw: string): string[] {
  const digits         = raw.replace(/\D/g, '');
  const withCountry    = digits.startsWith('55') ? digits : `55${digits}`;
  const withoutCountry = digits.startsWith('55') ? digits.slice(2) : digits;

  const addNinth = (n: string): string | null => {
    if (n.length === 12 && n.startsWith('55')) return n.slice(0, 4) + '9' + n.slice(4);
    if (n.length === 10)                        return n.slice(0, 2) + '9' + n.slice(2);
    return null;
  };

  const removeNinth = (n: string): string | null => {
    if (n.length === 13 && n.startsWith('55') && n[4] === '9') return n.slice(0, 4) + n.slice(5);
    if (n.length === 11 && !n.startsWith('55') && n[2] === '9') return n.slice(0, 2) + n.slice(3);
    return null;
  };

  const variants = [withCountry, withoutCountry];
  const wc9  = addNinth(withCountry);
  const woc9 = addNinth(withoutCountry);
  const wcR  = removeNinth(withCountry);
  const wocR = removeNinth(withoutCountry);
  if (wc9)  variants.push(wc9);
  if (woc9) variants.push(woc9);
  if (wcR)  variants.push(wcR);
  if (wocR) variants.push(wocR);
  return [...new Set(variants)];
}

/** Normaliza número para envio: sempre com DDI 55 */
export function normalizeToSend(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  return digits.startsWith('55') ? digits : `55${digits}`;
}
