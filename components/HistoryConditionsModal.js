// components/HistoryConditionsModal.js

import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default function HistoryConditionsModal({
  visible,
  onClose, // キャンセル扱いで閉じる
  onApply, // { favoriteOnly, servingFilter, sortKey, sortOrder } を渡して閉じる
  favoriteOnly,
  servingFilter,
  sortKey,
  sortOrder,
}) {
  // ポップアップ内だけで使う一時状態
  const [tempFavoriteOnly, setTempFavoriteOnly] = useState(favoriteOnly);
  const [tempServingFilter, setTempServingFilter] = useState(servingFilter);
  const [tempSortKey, setTempSortKey] = useState(sortKey);
  const [tempSortOrder, setTempSortOrder] = useState(sortOrder);

  // 初期値（リセット時の基準）
  const DEFAULT_STATE = {
    favoriteOnly: false,
    servingFilter: 'all',
    sortKey: 'createdAt',
    sortOrder: 'desc',
  };

  // 現在の一時状態が初期値と同じかどうか
  const isAtDefault =
    tempFavoriteOnly === DEFAULT_STATE.favoriteOnly &&
    tempServingFilter === DEFAULT_STATE.servingFilter &&
    tempSortKey === DEFAULT_STATE.sortKey &&
    tempSortOrder === DEFAULT_STATE.sortOrder;

  // 表示されるたびに、画面側の状態をコピーして初期化
  useEffect(() => {
    if (visible) {
      setTempFavoriteOnly(favoriteOnly);
      setTempServingFilter(servingFilter);
      setTempSortKey(sortKey);
      setTempSortOrder(sortOrder);
    }
  }, [visible, favoriteOnly, servingFilter, sortKey, sortOrder]);

  const handleCancel = () => {
    onClose && onClose();
  };

  const handleApply = () => {
    onApply &&
      onApply({
        favoriteOnly: tempFavoriteOnly,
        servingFilter: tempServingFilter,
        sortKey: tempSortKey,
        sortOrder: tempSortOrder,
      });
  };

  // リセットボタン：一時状態を初期値に戻す
  const handleReset = () => {
    if (isAtDefault) return;
    setTempFavoriteOnly(DEFAULT_STATE.favoriteOnly);
    setTempServingFilter(DEFAULT_STATE.servingFilter);
    setTempSortKey(DEFAULT_STATE.sortKey);
    setTempSortOrder(DEFAULT_STATE.sortOrder);
  };

  const sortOptions = [
    { key: 'createdAt', label: '日付' },
    { key: 'name', label: '名前' },
    { key: 'aroma', label: '香り' },
    { key: 'acidity', label: '酸味' },
    { key: 'body', label: 'コク' },
    { key: 'sweetness', label: '甘さ' },
    { key: 'aftertaste', label: '後味' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel} // Android の戻るボタン
    >
      <View style={styles.modalRoot}>
        {/* 背景（タップでキャンセル扱い） */}
        <Pressable style={styles.backdrop} onPress={handleCancel} />

        {/* 下からせり上がるパネル */}
        <View style={styles.sheet}>
          <Text style={styles.title}>絞り込みと並び替え</Text>

          <ScrollView style={styles.content}>
            {/* フィルタ */}
            <Text style={styles.sectionTitle}>フィルタ</Text>

            {/* お気に入りフィルタ：トグルスイッチ */}
            <View style={styles.favoriteRow}>
              <Text style={styles.favoriteLabel}>お気に入りのみ</Text>
              <Switch
                testID="favorite-switch"
                value={tempFavoriteOnly}
                onValueChange={setTempFavoriteOnly}
                trackColor={{ false: '#d7ccc8', true: '#6f4e37' }}
                thumbColor={tempFavoriteOnly ? '#ffd54f' : '#f5f5f5'}
              />
            </View>

            {/* 飲み方フィルタ（ソート項目と同じボタンスタイル） */}
            <Text style={styles.subLabel}>飲み方</Text>
            <View style={styles.sortKeyGroup}>
              {[
                { key: 'all', label: 'すべて' },
                { key: 'hot', label: 'Hot' },
                { key: 'ice', label: 'Ice' },
              ].map((option) => (
                <Pressable
                  key={option.key}
                  style={[
                    styles.sortKeyButton,
                    tempServingFilter === option.key &&
                    styles.sortKeyButtonActive,
                  ]}
                  onPress={() => setTempServingFilter(option.key)}
                >
                  <Text
                    style={[
                      styles.sortKeyText,
                      tempServingFilter === option.key &&
                      styles.sortKeyTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* 並び替え */}
            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
              並び替え
            </Text>

            <Text style={styles.subLabel}>項目</Text>
            <View style={styles.sortKeyGroup}>
              {sortOptions.map((option) => (
                <Pressable
                  key={option.key}
                  style={[
                    styles.sortKeyButton,
                    tempSortKey === option.key && styles.sortKeyButtonActive,
                  ]}
                  onPress={() => setTempSortKey(option.key)}
                >
                  <Text
                    style={[
                      styles.sortKeyText,
                      tempSortKey === option.key && styles.sortKeyTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.subLabel}>昇順／降順</Text>
            <Pressable
              style={styles.sortOrderButton}
              onPress={() =>
                setTempSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
              }
            >
              <FontAwesome
                name={
                  tempSortOrder === 'asc'
                    ? 'sort-amount-asc'
                    : 'sort-amount-desc'
                }
                size={16}
                color="#fff"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.sortOrderText}>
                {tempSortOrder === 'asc' ? '昇順' : '降順'}
              </Text>
            </Pressable>
          </ScrollView>

          {/* 下部ボタン */}
          <View style={styles.footer}>
            {/* リセットボタン（初期値と同じ場合は無効） */}
            <Pressable
              style={[
                styles.resetButton,
                isAtDefault && styles.resetButtonDisabled,
              ]}
              onPress={handleReset}
              disabled={isAtDefault}
            >
              <Text
                style={[
                  styles.resetText,
                  isAtDefault && styles.resetTextDisabled,
                ]}
              >
                リセット
              </Text>
            </Pressable>

            <View style={styles.footerRight}>
              <Pressable style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelText}>キャンセル</Text>
              </Pressable>
              <Pressable style={styles.applyButton} onPress={handleApply}>
                <Text style={styles.applyText}>適用</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: '#fdfaf7',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,       // 下側余白を大きめに
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',        // 少し上まで広げる
    minHeight: '50%',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3e2723',
    marginBottom: 8,
    textAlign: 'center',
  },
  content: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4e342e',
    marginBottom: 6,
  },
  subLabel: {
    fontSize: 12,
    color: '#6d4c41',
    marginTop: 4,
    marginBottom: 4,
  },

  // お気に入りスイッチ行
  favoriteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: 4,
  },
  favoriteLabel: {
    fontSize: 13,
    color: '#5d4037',
  },

  // 飲み方・ソート項目 共通のボタングループ
  sortKeyGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  sortKeyButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d7ccc8',
    backgroundColor: '#fefefe',
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80, // 2列に折り返しつつ大きさを揃える
  },
  sortKeyButtonActive: {
    backgroundColor: '#6f4e37',
    borderColor: '#6f4e37',
  },
  sortKeyText: {
    fontSize: 12,
    color: '#5d4037',
  },
  sortKeyTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },

  sortOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#6f4e37',
    marginTop: 4,
  },
  sortOrderText: {
    fontSize: 12,
    color: '#fff',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // 左にリセット、右にキャンセル・適用
    marginTop: 4,
    alignItems: 'center',
  },

  // リセットボタン
  resetButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#8d6e63',
    backgroundColor: '#fefefe',
  },
  resetButtonDisabled: {
    opacity: 0.4,
  },
  resetText: {
    fontSize: 12,
    color: '#5d4037',
  },
  resetTextDisabled: {
    color: '#8d6e63',
  },

  footerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#8d6e63',
    backgroundColor: '#fefefe',
  },
  cancelText: {
    fontSize: 13,
    color: '#5d4037',
  },
  applyButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#6f4e37',
  },
  applyText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: 'bold',
  },
});
