import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';
import WeightProgressCard from './WeightProgressCard';
import DietProgressCard from './DietProgressCard';
import type { TabKey } from '../App';
import { getTargetWeight } from '../api/weight';
import { getWeights } from '../storage';

export default function TopCardSwitcher({ active }: { active: TabKey }) {
  const tx = useRef(new Animated.Value(0)).current;
  const op = useRef(new Animated.Value(1)).current;
  const prev = useRef<TabKey>(active);
  const [goalWeight, setGoalWeight] = useState<number>(68);
  const [currentWeight, setCurrentWeight] = useState<number>(70.2);
  const [startWeight, setStartWeight] = useState<number>(75);

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

  // 加载目标体重与体重记录
  useEffect(() => {
    (async () => {
      try {
        const res = await getTargetWeight();
        const raw = res.data?.data?.targetWeight;
        const gw = raw != null ? Number(raw) : NaN;
        if (!isNaN(gw)) setGoalWeight(gw);
      } catch {}
      try {
        const list = await getWeights();
        if (list && list.length > 0) {
          const sorted = [...list].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          setStartWeight(sorted[0].weight);
          setCurrentWeight(sorted[sorted.length - 1].weight);
        }
      } catch {}
    })();
  }, []);

  return (
    <Animated.View style={{ transform: [{ translateX: tx }], opacity: op }}>
      {active === 'weight' ? (
        <WeightProgressCard startWeight={startWeight} currentWeight={currentWeight} goalWeight={goalWeight} />
      ) : (
        <DietProgressCard caloriesLeft={1472} caloriesBudget={1868} />
      )}
    </Animated.View>
  );
}
