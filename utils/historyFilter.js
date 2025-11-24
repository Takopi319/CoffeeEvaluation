import { normalizeText } from './textNormalize';

// 履歴一覧に対して、検索＋お気に入りフィルタ＋飲み方フィルタを適用する純粋関数
// items: 履歴配列
// options: { searchText, favoriteOnly, servingFilter: 'all' | 'hot' | 'ice' }
export const filterHistory = (items, options) => {
  const {
    searchText = '',
    favoriteOnly = false,
    servingFilter = 'all',
  } = options || {};

  const keyword = normalizeText(searchText);

  return (items || []).filter((item) => {
    const name = normalizeText(item?.name || '');
    const memo = normalizeText(item?.memo || '');

    // 検索条件
    const matchesSearch =
      keyword === '' || name.includes(keyword) || memo.includes(keyword);

    // お気に入りフィルタ
    const matchesFavorite = !favoriteOnly || item?.favorite === true;

    // 飲み方フィルタ
    let matchesServing = true;
    if (servingFilter === 'hot') {
      matchesServing = item?.servingStyle === 'Hot';
    } else if (servingFilter === 'ice') {
      matchesServing = item?.servingStyle === 'Ice';
    }

    return matchesSearch && matchesFavorite && matchesServing;
  });
};
