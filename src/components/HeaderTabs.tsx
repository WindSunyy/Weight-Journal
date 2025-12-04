import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, Pressable, Animated, Easing, findNodeHandle } from 'react-native';
import type { TabKey } from '../App';

export default function HeaderTabs({ active, onChange }: { active: TabKey; onChange: (t: TabKey) => void }) {
  const underlineX = useRef(new Animated.Value(0)).current;
  const [underlineWidth, setUnderlineWidth] = useState(60);
  const containerRef = useRef<View | null>(null);
  const dietTextRef = useRef<Text | null>(null);
  const weightTextRef = useRef<Text | null>(null);

  const measureAndAnimate = () => {
    const containerHandle = findNodeHandle(containerRef.current);
    const targetRef = active === 'diet' ? dietTextRef.current : weightTextRef.current;
    if (!containerHandle || !targetRef) return;
    // 相对容器测量文字的 x、宽度
    targetRef.measureLayout(
      containerHandle,
      (x, _y, w, _h) => {
        const desiredWidth = Math.max(36, Math.floor(w * 0.8));
        setUnderlineWidth(desiredWidth);
        const targetLeft = x + w / 2 - desiredWidth / 2;
        Animated.timing(underlineX, {
          toValue: targetLeft,
          duration: 220,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true
        }).start();
      },
      () => {}
    );
  };

  useEffect(() => {
    const id = setTimeout(measureAndAnimate, 0);
    return () => clearTimeout(id);
  }, [active]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.container} ref={containerRef}>
        <Pressable
          accessibilityRole="button"
          onPress={() => onChange('diet')}
          style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
        >
          <Text ref={dietTextRef} style={[styles.label, active === 'diet' && styles.activeLabel]}>饮食</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => onChange('weight')}
          style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
        >
          <Text ref={weightTextRef} style={[styles.label, active === 'weight' && styles.activeLabel]}>体重</Text>
        </Pressable>
        <View style={styles.underlineTrack}>
          <Animated.View
            style={[
              styles.underline,
              { width: underlineWidth, transform: [{ translateX: underlineX }] }
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', justifyContent: 'center', paddingTop: 12, paddingBottom: 10 },
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  tab: { paddingHorizontal: 12, paddingVertical: 6, marginHorizontal: 6 },
  label: { fontSize: 18, fontWeight: '700', color: '#111' },
  activeLabel: { color: '#000' },
  pressed: { opacity: 0.6 },
  underlineTrack: { position: 'absolute', bottom: -2, left: 0, right: 0, height: 0 },
  underline: { position: 'absolute', left: 0, height: 3, backgroundColor: '#000', borderRadius: 2 }
});
