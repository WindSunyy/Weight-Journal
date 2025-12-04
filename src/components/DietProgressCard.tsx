import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { Card } from 'react-native-paper';
import Svg, { Circle } from 'react-native-svg';

type Props = {
  caloriesLeft?: number;
  caloriesBudget?: number;
};

export default function DietProgressCard({ caloriesLeft = 1472, caloriesBudget = 1868 }: Props) {
  const size = 160;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(Math.min(1 - caloriesLeft / caloriesBudget, 1), 0);
  const dash = circumference * progress;

  return (
    <Card style={styles.card}>
      <View style={styles.clip}>
        <ImageBackground
          source={require('../../assets/bg.jpg')}
          resizeMode="cover"
          style={styles.bg}
          imageStyle={styles.bgImage}
        >
          <View style={styles.overlay} />
          <View style={styles.row}>
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Svg width={size} height={size}>
                <Circle cx={size/2} cy={size/2} r={radius} stroke="rgba(255,255,255,0.12)" strokeWidth={strokeWidth} fill="none" />
                <Circle
                  cx={size/2}
                  cy={size/2}
                  r={radius}
                  stroke="#FFD54F"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${dash}, ${circumference}`}
                  strokeLinecap="round"
                  fill="none"
                  rotation="-90"
                  originX={size/2}
                  originY={size/2}
                />
              </Svg>
              <Text style={styles.subTitle}>还可以吃</Text>
              <Text style={styles.number}>{caloriesLeft}</Text>
              <Text style={styles.caption}>预算{caloriesBudget}千卡</Text>
            </View>

            <View style={styles.mealsRow}>
              {['早餐','午餐','晚餐','加餐'].map((label, i) => (
                <View key={i} style={styles.mealItem}>
                  <View style={styles.mealCircle}><Text style={styles.plus}>+</Text></View>
                  <Text style={styles.mealLabel}>{label}</Text>
                </View>
              ))}
            </View>
          </View>
        </ImageBackground>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginTop: 14, borderRadius: 18, backgroundColor: 'transparent' },
  clip: { borderRadius: 18, overflow: 'hidden' },
  bg: { padding: 16 },
  bgImage: { borderRadius: 18 },
  overlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  subTitle: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginTop: -8 },
  number: { color: '#ffffff', fontSize: 32, fontWeight: '700' },
  caption: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
  mealsRow: { flex: 1, flexDirection: 'row', justifyContent: 'space-evenly' },
  mealItem: { alignItems: 'center', justifyContent: 'center' },
  mealCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  plus: { color: 'rgba(255,255,255,0.9)', fontSize: 20, fontWeight: '600' },
  mealLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 6 }
});
