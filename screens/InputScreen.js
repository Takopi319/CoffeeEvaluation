import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    StyleSheet,
    Pressable,
    Button,
    Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import RadarChart from '../components/RadarChart';

const categories = ['香り', '酸味', 'コク', '甘み', '後味'];

export default function InputScreen({ navigation, route }) {
    const [step, setStep] = useState('input');
    const [name, setName] = useState('');
    const [ratings, setRatings] = useState({
        香り: 3,
        酸味: 3,
        コク: 3,
        甘み: 3,
        後味: 3,
    });
    const [memo, setMemo] = useState('');
    const [isFavorite, setIsFavorite] = useState(false);
    const [editId, setEditId] = useState(null);

    const isFocused = useIsFocused();
    const initialState = useRef({ name: '', memo: '', isFavorite: false, ratings: { ...ratings } });

    useEffect(() => {
        if (route?.params?.editMode && route?.params?.entry) {
            const entry = route.params.entry;
            setName(entry.name);
            setRatings(entry.ratings);
            setMemo(entry.memo);
            setIsFavorite(entry.favorite);
            setEditId(entry.id);
            initialState.current = {
                name: entry.name,
                memo: entry.memo,
                isFavorite: entry.favorite,
                ratings: { ...entry.ratings },
            };
        } else {
            initialState.current = {
                name: '',
                memo: '',
                isFavorite: false,
                ratings: { 香り: 3, 酸味: 3, コク: 3, 甘み: 3, 後味: 3 },
            };
        }
    }, [route]);

    useEffect(() => {
        if (!isFocused) {
            if (isDirty()) {
                Alert.alert(
                    '変更を破棄しますか？',
                    '保存されていない変更があります。画面を離れますか？',
                    [
                        {
                            text: '戻る',
                            style: 'cancel',
                            onPress: () => {
                                // 少し遅らせて強制的に戻す
                                setTimeout(() => {
                                    navigation.navigate('登録 / 編集');
                                }, 100);
                            },
                        },
                        {
                            text: '変更を破棄',
                            style: 'destructive',
                            onPress: () => resetForm(),
                        },
                    ]
                );
            } else {
                resetForm()
            }
        }
    }, [isFocused]);

    const isDirty = () => {
        const init = initialState.current;
        return (
            name !== init.name ||
            memo !== init.memo ||
            isFavorite !== init.isFavorite ||
            categories.some((key) => ratings[key] !== init.ratings[key])
        );
    };

    const resetForm = () => {
        setName('');
        setMemo('');
        setIsFavorite(false);
        setRatings({ 香り: 3, 酸味: 3, コク: 3, 甘み: 3, 後味: 3 });
        setEditId(null);
        setStep('input');
        initialState.current = {
            name: '',
            memo: '',
            isFavorite: false,
            ratings: { 香り: 3, 酸味: 3, コク: 3, 甘み: 3, 後味: 3 },
        };
    };

    const handleChange = (key, value) => {
        setRatings((prev) => ({ ...prev, [key]: value }));
    };

    const handleNext = () => {
        setStep('result');
    };

    const handleBack = () => {
        setStep('input');
    };

    const handleSave = async () => {
        const newEntry = {
            id: editId ?? Date.now(),
            name,
            ratings,
            memo,
            favorite: isFavorite,
            createdAt: editId ? route.params.entry.createdAt : new Date().toISOString(),
        };

        try {
            const data = await AsyncStorage.getItem('coffeeHistory');
            const history = data ? JSON.parse(data) : [];

            const updatedHistory = editId
                ? history.map((item) => (item.id === editId ? newEntry : item))
                : [...history, newEntry];

            await AsyncStorage.setItem('coffeeHistory', JSON.stringify(updatedHistory));
            Alert.alert('保存完了', '評価を保存しました。');
            navigation.navigate('履歴');
        } catch (e) {
            Alert.alert('エラー', '保存に失敗しました');
        }
        initialState.current = {
            name,
            memo,
            isFavorite,
            ratings: { ...ratings },
        };

    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {step === 'input' ? (
                <>
                    <View style={styles.row}>
                        <TextInput
                            style={styles.input}
                            placeholder="コーヒーの名前"
                            value={name}
                            onChangeText={setName}
                        />
                        <Pressable onPress={() => setIsFavorite(!isFavorite)}>
                            <Text style={styles.star}>{isFavorite ? '⭐' : '☆'}</Text>
                        </Pressable>
                    </View>

                    {categories.map((cat) => (
                        <View key={cat} style={styles.sliderRow}>
                            <Text style={styles.label}>{cat}：{ratings[cat]}</Text>
                            <Slider
                                style={styles.slider}
                                minimumValue={1}
                                maximumValue={5}
                                step={0.5}
                                value={ratings[cat]}
                                minimumTrackTintColor="#6f4e37"
                                maximumTrackTintColor="#ccc"
                                thumbTintColor="#6f4e37"
                                onValueChange={(value) => handleChange(cat, value)}
                            />
                        </View>
                    ))}

                    <Text style={styles.label}>メモ</Text>
                    <TextInput
                        style={styles.memoInput}
                        placeholder="自由にメモを書いてください"
                        multiline
                        value={memo}
                        onChangeText={setMemo}
                    />

                    <Button title="次へ" onPress={handleNext} color="#6f4e37" />
                </>
            ) : (
                <>
                    <Text style={styles.title}>{name || '（無題のコーヒー）'}</Text>
                    <View style={{ alignItems: 'center' }}>
                        <RadarChart scores={ratings} />
                    </View>
                    {memo.trim().length > 0 && (
                        <View style={{ marginTop: 16 }}>
                            <Text style={styles.label}>メモ</Text>
                            <Text style={styles.memoText}>{memo}</Text>
                        </View>
                    )}
                    <Button title="保存する" onPress={handleSave} color="#6f4e37" />
                    <View style={{ marginTop: 10 }}>
                        <Button title="戻る" onPress={handleBack} color="#888" />
                    </View>
                </>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f4f1ee',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#3e2723',
        marginBottom: 16,
        textAlign: 'center',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    input: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        paddingHorizontal: 10,
        borderRadius: 6,
        backgroundColor: '#fff',
    },
    star: {
        fontSize: 28,
        marginLeft: 12,
    },
    sliderRow: {
        marginBottom: 16,
    },
    slider: {
        width: '100%',
    },
    label: {
        fontSize: 16,
        color: '#4e342e',
        marginBottom: 4,
    },
    memoInput: {
        height: 100,
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        textAlignVertical: 'top',
        backgroundColor: '#fff',
        borderRadius: 6,
        marginBottom: 20,
    },
    memoText: {
        fontSize: 14,
        color: '#4e342e',
        backgroundColor: '#fefefe',
        padding: 8,
        borderRadius: 6,
    },
});
