// __tests__/historyFilter.test.js

import { filterHistory } from '../utils/historyFilter';

const sampleHistory = [
  {
    id: 1,
    name: 'ウガンダ',
    memo: '',
    favorite: true,
    servingStyle: 'Hot',
  },
  {
    id: 2,
    name: 'ケニア',
    memo: 'アイスで',
    favorite: false,
    servingStyle: 'Ice',
  },
  {
    id: 3,
    name: 'ブラジル',
    memo: '',
    favorite: false,
    servingStyle: 'Hot',
  },
  {
    id: 4,
    name: 'エチオピア',
    memo: 'うがんだとブレンド',
    favorite: true,
    servingStyle: 'Ice',
  },
];

describe('filterHistory', () => {
  test('検索・フィルタ未指定なら全件返す', () => {
    const result = filterHistory(sampleHistory, {
      searchText: '',
      favoriteOnly: false,
      servingFilter: 'all',
    });

    expect(result.map((x) => x.id)).toEqual([1, 2, 3, 4]);
  });

  test('かな／カナ検索が効く（名前が対象）', () => {
    const result = filterHistory(sampleHistory, {
      searchText: 'うが',  // ひらがな入力
      favoriteOnly: false,
      servingFilter: 'all',
    });

    // 「ウガンダ」がヒットする
    expect(result.map((x) => x.id)).toContain(1);
  });

  test('かな／カナ検索が効く（メモが対象）', () => {
    const result = filterHistory(sampleHistory, {
      searchText: 'うがんだ',
      favoriteOnly: false,
      servingFilter: 'all',
    });

    // メモに「うがんだ」を含む id:4 がヒットする
    expect(result.map((x) => x.id)).toContain(4);
  });

  test('お気に入りのみフィルタが効く', () => {
    const result = filterHistory(sampleHistory, {
      searchText: '',
      favoriteOnly: true,
      servingFilter: 'all',
    });

    // favorite === true の id:1,4 だけ
    expect(result.map((x) => x.id).sort()).toEqual([1, 4]);
  });

  test('Hot のみフィルタが効く', () => {
    const result = filterHistory(sampleHistory, {
      searchText: '',
      favoriteOnly: false,
      servingFilter: 'hot',
    });

    // servingStyle === 'Hot' の id:1,3
    expect(result.map((x) => x.id).sort()).toEqual([1, 3]);
  });

  test('Ice のみフィルタが効く', () => {
    const result = filterHistory(sampleHistory, {
      searchText: '',
      favoriteOnly: false,
      servingFilter: 'ice',
    });

    // servingStyle === 'Ice' の id:2,4
    expect(result.map((x) => x.id).sort()).toEqual([2, 4]);
  });

  test('検索＋お気に入り＋飲み方の AND 条件が効く', () => {
    const result = filterHistory(sampleHistory, {
      searchText: 'うが',   // ウガンダ
      favoriteOnly: true,   // お気に入りのみ
      servingFilter: 'hot', // Hot のみ
    });

    // すべて満たすのは id:1 のみ
    expect(result.map((x) => x.id)).toEqual([1]);
  });

  test('条件に一致するものがない場合は空配列', () => {
    const result = filterHistory(sampleHistory, {
      searchText: '存在しないキーワード',
      favoriteOnly: false,
      servingFilter: 'all',
    });

    expect(result).toHaveLength(0);
  });
});
