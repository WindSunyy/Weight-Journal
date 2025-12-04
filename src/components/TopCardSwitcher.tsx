import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import WeightProgressCard from './WeightProgressCard';
import DietProgressCard from './DietProgressCard';
import type { TabKey } from '../App';

export default function TopCardSwitcher({ active }: { active: TabKey }) {
  const tx = useRef(new Animated.Value(0)).current;
  const op = useRef(new Animated.Value(1)).current;
  const prev = useRef<TabKey>(active);

  useEffect(() => {
    if (prev.current === active) return;
    const dir = active === 'diet' ? 1 : -1; // diet 从右滑入，weight 从左滑入
    tx.setValue(24 * dir);
    op.setValue(0);
    Animated.parallel([
      Animated.timing(tx, { toValue: 0, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(op, { toValue: 1, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: true })
    ]).start();
    prev.current = active;
  }, [active]);

  return (
    <Animated.View style={{ transform: [{ translateX: tx }], opacity: op }}>
      {active === 'weight' ? (
        <WeightProgressCard startWeight={75} currentWeight={70.2} goalWeight={68} />
      ) : (
        <DietProgressCard caloriesLeft={1472} caloriesBudget={1868} />
      )}
    </Animated.View>
  );
}
