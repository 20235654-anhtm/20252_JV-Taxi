export async function translateText(text: string): Promise<string> {
  if (!text || !text.trim()) return '';

  const hasJapanese = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(text);
  const targetLang = hasJapanese ? 'vi' : 'ja';

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Translation API request failed');
    }
    
    const data = await response.json();
    
    if (data && data[0] && Array.isArray(data[0])) {
      const translated = data[0].map((segment: any) => segment[0]).join('');
      return translated;
    }
    
    throw new Error('Failed to parse translation response');
  } catch (error) {
    console.error('Translation error, falling back to mock:', error);
    
    const lowerText = text.toLowerCase().trim();
    if (targetLang === 'vi') {
      if (lowerText.includes('こんにちは')) return 'Xin chào!';
      if (lowerText.includes('ありがとう')) return 'Cảm ơn!';
      if (lowerText.includes('到着')) return 'Tôi đã đến nơi rồi.';
      if (lowerText.includes('渋滞')) return 'Đường đang kẹt xe.';
      if (lowerText.includes('待って')) return 'Tôi đang đợi.';
      return `[Dịch: ${text}]`;
    } else {
      if (lowerText.includes('xin chào') || lowerText.includes('hello')) return 'こんにちは！';
      if (lowerText.includes('cảm ơn') || lowerText.includes('thanks')) return 'ありがとうございます！';
      if (lowerText.includes('đến nơi') || lowerText.includes('đã tới')) return '到着しました。';
      if (lowerText.includes('kẹt xe') || lowerText.includes('tắc đường')) return '渋滞しています。';
      if (lowerText.includes('đang đợi')) return '待っています。';
      return `[翻訳: ${text}]`;
    }
  }
}
