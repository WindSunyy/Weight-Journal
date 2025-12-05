import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Platform, ImageBackground } from 'react-native';
import { Card, Divider } from 'react-native-paper';
import Svg, { Circle } from 'react-native-svg';

type Props = {
  currentWeight: number; // 当前体重
  startWeight: number;   // 初始体重
  goalWeight: number;    // 目标体重
};

export default function WeightProgressCard({ currentWeight, startWeight, goalWeight }: Props) {
  const { progress, remaining } = useMemo(() => {
    const total = Math.max(Math.abs(startWeight - goalWeight), 0.0001);
    const done = Math.max(Math.abs(startWeight - currentWeight), 0);
    const p = Math.min(done / total, 1);
    const rem = Math.max(Math.abs(currentWeight - goalWeight), 0);
    return { progress: p, remaining: rem };
  }, [currentWeight, startWeight, goalWeight]);

  const size = 160;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * progress;
  const percent = Math.round(progress * 100);
  const timeStr = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
  const angle = (-90 + progress * 360) * (Math.PI / 180);
  const knobX = size / 2 + radius * Math.cos(angle);
  const knobY = size / 2 + radius * Math.sin(angle);

  return (
    <Card style={styles.card}>
      <View style={styles.clip}>
        <ImageBackground
          source={require('../../assets/bg.jpg')}
          resizeMode="cover"
          style={styles.bgFull}
          imageStyle={styles.bgImage}
        >
          <View style={styles.overlay} />
          <View style={styles.row}>
            <Svg width={size} height={size}>
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth={strokeWidth}
                fill="none"
              />
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#ffffff"
                strokeWidth={strokeWidth}
                strokeDasharray={`${dash}, ${circumference}`}
                strokeLinecap="round"
                fill="none"
                rotation="-90"
                originX={size / 2}
                originY={size / 2}
              />
              <Circle cx={knobX} cy={knobY} r={6} fill="#ffffff" />
            </Svg>
            <View style={styles.centerTextWrap}>
              <Text style={styles.centerTime}>{timeStr}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text style={styles.centerNumber}>{currentWeight.toFixed(2)}</Text>
                <Text style={styles.centerUnit}>公斤</Text>
              </View>
              <View style={styles.percentPill}><Text style={styles.percentText}>目标达成{percent}%</Text></View>
            </View>
            <View style={styles.scaleRow}>
              <Text style={styles.scaleText}>0%</Text>
              <Text style={styles.scaleText}>100%</Text>
            </View>
          </View>
          <Divider style={{ marginTop: 12, marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.12)' }} />
          <View style={styles.infoDark}>
            <View style={styles.infoItem}>
              <Text style={styles.infoValueDark}>{startWeight.toFixed(2)}</Text>
              <Text style={styles.infoLabelDark}>初始体重</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoValueDark}>{remaining.toFixed(2)}</Text>
              <Text style={styles.infoLabelDark}>距离目标</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoValueDark}>{goalWeight.toFixed(2)}</Text>
              <Text style={styles.infoLabelDark}>减重目标</Text>
            </View>
          </View>
        </ImageBackground>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 18,
    backgroundColor: 'transparent'
  },
  clip: { borderRadius: 18, overflow: 'hidden' },
  bgFull: { padding: 16 },
  bgImage: { borderRadius: 18 },
  overlay: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  centerTextWrap: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  centerNumber: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '700',
    ...(Platform.OS === 'ios' ? { fontFamily: 'DINAlternate-Bold' } : {}),
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.2
  },
  centerUnit: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginLeft: 6, fontWeight: '600' },
  centerTime: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginBottom: 8, fontWeight: '600' },
  percentPill: { marginTop: 8, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.12)' },
  percentText: { color: '#ffffff', fontSize: 12, fontWeight: '600' },
  scaleRow: { position: 'absolute', top: 136, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  scaleText: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  infoDark: { flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 12 },
  infoItem: { flex: 1, alignItems: 'center' },
  infoLabelDark: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  infoValueDark: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 4,
    ...(Platform.OS === 'ios' ? { fontFamily: 'DINAlternate-Bold' } : {}),
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.2
  }
});
