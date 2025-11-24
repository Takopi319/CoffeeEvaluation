// utils/textNormalize.js

// 日本語検索用の正規化関数
// ・NFKC で全角/半角を統一
// ・英数字を小文字に
// ・カタカナをひらがなに変換
export const normalizeText = (text) => {
  if (!text) return '';

  let normalized = text.normalize('NFKC').toLowerCase();

  // カタカナ → ひらがな
  // カタカナ Unicode: 0x30A1〜0x30F6
  // ひらがなとの差は 0x60
  normalized = normalized.replace(/[\u30A1-\u30F6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );

  return normalized;
};
