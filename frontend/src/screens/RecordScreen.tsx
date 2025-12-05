import React, { useState, useEffect, useRef } from 'react';
import { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { saveWeight } from '../api/weight';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const titles: Record<string, string> = {
  weight: '记录体重',
  // ...其他类型
};

const getTodayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 (今天)`;
};

const numPad = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', 'del']
];
const { height: screenHeight } = Dimensions.get('window');
const NAV_HEIGHT = 156; // 与App.tsx一致
export default function RecordScreen({ keyProp, visible, onClose, onSave, token }: { keyProp: string; visible: boolean; onClose: () => void; onSave?: (weight: number, date: Date) => void; token: string }) {
  const title = titles[keyProp] ?? '记录';
  const [weight, setWeight] = useState('0.00');
  const [date, setDate] = useState(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const handleNumPress = (num: string) => {
    if (num === 'del') {
      setWeight((w) => w.length > 1 ? w.slice(0, -1) : '0');
    } else if (num === '.') {
      if (!weight.includes('.')) setWeight(weight + '.');
    } else {
      if (weight === '0.00' || weight === '0') setWeight(num);
      else if (weight.length < 5) setWeight(weight + num);
    }
  };

  const handleSave = useCallback(async () => {
    if (!token) {
      onClose();
      return;
    }
    try {
      // 用本地年月日拼接，避免 toISOString() 时区问题
      const pad = (n: number) => String(n).padStart(2, '0');
      const dateStr = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
      await saveWeight({
        weight: Number(weight),
        date: dateStr,
        unit: 'kg',
      });
      if (onSave) onSave(Number(weight), date);
    } catch (e) {}
    onClose();
  }, [token, weight, date, onSave, onClose]);

  // 动画抽屉
  const translateY = useRef(new Animated.Value(screenHeight)).current;
  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: screenHeight * (1 - 0.66) - NAV_HEIGHT,
        duration: 320,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: screenHeight,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateY]);

  if (!visible) return null;

  return (
    <View style={styles.drawerOverlay} pointerEvents={visible ? 'auto' : 'none'}>
      <Animated.View style={[styles.drawer, { transform: [{ translateY }] }]}> 
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
            <Ionicons name="close" size={28} color="#222" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <TouchableOpacity style={styles.dateRow} onPress={() => setDatePickerVisible(true)}>
              <Text style={styles.dateText}>{date ? `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日${getTodayStr().includes(`${date.getDate()}日`) ? ' (今天)' : ''}` : getTodayStr()}</Text>
              <Ionicons name="chevron-down" size={20} color="#222" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handleSave} style={styles.iconBtn}>
            <Ionicons name="checkmark" size={28} color="#222" />
          </TouchableOpacity>
        </View>
        <DateTimePickerModal
          isVisible={datePickerVisible}
          mode="date"
          date={date}
          locale="zh-CN"
          confirmTextIOS="确认"
          cancelTextIOS="取消"
          maximumDate={new Date(new Date().setHours(0,0,0,0))}
          onConfirm={(d: Date) => { setDate(d); setDatePickerVisible(false); }}
          onCancel={() => setDatePickerVisible(false)}
        />
        <View style={styles.weightRow}>
          <Text style={styles.weightNum}>{weight}</Text>
          <Text style={styles.unit}>公斤</Text>
        </View>
        <View style={styles.numPad}>
          {numPad.map((row, i) => (
            <View key={i} style={styles.numPadRow}>
              {row.map((num) => (
                <TouchableOpacity key={num} style={styles.numBtn} onPress={() => handleNumPress(num)}>
                  <Text style={styles.numText}>{num === 'del' ? '⌫' : num}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  drawerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
    zIndex: 999,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: NAV_HEIGHT,
    height: '66%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 12,
    zIndex: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  iconBtn: {
    padding: 4,
    borderRadius: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 18,
    color: '#222',
    fontWeight: 'bold',
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 18,
  },
  weightNum: {
    fontSize: 48,
    color: '#222',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  unit: {
    fontSize: 18,
    color: '#888',
    marginLeft: 8,
    marginBottom: 8,
  },
  numPad: {
    marginTop: 8,
  },
  numPadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  numBtn: {
    width: 64,
    height: 48,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numText: {
    fontSize: 24,
    color: '#222',
    fontWeight: 'bold',
  },
});
