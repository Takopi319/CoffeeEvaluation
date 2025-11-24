import { normalizeText } from '../utils/textNormalize';

describe('normalizeText', () => {
  test('カタカナとひらがなが同じ値になる', () => {
    const katakana = normalizeText('ウガンダ');
    const hiragana = normalizeText('うがんだ');

    expect(katakana).toBe(hiragana);
  });

  test('部分一致での検索に使える形になる', () => {
    const storedName = 'ウガンダ';
    const keyword = 'うが'; // ひらがなで入力

    const normalizedName = normalizeText(storedName);
    const normalizedKeyword = normalizeText(keyword);

    // 「ウガンダ」に対して「うが」で検索したときにヒットすることを想定
    expect(normalizedName.includes(normalizedKeyword)).toBe(true);
  });

  test('全角・半角や大文字小文字の違いを吸収できる', () => {
    const pattern1 = normalizeText('ＡＢＣ123');
    const pattern2 = normalizeText('abc１２３');

    expect(pattern1).toBe(pattern2);
  });

  test('空や undefined の入力でも落ちない', () => {
    expect(normalizeText('')).toBe('');
    expect(normalizeText(null)).toBe('');
    expect(normalizeText(undefined)).toBe('');
  });
});
