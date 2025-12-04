import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

type Option = { key: string; label: string; icon: string; color: string };

const options: Option[] = [
  { key: 'weight', label: '记体重', icon: 'scale-outline', color: '#8B5CF6' },
  { key: 'breakfast', label: '记早餐', icon: 'fast-food-outline', color: '#F59E0B' },
  { key: 'lunch', label: '记午餐', icon: 'restaurant-outline', color: '#EF4444' },
  { key: 'dinner', label: '记晚餐', icon: 'ice-cream-outline', color: '#F472B6' },
  { key: 'snack', label: '记加餐', icon: 'nutrition-outline', color: '#F59E0B' },
  { key: 'exercise', label: '记运动', icon: 'walk-outline', color: '#34D399' },
  { key: 'waist', label: '记体围', icon: 'grid-outline', color: '#60A5FA' },
  { key: 'shape', label: '记形体', icon: 'scan-outline', color: '#60A5FA' }
];

export default function PlusSheet({ visible, onClose, onSelect }: { visible: boolean; onClose: () => void; onSelect: (key: string) => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView style={StyleSheet.absoluteFill} intensity={30} tint="light" />
        {/* 点击遮罩空白处关闭 */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.grid}>
            {options.map((opt) => (
              <View key={opt.key} style={styles.gridItem}>
                <Pressable style={[styles.circle, { backgroundColor: opt.color }]} onPress={() => onSelect(opt.key)}>
                  <Ionicons name={opt.icon as any} size={22} color="#ffffff" />
                </Pressable>
                <Text style={styles.itemLabel}>{opt.label}</Text>
              </View>
            ))}
          </View>
          <Pressable style={styles.close} onPress={onClose}>
            <Ionicons name="close" size={20} color="#6b7280" />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sheet: {
    width: '86%',
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.9)'
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { width: '22%', alignItems: 'center', marginVertical: 14 },
  circle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  itemLabel: { marginTop: 8, fontSize: 12, color: '#374151' },
  close: { alignSelf: 'center', marginTop: 8, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }
});
