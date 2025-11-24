// utils/historyFilter.js

import { normalizeText } from './textNormalize';

// 検索＋お気に入り＋飲み方フィルタ
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

    const matchesSearch =
      keyword === '' || name.includes(keyword) || memo.includes(keyword);

    const matchesFavorite = !favoriteOnly || item?.favorite === true;

    let matchesServing = true;
    if (servingFilter === 'hot') {
      matchesServing = item?.servingStyle === 'Hot';
    } else if (servingFilter === 'ice') {
      matchesServing = item?.servingStyle === 'Ice';
    }

    return matchesSearch && matchesFavorite && matchesServing;
  });
};

// 並び替え
// items: 配列
// options: { sortKey, sortOrder }
//   sortKey: 'createdAt' | 'name' | 'aroma' | 'acidity' | 'body' | 'sweetness' | 'aftertaste'
//   sortOrder: 'asc' | 'desc'
export const sortHistory = (items, options) => {
  const { sortKey = 'createdAt', sortOrder = 'desc' } = options || {};

  const list = [...(items || [])];
  const dir = sortOrder === 'asc' ? 1 : -1;

  const getValue = (item) => {
    if (!item) return null;

    switch (sortKey) {
      case 'createdAt':
        return item.createdAt ? new Date(item.createdAt).getTime() : null;
      case 'name':
        return (item.name || '').toString();
      case 'aroma':
      case 'acidity':
      case 'body':
      case 'sweetness':
      case 'aftertaste': {
        const ratings = item.ratings || {};
        return typeof ratings[sortKey] === 'number' ? ratings[sortKey] : null;
      }
      default:
        return null;
    }
  };

  list.sort((a, b) => {
    const aVal = getValue(a);
    const bVal = getValue(b);

    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;

    if (sortKey === 'name') {
      return dir * aVal.localeCompare(bVal, 'ja');
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      if (aVal === bVal) return 0;
      return aVal > bVal ? dir : -dir;
    }

    // createdAt など数値化したものはここに入る
    if (aVal === bVal) return 0;
    return aVal > bVal ? dir : -dir;
  });

  return list;
};
