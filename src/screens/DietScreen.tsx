import React from 'react';
import { ScrollView } from 'react-native';
import { DataCards } from '../components/DataCards';

export default function DietScreen() {
  const cards = [
    { label: '早餐', value: '蛋白质 25g' },
    { label: '午餐', value: '碳水 80g' },
    { label: '晚餐', value: '脂肪 20g' },
    { label: '加餐', value: '水果 1份' }
  ];

  return (
    <ScrollView>
      <DataCards items={cards} />
    </ScrollView>
  );
}
