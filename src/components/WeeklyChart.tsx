import React, { useMemo, useRef, useState } from 'react';
import { View, Animated, Easing, Text, Platform, PanResponder } from 'react-native';
import { Card } from 'react-native-paper';

type DayData = { day: string; value: number };
type Props = {
  weeks: DayData[][]; // 每周7天数据，最新一周在索引0
  title?: string; // 标题，如“本周体重”
};

export default function WeeklyChart({ weeks = [], title = '本周体重' }: Props) {
  const [index, setIndex] = useState(0);
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const contentShift = useRef(new Animated.Value(0)).current;

  const safeWeeks = Array.isArray(weeks) ? weeks : [];
  const rawData = useMemo(() => (safeWeeks[index] ?? []), [safeWeeks, index]);

  const toCN = (d: string) => {
    const map: Record<string, string> = {
      Mon: '周一', Tue: '周二', Wed: '周三', Thu: '周四', Fri: '周五', Sat: '周六', Sun: '周日',
      Monday: '周一', Tuesday: '周二', Wednesday: '周三', Thursday: '周四', Friday: '周五', Saturday: '周六', Sunday: '周日',
      '周一': '周一', '周二': '周二', '周三': '周三', '周四': '周四', '周五': '周五', '周六': '周六', '周日': '周日'
    };
    return map[d] ?? d;
  };
  const orderedDays = ['周一','周二','周三','周四','周五','周六','周日'];
  const dayIndexMap: Record<string, number> = {
    '周一': 1, '周二': 2, '周三': 3, '周四': 4, '周五': 5, '周六': 6, '周日': 7
  };
  const data = rawData.map((d) => ({ day: toCN(d.day), value: d.value }));
  const valuesByDay = orderedDays.map((d) => {
    const found = data.find((x) => x.day === d);
    return typeof found?.value === 'number' ? found.value : 0;
  });
  const maxValue = Math.max(...valuesByDay, 1);

  const animateIn = () => {
    contentOpacity.setValue(0.9);
    contentShift.setValue(12);
    Animated.parallel([
      Animated.timing(contentOpacity, { toValue: 1, duration: 180, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(contentShift, { toValue: 0, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true })
    ]).start();
  };

  const animateReset = () => {
    Animated.parallel([
      Animated.spring(contentShift, {
        toValue: 0,
        useNativeDriver: true,
        stiffness: 140,
        damping: 20,
        mass: 1
      }),
      Animated.timing(contentOpacity, { toValue: 1, duration: 140, easing: Easing.out(Easing.quad), useNativeDriver: true })
    ]).start();
  };

  const animateTransition = (dir: number) => {
    // dir: 1 代表向右（上周），-1 代表向左（下周）
    contentOpacity.setValue(0.6);
    contentShift.setValue(dir * 24);
    Animated.parallel([
      Animated.timing(contentOpacity, { toValue: 1, duration: 180, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(contentShift, { toValue: 0, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true })
    ]).start();
  };

  const responder = useRef(
    PanResponder.create({
      // 初始不抢占，让移动阶段根据水平滑动再决定
      onStartShouldSetPanResponder: () => false,
      // 水平滑动占优且有一定位移时启用本组件手势
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > Math.abs(g.dy) && Math.abs(g.dx) > 6,
      // 捕获移动，阻止父视图（主页）滚动
      onMoveShouldSetPanResponderCapture: (_, g) => Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderGrant: () => {
        // 手势开始时，轻微降低不透明度，准备平滑过渡
        contentOpacity.setValue(0.96);
      },
      onPanResponderMove: (_, g) => {
        // 跟手但限制位移，避免越界
        const clamped = Math.max(Math.min(g.dx, 72), -72);
        contentShift.setValue(clamped * 0.28);
      },
      onPanResponderRelease: (_, g) => {
        const threshold = 36;
        if (g.dx > threshold) {
          const next = Math.min(index + 1, safeWeeks.length - 1);
          if (next !== index) {
            setIndex(next);
            animateTransition(1);
          }
          animateReset();
        } else if (g.dx < -threshold) {
          // 左滑：显示下一周（更近一周），仅后退一周，最小到0
          const prev = Math.max(index - 1, 0);
          if (prev !== index) {
            setIndex(prev);
            animateTransition(-1);
          }
          animateReset();
        } else {
          // 回弹到原位
          animateReset();
        }
      },
      // 不允许中途交还，避免父视图抢占导致页面上下抖动
      onPanResponderTerminationRequest: () => false,
      onPanResponderTerminate: () => {
        // 手势中断（被其他控件抢占或系统打断）时，确保回弹归位
        animateReset();
      }
    })
  ).current;

  const totalWeeks = safeWeeks.length;
  const formatTwo = (n: number) => (typeof n === 'number' ? n.toFixed(2) : n);

  const formatDateRange = () => {
    const today = new Date();
    const weekday = today.getDay(); // 0=周日, 1=周一
    const offsetToMonday = weekday === 0 ? -6 : 1 - weekday; // 调到本周周一
    const start = new Date(today);
    start.setDate(today.getDate() + offsetToMonday - index * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const pad = (v: number) => String(v).padStart(2, '0');
    return `${pad(start.getMonth() + 1)}月${pad(start.getDate())}日-${pad(end.getMonth() + 1)}月${pad(end.getDate())}日`;
  };
  return (
    <Card style={{
      marginHorizontal: 16,
      marginTop: 14,
      borderRadius: 18,
      backgroundColor: '#ffffff',
      elevation: 0,
      shadowColor: 'transparent',
      shadowOpacity: 0,
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 0
    }}>
      <Card.Content>
        {/* 将手势绑定在图表区域，减少对父视图的影响 */}
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 2, marginBottom: 8 }}>
            <Text style={{ color: '#4b5563', fontSize: 14, fontWeight: '600' }}>{formatDateRange()}</Text>
          </View>
          <Animated.View {...(responder?.panHandlers ?? {})} style={{ backgroundColor: '#ffffff', borderRadius: 16, paddingVertical: 8, overflow: 'hidden' }}>
            <View style={{ height: 240, paddingHorizontal: 8 }}>
              <View style={{ position: 'absolute', left: 8, right: 8, top: 120, borderTopWidth: 1, borderTopColor: '#e5e7eb', borderStyle: 'dashed' }} />
              <Animated.View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', opacity: contentOpacity, transform: [{ translateX: contentShift }] }}>
                {valuesByDay.map((v, i) => {
                  const h = Math.max((v / maxValue) * 170, v > 0 ? 6 : 4);
                  const wk = new Date().getDay();
                  const todayIdx = wk === 0 ? 6 : wk - 1; // 0->周日索引6
                  const isToday = i === todayIdx && index === 0;
                  const color = v > 0 ? 'rgb(53,53,53)' : '#f3f4f6';
                  return (
                    <View key={i} style={{ width: 24, alignItems: 'center' }}>
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="clip"
                        style={{
                          color: '#4b5563',
                          fontSize: 10,
                          lineHeight: 12,
                          textAlign: 'center',
                          marginBottom: 4,
                          ...(Platform.OS === 'ios' ? { fontFamily: 'DINAlternate-Bold' } : {}),
                          fontVariant: ['tabular-nums'],
                          letterSpacing: 0.2
                        }}
                      >
                        {formatTwo(v)}
                      </Text>
                      <View style={{ width: 24, height: h, borderRadius: 1, backgroundColor: color }} />
                      <Text style={{ color: isToday ? '#4b5563' : '#9ca3af', fontSize: 12, marginTop: 6 }}>{orderedDays[i]}</Text>
                    </View>
                  );
                })}
              </Animated.View>
            </View>
          </Animated.View>
          {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingHorizontal: 2 }}>
            <Text style={{ color: index === totalWeeks - 1 ? '#9ca3af' : '#4b5563' }}>左滑查看更早一周</Text>
            <Text style={{ color: index === 0 ? '#9ca3af' : '#4b5563' }}>{index === 0 ? '已是最新一周' : '右滑返回较近一周'}</Text>
          </View> */}
        </View>
      </Card.Content>
    </Card>
  );
}
