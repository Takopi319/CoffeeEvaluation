import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Alert,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Swipeable } from 'react-native-gesture-handler';
import RadarChart from '../components/RadarChart';
import { FontAwesome } from '@expo/vector-icons';
import { filterHistory, sortHistory } from '../utils/historyFilter';
import HistoryConditionsModal from '../components/HistoryConditionsModal';

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  const [searchText, setSearchText] = useState('');

  // フィルタ状態（画面側の正式な状態）
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [servingFilter, setServingFilter] = useState('all'); // 'all' | 'hot' | 'ice'

  // ソート状態
  const [sortKey, setSortKey] = useState('createdAt'); // 'createdAt' など
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  // ポップアップ表示フラグ
  const [conditionsVisible, setConditionsVisible] = useState(false);

  const loadHistory = async () => {
    try {
      const data = await AsyncStorage.getItem('coffeeHistory');
      const parsed = data ? JSON.parse(data) : [];
      setHistory(parsed.reverse());
    } catch (e) {
      console.error('履歴の読み込みエラー:', e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();

      // タブ再表示時は条件をリセット（仕様どおり）
      setSearchText('');
      setFavoriteOnly(false);
      setServingFilter('all');
      setSortKey('createdAt');
      setSortOrder('desc');
      setExpandedId(null);
    }, [])
  );

  const handleDelete = async (id) => {
    Alert.alert('削除しますか？', 'この評価を削除します。', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: async () => {
          const data = await AsyncStorage.getItem('coffeeHistory');
          const history = data ? JSON.parse(data) : [];
          const updated = history.filter((item) => item.id !== id);
          await AsyncStorage.setItem('coffeeHistory', JSON.stringify(updated));
          setHistory(updated.reverse());
        },
      },
    ]);
  };

  const renderRightActions = (item) => (
    <Pressable
      style={styles.deleteAction}
      onPress={() => handleDelete(item.id)}
    >
      <Text style={styles.deleteText}>削除</Text>
    </Pressable>
  );

  const handleEdit = (item) => {
    navigation.navigate('Tabs', {
      screen: '登録 / 編集',
      params: {
        editMode: true,
        entry: item,
      },
    });
  };

  // 検索＋フィルタ
  const filteredHistory = filterHistory(history, {
    searchText,
    favoriteOnly,
    servingFilter,
  });

  // ソート
  const sortedHistory = sortHistory(filteredHistory, {
    sortKey,
    sortOrder,
  });

  const renderItem = ({ item }) => {
    const isExpanded = item.id === expandedId;
    return (
      <Swipeable renderRightActions={() => renderRightActions(item)}>
        <Pressable
          style={styles.item}
          onPress={() => setExpandedId(isExpanded ? null : item.id)}
          onLongPress={() => {
            handleEdit(item);
          }}
        >
          <View style={styles.itemHeader}>
            <Text style={styles.name}>{item.name || '（無題のコーヒー）'}</Text>
            {item.favorite && (
              <FontAwesome name="star" size={20} color="#d4af37" />
            )}
          </View>
          <View style={styles.metaRow}>
            {item.servingStyle && (
              <View
                style={[
                  styles.servingBadge,
                  {
                    backgroundColor:
                      item.servingStyle === 'Hot' ? '#e57373' : '#64b5f6',
                  },
                ]}
              >
                <Text style={styles.servingBadgeText}>
                  {item.servingStyle === 'Hot' ? 'Hot' : 'Ice'}
                </Text>
              </View>
            )}
            <Text style={styles.date}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>

          {isExpanded && (
            <View>
              <View style={styles.expandedRow}>
                <View style={styles.chartWrapper}>
                  <RadarChart scores={item.ratings} size={140} />
                </View>

                <View style={styles.memoBox}>
                  {item.memo ? (
                    <Text style={styles.memoText}>{item.memo}</Text>
                  ) : null}
                </View>
              </View>
              <View style={styles.actionIcons}>
                <Pressable onPress={() => handleEdit(item)}>
                  <FontAwesome name="edit" size={20} color="#6f4e37" />
                </Pressable>
                <Pressable onPress={() => handleDelete(item.id)}>
                  <FontAwesome name="trash" size={20} color="#6f4e37" />
                </Pressable>
              </View>
            </View>
          )}
        </Pressable>
      </Swipeable>
    );
  };

  const buildConditionsLabel = () => {
    const keyLabelMap = {
      createdAt: '日付',
      name: '名前',
      aroma: '香り',
      acidity: '酸味',
      body: 'コク',
      sweetness: '甘さ',
      aftertaste: '後味',
    };

    const sortLabel = keyLabelMap[sortKey] || '日付';
    const orderSymbol = sortOrder === 'asc' ? '↑' : '↓';

    const isDefault =
      !favoriteOnly &&
      servingFilter === 'all' &&
      sortKey === 'createdAt' &&
      sortOrder === 'desc';

    // 初期値のときは「日付↓」だけ表示
    if (isDefault) {
      return `${sortLabel}${orderSymbol}`;
    }

    // それ以外のときはフィルタ条件も含めて表示
    const parts = [];

    if (favoriteOnly) {
      parts.push('お気に入り');
    }
    if (servingFilter === 'hot') {
      parts.push('Hot');
    } else if (servingFilter === 'ice') {
      parts.push('Ice');
    }

    const filterPart = parts.length > 0 ? parts.join('/') : '';

    if (filterPart) {
      return `${filterPart} / ${sortLabel}${orderSymbol}`;
    }

    // フィルタはかかっていないが、ソートキーだけ違う場合
    return `${sortLabel}${orderSymbol}`;
  };


  const conditionsLabel = buildConditionsLabel();

  const isDefaultConditions =
    !favoriteOnly &&
    servingFilter === 'all' &&
    sortKey === 'createdAt' &&
    sortOrder === 'desc';

  const handleApplyConditions = (next) => {
    setFavoriteOnly(next.favoriteOnly);
    setServingFilter(next.servingFilter);
    setSortKey(next.sortKey);
    setSortOrder(next.sortOrder);
    setExpandedId(null); // 条件変更後はいったん全て閉じる
    setConditionsVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* 検索欄＋条件ボタン */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="名前やメモで検索"
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText !== '' && (
          <Pressable
            style={styles.clearButton}
            onPress={() => setSearchText('')}
          >
            <Text style={styles.clearButtonText}>クリア</Text>
          </Pressable>
        )}
        <Pressable
          style={[
            styles.conditionsButton,
            isDefaultConditions
              ? styles.conditionsButtonDefault
              : styles.conditionsButtonActive,
          ]}
          onPress={() => setConditionsVisible(true)}
        >
          <FontAwesome
            name="filter"
            size={12}
            color="#fff"
            style={{ marginRight: 4 }}
          />
          <Text
            style={styles.conditionsButtonText}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {conditionsLabel}
          </Text>
        </Pressable>
      </View>


      <FlatList
        data={sortedHistory}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text>
            {history.length === 0
              ? 'まだ履歴がありません。'
              : '検索条件・フィルタ条件に一致するコーヒーがありません。'}
          </Text>
        }
      />

      {/* フィルタ／ソート条件ポップアップ */}
      <HistoryConditionsModal
        visible={conditionsVisible}
        onClose={() => setConditionsVisible(false)}
        favoriteOnly={favoriteOnly}
        servingFilter={servingFilter}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onApply={handleApplyConditions}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f4f1ee',
    flex: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#d7ccc8',
    fontSize: 14,
    color: '#4e342e',
  },
  clearButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#6f4e37',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 11,
  },
  conditionsButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    maxWidth: 130,
    flexDirection: 'row',
    alignItems: 'center',
  },
  conditionsButtonDefault: {
    backgroundColor: '#d7ccc8',
  },
  conditionsButtonActive: {
    backgroundColor: '#6f4e37',
  },
  conditionsButtonText: {
    color: '#fff',
    fontSize: 10,
    flexShrink: 1,
  },


  item: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 18,
    width: '90%',
    fontWeight: '500',
    color: '#4e342e',
  },
  date: {
    fontSize: 14,
    color: '#6d4c41',
    marginTop: 4,
  },
  expandedRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 10,
    alignItems: 'flex-start',
  },
  chartWrapper: {
    marginLeft: 6,
    marginTop: 6,
  },
  memoBox: {
    flex: 1,
  },
  memoText: {
    fontSize: 14,
    color: '#4e342e',
    backgroundColor: '#fefefe',
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  deleteAction: {
    backgroundColor: '#d32f2f',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  deleteText: {
    color: '#fff',
    fontSize: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  servingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  servingBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionIcons: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    flexDirection: 'row',
    gap: 8,
  },
});
