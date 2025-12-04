import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const titles: Record<string, string> = {
  weight: '记录体重',
  breakfast: '记录早餐',
  lunch: '记录午餐',
  dinner: '记录晚餐',
  snack: '记录加餐',
  exercise: '记录运动',
  waist: '记录体围',
  shape: '记录形体'
};

export default function RecordScreen({ keyProp, onClose }: { keyProp: string; onClose: () => void }) {
  const title = titles[keyProp] ?? '记录';
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={onClose} style={styles.closeBtn} accessibilityRole="button">
              <Ionicons name="close" size={18} color="#6b7280" />
            </Pressable>
          </View>
          <Text style={styles.desc}>这里放置表单或选择控件（占位）。</Text>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', paddingHorizontal: 16, paddingTop: 16 },
  card: { borderRadius: 16, backgroundColor: '#fff', elevation: 0 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  title: { flex: 1, fontSize: 18, fontWeight: '700', color: '#111827' },
  closeBtn: { padding: 6, borderRadius: 8 },
  desc: { marginTop: 8, fontSize: 14, color: '#4b5563' }
});
