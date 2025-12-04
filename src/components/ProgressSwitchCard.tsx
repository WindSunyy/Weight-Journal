import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Platform, ImageBackground, Animated, Easing, PanResponder } from 'react-native';
import { Card, Divider } from 'react-native-paper';
import Svg, { Circle } from 'react-native-svg';
import type { TabKey } from '../App';

type WeightProps = { currentWeight: number; startWeight: number; goalWeight: number };
type DietProps = { caloriesLeft: number; caloriesBudget: number };

export default function ProgressSwitchCard({
  active,
  onSwitch = () => {},
  weight,
  diet
}: {
  active: TabKey;
  onSwitch: (t: TabKey) => void;
  weight: WeightProps;
  diet: DietProps;
}) {
  const anim = useRef(new Animated.Value(active === 'diet' ? 1 : 0)).current;
  const responder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > 12,
      onPanResponderRelease: (_e, g) => {
        if (g.dx < -40 && active !== 'diet') onSwitch('diet');
        else if (g.dx > 40 && active !== 'weight') onSwitch('weight');
      }
    })
  ).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: active === 'diet' ? 1 : 0,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true
    }).start();
  }, [active]);

  const txWeight = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -24] });
  const opWeight = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const txDiet = anim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });
  const opDiet = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  // 比例缩放：整体卡片和圆环按比例缩小
  const scale = 0.95; // 适度缩放，避免内容被裁剪
  const size = Math.round(160 * scale);
  const strokeWidth = Math.round(14 * scale);
  const radius = (size - strokeWidth) / 2;

  const { progress, remaining, percent } = useMemo(() => {
    const total = Math.max(Math.abs(weight.startWeight - weight.goalWeight), 0.0001);
    const done = Math.max(Math.abs(weight.startWeight - weight.currentWeight), 0);
    const p = Math.min(done / total, 1);
    const rem = Math.max(Math.abs(weight.currentWeight - weight.goalWeight), 0);
    return { progress: p, remaining: rem, percent: Math.round(p * 100) };
  }, [weight]);

  const circumference = 2 * Math.PI * radius;
  const dashWeight = circumference * progress;
  // 饮食模式两个环统一更小尺寸
  const dietSize = Math.round(140 * scale);
  const dietStroke = strokeWidth;
  const dietRadius = (dietSize - dietStroke) / 2;
  const dietCircumference = 2 * Math.PI * dietRadius;
  const dashDiet = dietCircumference * Math.max(Math.min(1 - diet.caloriesLeft / diet.caloriesBudget, 1), 0);
  const timeStr = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
  const angle = (-90 + progress * 360) * (Math.PI / 180);
  const knobX = size / 2 + radius * Math.cos(angle);
  const knobY = size / 2 + radius * Math.sin(angle);

  // 饮食右侧宏量营养环（示例数据与截图一致）
  const macroSize = dietSize; // 与左侧保持一致大小，但整体更小
  const macroStroke = dietStroke; // 线宽一致
  const macroRadius = (macroSize - macroStroke) / 2;
  const macroCircumference = 2 * Math.PI * macroRadius;
  const macros = { protein: 23, fat: 13, carb: 48 };
  const macroTotal = macros.protein + macros.fat + macros.carb;
  const mProt = macroCircumference * (macros.protein / macroTotal);
  const mFat = macroCircumference * (macros.fat / macroTotal);
  const mCarb = macroCircumference * (macros.carb / macroTotal);

  return (
    <Card style={styles.card}>
      <View style={styles.clip} {...responder.panHandlers}>
        <ImageBackground source={require('../../assets/bg.jpg')} resizeMode="cover" style={styles.bg} imageStyle={styles.bgImage}>
          <View style={styles.overlay} />
          {/* 中央内容区域：固定高度，两个模式绝对叠放 */}
          {/* 饮食模式顶部标题（截图样式） */}
          {active === 'diet' && (
            <View style={styles.dietHeader}>
              <Text style={styles.dietTitle}>均衡饮食计划</Text>
              <Text style={styles.dietToday}>今天 ▾</Text>
            </View>
          )}

          <View style={styles.contentArea}>
            {/* Weight content */}
            <Animated.View style={[styles.contentRowAbs, { transform: [{ translateX: txWeight }], opacity: opWeight }]}>
              <View style={[styles.ringWrap, { width: size, height: size, marginTop: 24 }]}> 
                <Svg width={size} height={size}>
                  <Circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.12)" strokeWidth={strokeWidth} fill="none" />
                  <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#ffffff"
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${dashWeight}, ${circumference}`}
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
                    <Text style={styles.centerNumber}>{weight.currentWeight.toFixed(2)}</Text>
                    <Text style={styles.centerUnit}>公斤</Text>
                  </View>
                  <View style={styles.percentPill}>
                    <Text style={styles.percentText}>目标达成{percent}%</Text>
                  </View>
                </View>
                <View style={[styles.scaleRow, { top: size / 2 + radius - Math.round(22 * scale), left: -12, right: -12 }]}>
                  <Text style={styles.scaleText}>0%</Text>
                  <Text style={styles.scaleText}>100%</Text>
                </View>
              </View>
            </Animated.View>

            {/* Diet content */}
            <Animated.View style={[styles.contentRowAbs, { transform: [{ translateX: txDiet }], opacity: opDiet }]}>
              <View style={styles.twoRingsRow}>
                {/* 左侧剩余热量环 */}
                <View style={[styles.ringWrap, { width: dietSize, height: dietSize }]}>
                  <Svg width={dietSize} height={dietSize}>
                    <Circle cx={dietSize / 2} cy={dietSize / 2} r={dietRadius} stroke="rgba(255,255,255,0.12)" strokeWidth={dietStroke} fill="none" />
                    <Circle
                      cx={dietSize / 2}
                      cy={dietSize / 2}
                      r={dietRadius}
                      stroke="#FFD54F"
                      strokeWidth={dietStroke}
                      strokeDasharray={`${dashDiet}, ${dietCircumference}`}
                      strokeLinecap="round"
                      fill="none"
                      rotation="-90"
                      originX={dietSize / 2}
                      originY={dietSize / 2}
                    />
                  </Svg>
                  <View style={styles.centerTextWrap}>
                    <Text style={styles.centerSub}>还可以吃</Text>
                    <Text style={styles.centerNumber}>{diet.caloriesLeft.toFixed(0)}</Text>
                    <Text style={styles.centerUnit}>预算{diet.caloriesBudget}千卡</Text>
                  </View>
                </View>

                {/* 右侧宏量营养环 */}
                <View style={[styles.ringWrap, { width: macroSize, height: macroSize }]}>
                  <Svg width={macroSize} height={macroSize}>
                    <Circle cx={macroSize / 2} cy={macroSize / 2} r={macroRadius} stroke="rgba(255,255,255,0.12)" strokeWidth={macroStroke} fill="none" />
                    <Circle
                      cx={macroSize / 2}
                      cy={macroSize / 2}
                      r={macroRadius}
                      stroke="#FFA726"
                      strokeWidth={macroStroke}
                      strokeDasharray={`${mProt}, ${macroCircumference}`}
                      strokeDashoffset={0}
                      strokeLinecap="round"
                      fill="none"
                      rotation="-90"
                      originX={macroSize / 2}
                      originY={macroSize / 2}
                    />
                    <Circle
                      cx={macroSize / 2}
                      cy={macroSize / 2}
                      r={macroRadius}
                      stroke="#FF7043"
                      strokeWidth={macroStroke}
                      strokeDasharray={`${mFat}, ${macroCircumference}`}
                      strokeDashoffset={mProt}
                      strokeLinecap="round"
                      fill="none"
                      rotation="-90"
                      originX={macroSize / 2}
                      originY={macroSize / 2}
                    />
                    <Circle
                      cx={macroSize / 2}
                      cy={macroSize / 2}
                      r={macroRadius}
                      stroke="#7E57C2"
                      strokeWidth={macroStroke}
                      strokeDasharray={`${mCarb}, ${macroCircumference}`}
                      strokeDashoffset={mProt + mFat}
                      strokeLinecap="round"
                      fill="none"
                      rotation="-90"
                      originX={macroSize / 2}
                      originY={macroSize / 2}
                    />
                  </Svg>
                  <View style={styles.macroCenter}>
                    <View style={styles.macroLegendRow}><View style={[styles.macroDot,{backgroundColor:'#FFA726'}]} /><Text style={styles.macroLegendText}>蛋白质 23</Text></View>
                    <View style={styles.macroLegendRow}><View style={[styles.macroDot,{backgroundColor:'#FF7043'}]} /><Text style={styles.macroLegendText}>脂肪 13</Text></View>
                    <View style={styles.macroLegendRow}><View style={[styles.macroDot,{backgroundColor:'#7E57C2'}]} /><Text style={styles.macroLegendText}>碳水 48</Text></View>
                  </View>
                </View>
              </View>
            </Animated.View>
          </View>

          {/* bottom info, stays same position */}
          {active === 'weight' ? (
            <>
              <Divider style={{ marginTop: 0, marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.12)' }} />
              <View style={styles.infoDark}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoValueDark}>{weight.startWeight.toFixed(2)}</Text>
                  <Text style={styles.infoLabelDark}>初始体重</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoValueDark}>{remaining.toFixed(2)}</Text>
                  <Text style={styles.infoLabelDark}>距离目标</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoValueDark}>{weight.goalWeight.toFixed(2)}</Text>
                  <Text style={styles.infoLabelDark}>减重目标</Text>
                </View>
              </View>
            </>
          ) : (
            <>
              <Divider style={{ marginTop: 0, marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.12)' }} />
              <View style={styles.mealsRow}>
                {/* 早餐带黄色小环和数值 */}
                <View style={styles.mealItem}>
                  <View style={styles.mealCircleRing}>
                    <Svg width={40} height={40}>
                      <Circle cx={20} cy={20} r={16} stroke="rgba(255,255,255,0.12)" strokeWidth={6} fill="none" />
                      <Circle cx={20} cy={20} r={16} stroke="#FFD54F" strokeWidth={6} strokeDasharray={`${40* Math.PI * 0.6}, ${40* Math.PI}` } strokeLinecap="round" fill="none" />
                    </Svg>
                    <Text style={styles.mealCircleText}>396</Text>
                  </View>
                  <Text style={styles.mealLabel}>早餐</Text>
                </View>
                {['午餐', '晚餐', '加餐'].map((label, i) => (
                  <View key={i} style={styles.mealItem}>
                    <View style={styles.mealCircle}>
                      <Text style={styles.plus}>+</Text>
                    </View>
                    <Text style={styles.mealLabel}>{label}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </ImageBackground>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginTop: 14, borderRadius: 18, backgroundColor: 'transparent' },
  clip: { borderRadius: 18, overflow: 'hidden' },
  bg: { paddingVertical: 16, paddingHorizontal: 16, height: 280 },
  bgImage: { borderRadius: 18 },
  overlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)' },
  contentArea: { height: 168, alignItems: 'center', justifyContent: 'center' },
  contentRowAbs: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  ringWrap: { width: 160, height: 160, alignItems: 'center', justifyContent: 'center' },
  twoRingsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 12 },
  centerTextWrap: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  centerNumber: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '700',
    ...(Platform.OS === 'ios' ? { fontFamily: 'DINAlternate-Bold' } : {}),
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.2
  },
  centerUnit: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginTop: 4, fontWeight: '600' },
  centerTime: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginBottom: 8, fontWeight: '600' },
  centerSub: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginBottom: 8, fontWeight: '600' },
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
  },
  mealsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: -10 },
  mealItem: { alignItems: 'center', justifyContent: 'center' },
  mealCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  plus: { color: 'rgba(255,255,255,0.9)', fontSize: 20, fontWeight: '600' },
  mealLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 0 },
  dietHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  dietTitle: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  dietToday: { color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '600' },
  macroCenter: { position: 'absolute', alignItems: 'flex-start' },
  macroLegendRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 2 },
  macroDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  macroLegendText: { color: 'rgba(255,255,255,0.9)', fontSize: 12 },
  mealCircleRing: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  mealCircleText: { position: 'absolute', color: '#ffffff', fontSize: 12, fontWeight: '700' }
});
