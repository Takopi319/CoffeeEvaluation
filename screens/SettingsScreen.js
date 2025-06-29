import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const handleClearHistory = () => {
    Alert.alert(
      '確認',
      'すべての履歴を削除しますか？この操作は元に戻せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('coffeeHistory');
              Alert.alert('削除完了', '履歴をすべて削除しました。');
            } catch (e) {
              Alert.alert('エラー', '削除に失敗しました。');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>このアプリについて</Text>
      <Text style={styles.description}>
        コーヒーの味わいを5項目（香り・酸味・コク・甘み・後味）で評価し、記録・比較できます。
        自分だけのコーヒーノートとしてお楽しみください。
      </Text>

      <Text style={styles.sectionTitle}>バージョン</Text>
      <Text style={styles.version}>v1.0.0</Text>

      <Text style={styles.sectionTitle}>データの初期化</Text>
      <Pressable style={styles.deleteButton} onPress={handleClearHistory}>
        <Text style={styles.deleteButtonText}>すべての履歴を削除</Text>
      </Pressable>
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3e2723',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: '#4e342e',
    marginBottom: 20,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3e2723',
    marginTop: 20,
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    color: '#6d4c41',
  },
  deleteButton: {
    marginTop: 10,
    backgroundColor: '#d32f2f',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
