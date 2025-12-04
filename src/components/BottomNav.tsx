import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  onPressCenter?: () => void;
  onPressLeft?: () => void;
  onPressRight?: () => void;
};

export default function BottomNav({ onPressCenter, onPressLeft, onPressRight }: Props) {
  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View style={styles.bar}>
        <View style={styles.inner}>
          <Pressable style={styles.item} onPress={onPressLeft} accessibilityRole="button">
            <Ionicons name="document-text-outline" size={22} color="#111827" />
            <Text style={styles.label}>记录</Text>
          </Pressable>
          <Pressable style={styles.item} onPress={onPressRight} accessibilityRole="button">
            <Ionicons name="settings-outline" size={22} color="#6b7280" />
            <Text style={[styles.label, { color: '#6b7280' }]}>设置</Text>
          </Pressable>
        </View>
      </View>

      <Pressable style={styles.fab} onPress={onPressCenter} accessibilityRole="button">
        <Ionicons name="add" size={28} color="#ffffff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center'
  },
  bar: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    elevation: 6
  },
  inner: {
    width: '72%',
    maxWidth: 360,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  item: { flexDirection: 'column', alignItems: 'center' },
  label: { marginTop: 4, fontSize: 12, color: '#111827' },
  fab: {
    position: 'absolute',
    bottom: 26,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgb(53,53,53)',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8
  }
});
