export function removeVietnameseTones(str: string): string {
  if (!str) return str;
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .normalize('NFC');
}

export function formatAddressToJapanese(address: string): string {
  if (!address) return address;
  
  let formatted = address;
  
  // Replace common Vietnamese address terms
  // Often "Đường X" -> "X 通り" but a simple replace is safer for mixed strings
  formatted = formatted.replace(/Đường\s+/gi, '通り ');
  formatted = formatted.replace(/Phố\s+/gi, '通り ');
  formatted = formatted.replace(/Quận\s+/gi, '区 ');
  formatted = formatted.replace(/Phường\s+/gi, '坊 ');
  formatted = formatted.replace(/Thành phố\s+/gi, '市 ');
  formatted = formatted.replace(/Tỉnh\s+/gi, '省 ');

  // Remove Vietnamese tones for the rest (names)
  return removeVietnameseTones(formatted);
}
