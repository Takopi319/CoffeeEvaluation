import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Swipeable } from 'react-native-gesture-handler';
import RadarChart from '../components/RadarChart';
import { FontAwesome } from '@expo/vector-icons';

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

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

  const renderItem = ({ item }) => {
    const isExpanded = item.id === expandedId;
    return (
      <Swipeable renderRightActions={() => renderRightActions(item)}>
        <Pressable
          style={styles.item}
          onPress={() =>
            setExpandedId(isExpanded ? null : item.id)
          }
          onLongPress={() => {
            handleEdit(item);
          }}
        >
          <View style={styles.itemHeader}>
            <Text style={styles.name}>{item.name || '（無題のコーヒー）'}</Text>
            {item.favorite && <FontAwesome name="star" size={20} color="#d4af37" />}
          </View>
          <View style={styles.metaRow}>
            {item.servingStyle && (
              <View
                style={[
                  styles.servingBadge,
                  {
                    backgroundColor: item.servingStyle === 'Hot' ? '#e57373' : '#64b5f6',
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
                    <>
                      <Text style={styles.memoText}>{item.memo}</Text>
                    </>
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

  return (
    <View style={styles.container}>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text>まだ履歴がありません。</Text>}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#3e2723',
  },
  addButtonWrapper: {
    alignItems: 'center',
    marginBottom: 14,
  },
  addButton: {
    backgroundColor: '#6f4e37',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  star: {
    fontSize: 18,
    marginLeft: 8,
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
  memoLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3e2723',
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
  iconText: {
    fontSize: 13,
  },
});
