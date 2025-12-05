import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  onPressCenter?: () => void;
  onPressLeft?: () => void;
  onPressRight?: () => void;
};

export default function BottomNav({ onPressCenter, onPressLeft, onPressRight }: Props) {
  const [activeTab, setActiveTab] = useState<'left' | 'right' | null>('left'); // 默认为 'left'

  const handleLeftPress = () => {
    setActiveTab('left');
    onPressLeft?.();
  };

  const handleRightPress = () => {
    setActiveTab('right');
    onPressRight?.();
  };

  const handleCenterPress = () => {
    setActiveTab(null);
    onPressCenter?.();
  };

  const isActiveLeft = activeTab === 'left';
  const isActiveRight = activeTab === 'right';

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View style={styles.bar}>
        <View style={styles.inner}>
          <Pressable 
            style={styles.itemContainer} 
            onPress={handleLeftPress} 
            accessibilityRole="button"
          >
            <View style={styles.item}>
              <Ionicons 
                name="document-text-outline" 
                size={22} 
                color={isActiveLeft ? "#111827" : "#6b7280"} 
              />
              <Text style={[
                styles.label, 
                { color: isActiveLeft ? '#111827' : '#6b7280' }
              ]}>
                记录
              </Text>
            </View>
          </Pressable>
          <Pressable 
            style={styles.itemContainer} 
            onPress={handleRightPress} 
            accessibilityRole="button"
          >
            <View style={styles.item}>
              <Ionicons 
                name="settings-outline" 
                size={22} 
                color={isActiveRight ? "#111827" : "#6b7280"} 
              />
              <Text style={[
                styles.label, 
                { color: isActiveRight ? '#111827' : '#6b7280' }
              ]}>
                设置
              </Text>
            </View>
          </Pressable>
        </View>
      </View>

      <Pressable 
        style={styles.fab} 
        onPress={handleCenterPress} 
        accessibilityRole="button"
      >
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
    alignItems: 'center',
    zIndex: 999,
    backgroundColor: '#fff'
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
    width: '88%',
    maxWidth: 460,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  itemContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16
  },
  item: { 
    flexDirection: 'column', 
    alignItems: 'center' 
  },
  label: { 
    marginTop: 4, 
    fontSize: 12, 
    color: '#111827' 
  },
  fab: {
    position: 'absolute',
    bottom: 40, // 减小底部间距
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



