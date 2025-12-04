import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Card } from 'react-native-paper';

export function DataCards({ items }: { items: { label: string; value: string }[] }) {
  const fade = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    fade.setValue(0);
    translate.setValue(10);
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(translate, { toValue: 0, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true })
    ]).start();
  }, [items, fade, translate]);

  return (
    <Animated.View style={[styles.grid, { opacity: fade, transform: [{ translateY: translate }] }] }>
      {items.map((it, idx) => (
        <Animated.View
          key={it.label}
          style={[
            styles.card,
            {
              transform: [{ translateY: translate }],
              opacity: fade
            }
          ]}
        >
          <Card style={styles.cardSurface}>
            <Card.Content>
              <Text style={styles.label}>{it.label}</Text>
              <Text style={styles.value}>{it.value}</Text>
            </Card.Content>
          </Card>
        </Animated.View>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  grid: { flexWrap: 'wrap', flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  card: {
    width: '47%',
    borderRadius: 14
  },
  cardSurface: {
    backgroundColor: '#ffffff',
    borderRadius: 14
  },
  label: { color: '#4b5563', fontSize: 13 },
  value: { color: '#111827', fontSize: 20, fontWeight: '700', marginTop: 4 }
});
