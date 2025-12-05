import React from 'react';
import { ScrollView } from 'react-native';
import WeightProgressCard from '../components/WeightProgressCard';
import WeeklyChart from '../components/WeeklyChart';

export default function WeightScreen() {
  const startWeight = 75.0;
  const currentWeight = 70.2;
  const goalWeight = 68.0;
  // 最新一周在索引0，示例为体重值（kg）
  // 模拟最近52周（仅示例：这里使用3周，后续可接入存储）
  const weeks = [
    [
      { day: 'Mon', value: 70.8 },
      { day: 'Tue', value: 70.6 },
      { day: 'Wed', value: 70.4 },
      { day: 'Thu', value: 70.3 },
      { day: 'Fri', value: 70.2 },
      { day: 'Sat', value: 70.4 },
      { day: 'Sun', value: 70.1 }
    ],
    [
      { day: 'Mon', value: 71.2 },
      { day: 'Tue', value: 71.1 },
      { day: 'Wed', value: 71.0 },
      { day: 'Thu', value: 70.9 },
      { day: 'Fri', value: 70.8 },
      { day: 'Sat', value: 70.7 },
      { day: 'Sun', value: 70.6 }
    ],
    [
      { day: 'Mon', value: 71.6 },
      { day: 'Tue', value: 71.5 },
      { day: 'Wed', value: 71.4 },
      { day: 'Thu', value: 71.3 },
      { day: 'Fri', value: 71.2 },
      { day: 'Sat', value: 71.1 },
      { day: 'Sun', value: 71.0 }
    ]
  ];

  return (
    <ScrollView>
      <WeightProgressCard
        startWeight={startWeight}
        currentWeight={currentWeight}
        goalWeight={goalWeight}
      />
      <WeeklyChart weeks={weeks} title="本周体重（kg）" />
    </ScrollView>
  );
}
