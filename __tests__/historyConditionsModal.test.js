// __tests__/historyConditionsModal.test.js

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HistoryConditionsModal from '../components/HistoryConditionsModal';

// Expo のアイコンを「仮想モジュール」としてモックする
jest.mock(
  '@expo/vector-icons',
  () => ({
    FontAwesome: 'FontAwesome',
  }),
  { virtual: true }
);

describe('HistoryConditionsModal', () => {
  const defaultProps = {
    visible: true,
    favoriteOnly: false,
    servingFilter: 'all',
    sortKey: 'createdAt',
    sortOrder: 'desc',
    onClose: jest.fn(),
    onApply: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('初期状態では props がそのまま反映される', () => {
    const { getByText, getByTestId } = render(
      <HistoryConditionsModal {...defaultProps} />
    );

    // タイトル
    expect(getByText('絞り込みと並び替え')).toBeTruthy();

    // 飲み方の3つのボタンが見えている
    expect(getByText('すべて')).toBeTruthy();
    expect(getByText('Hot')).toBeTruthy();
    expect(getByText('Ice')).toBeTruthy();

    // 昇順／降順ボタンのラベル
    expect(getByText('降順')).toBeTruthy();

    // お気に入りスイッチは OFF
    const switchEl = getByTestId('favorite-switch');
    expect(switchEl.props.value).toBe(false);
  });

  test('リセットで条件を初期値に戻せる', () => {
    const { getByText, getByTestId } = render(
      <HistoryConditionsModal {...defaultProps} />
    );

    const switchEl = getByTestId('favorite-switch');

    // まず ON にする
    fireEvent(switchEl, 'valueChange', true);
    expect(getByTestId('favorite-switch').props.value).toBe(true);

    // リセット押下
    const resetText = getByText('リセット');
    fireEvent.press(resetText.parent);

    // OFF に戻っていること
    expect(getByTestId('favorite-switch').props.value).toBe(false);
  });

  test('適用ボタンで onApply が呼ばれ、変更内容が渡される', () => {
    const onApply = jest.fn();

    const { getByText, getByTestId } = render(
      <HistoryConditionsModal {...defaultProps} onApply={onApply} />
    );

    // 条件をいくつか変える
    const switchEl = getByTestId('favorite-switch');
    fireEvent(switchEl, 'valueChange', true); // お気に入り ON

    fireEvent.press(getByText('Hot'));  // 飲み方 Hot
    fireEvent.press(getByText('香り')); // ソート項目 香り

    // 昇順／降順トグル（desc→asc）
    const sortOrderText = getByText('降順');
    fireEvent.press(sortOrderText.parent);

    // 適用
    fireEvent.press(getByText('適用'));

    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply).toHaveBeenCalledWith({
      favoriteOnly: true,
      servingFilter: 'hot',
      sortKey: 'aroma',
      sortOrder: 'asc',
    });
  });

  test('キャンセルで onClose が呼ばれ、onApply は呼ばれない', () => {
    const onClose = jest.fn();
    const onApply = jest.fn();

    const { getByText } = render(
      <HistoryConditionsModal
        {...defaultProps}
        onClose={onClose}
        onApply={onApply}
      />
    );

    fireEvent.press(getByText('キャンセル'));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onApply).not.toHaveBeenCalled();
  });
});
