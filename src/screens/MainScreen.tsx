import React from 'react';
import { ScrollView } from 'react-native';
import WeeklyChart from '../components/WeeklyChart';
import ProgressSwitchCard from '../components/ProgressSwitchCard';
import type { TabKey } from '../App';

export default function MainScreen({ active, onSwitch }: { active: TabKey; onSwitch: (t: TabKey) => void }) {
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
      <ProgressSwitchCard
        active={active}
        onSwitch={onSwitch}
        weight={{ startWeight: 75, currentWeight: 70.2, goalWeight: 68 }}
        diet={{ caloriesLeft: 1472, caloriesBudget: 1868 }}
      />
      <WeeklyChart weeks={weeks} />
    </ScrollView>
  );
}
