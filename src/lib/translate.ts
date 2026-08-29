export async function translateText(text: string, from: string, to: string): Promise<string> {
  if (!text.trim()) return '';
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
    const res = await fetch(url);
    const json = await res.json();
    return json?.responseData?.translatedText || text;
  } catch {
    return text;
  }
}
