/**
 * Utility to generate SVG-based Code 128 / Code 39 representation for medical tube labels
 */

// Simple robust Code 39 barcode generator returning bar widths (1 for narrow, 2 or 3 for wide)
const CODE39_PATTERNS: Record<string, string> = {
  '0': '000110100', '1': '100100001', '2': '001100001', '3': '101100000',
  '4': '000110001', '5': '100110000', '6': '001110000', '7': '000100101',
  '8': '100100100', '9': '001100100', 'A': '100001001', 'B': '001001001',
  'C': '101001000', 'D': '000011001', 'E': '100011000', 'F': '001011000',
  'G': '000001101', 'H': '100001100', 'I': '001001100', 'J': '000011100',
  'K': '100000011', 'L': '001000011', 'M': '101000010', 'N': '000010011',
  'O': '100010010', 'P': '001010010', 'Q': '000000111', 'R': '100000110',
  'S': '001000110', 'T': '000010110', 'U': '110000001', 'V': '011000001',
  'W': '111000000', 'X': '010010001', 'Y': '110010000', 'Z': '011010000',
  '-': '010000101', '.': '110000100', ' ': '011000100', '$': '010101000',
  '/': '010100010', '+': '010001010', '%': '000101010', '*': '010010100'
};

export interface BarcodeBar {
  x: number;
  width: number;
  isBlack: boolean;
}

export function generateBarcodeBars(text: string, height = 40): { bars: BarcodeBar[]; totalWidth: number } {
  const clean = '*' + text.toUpperCase().replace(/[^0-9A-Z\-\. \$\/\+\%]/g, '') + '*';
  const bars: BarcodeBar[] = [];
  let currentX = 5;

  const narrow = 2;
  const wide = 4;
  const gap = 2;

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    const pattern = CODE39_PATTERNS[char] || CODE39_PATTERNS['*'];

    for (let p = 0; p < pattern.length; p++) {
      const isBlack = p % 2 === 0;
      const isWide = pattern[p] === '1';
      const w = isWide ? wide : narrow;

      if (isBlack) {
        bars.push({
          x: currentX,
          width: w,
          isBlack: true
        });
      }
      currentX += w;
    }
    currentX += gap;
  }

  return { bars, totalWidth: currentX + 5 };
}
