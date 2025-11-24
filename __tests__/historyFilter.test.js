// __tests__/historyFilter.test.js

import { filterHistory, sortHistory } from '../utils/historyFilter';

const sampleHistory = [
  {
    id: 1,
    name: 'ウガンダ',
    memo: '',
    favorite: true,
    servingStyle: 'Hot',
    createdAt: '2025-01-03T10:00:00Z',
    ratings: { aroma: 3, acidity: 4, body: 3, sweetness: 2, aftertaste: 3 },
  },
  {
    id: 2,
    name: 'ケニア',
    memo: 'アイスで',
    favorite: false,
    servingStyle: 'Ice',
    createdAt: '2025-01-01T10:00:00Z',
    ratings: { aroma: 4, acidity: 5, body: 4, sweetness: 3, aftertaste: 4 },
  },
  {
    id: 3,
    name: 'ブラジル',
    memo: '',
    favorite: false,
    servingStyle: 'Hot',
    createdAt: '2025-01-02T10:00:00Z',
    ratings: { aroma: 2, acidity: 2, body: 3, sweetness: 4, aftertaste: 2 },
  },
  {
    id: 4,
    name: 'エチオピア',
    memo: 'うがんだとブレンド',
    favorite: true,
    servingStyle: 'Ice',
    createdAt: '2025-01-04T10:00:00Z',
    ratings: { aroma: 5, acidity: 3, body: 2, sweetness: 3, aftertaste: 5 },
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
      searchText: 'うが', // ひらがな入力
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

describe('sortHistory', () => {
  test('createdAt 降順で並ぶ', () => {
    const result = sortHistory(sampleHistory, {
      sortKey: 'createdAt',
      sortOrder: 'desc',
    });

    // 日付的には id:4(1/4) > 1(1/3) > 3(1/2) > 2(1/1)
    expect(result.map((x) => x.id)).toEqual([4, 1, 3, 2]);
  });

  test('createdAt 昇順で並ぶ', () => {
    const result = sortHistory(sampleHistory, {
      sortKey: 'createdAt',
      sortOrder: 'asc',
    });

    expect(result.map((x) => x.id)).toEqual([2, 3, 1, 4]);
  });

  test('酸味(acidity) 昇順で並ぶ', () => {
    const result = sortHistory(sampleHistory, {
      sortKey: 'acidity',
      sortOrder: 'asc',
    });

    // acidity: id3=2, id4=3, id1=4, id2=5
    expect(result.map((x) => x.id)).toEqual([3, 4, 1, 2]);
  });

  test('名前昇順で並ぶ（単純な英字のケース）', () => {
    const data = [
      { id: 1, name: 'Bravo' },
      { id: 2, name: 'Alpha' },
      { id: 3, name: 'Charlie' },
    ];

    const result = sortHistory(data, {
      sortKey: 'name',
      sortOrder: 'asc',
    });

    expect(result.map((x) => x.id)).toEqual([2, 1, 3]); // Alpha, Bravo, Charlie
  });

  test('値が null のものは末尾に寄る', () => {
    const data = [
      {
        id: 1,
        name: '有効データ',
        createdAt: '2025-01-01T10:00:00Z',
        ratings: { aroma: 3 },
      },
      {
        id: 2,
        name: 'nullデータ',
        // createdAt も ratings もなし
      },
    ];

    const result = sortHistory(data, {
      sortKey: 'createdAt',
      sortOrder: 'asc',
    });

    expect(result.map((x) => x.id)).toEqual([1, 2]);
  });
});
