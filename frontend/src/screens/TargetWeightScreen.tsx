import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, PanResponder, Pressable, ScrollView, Animated, Alert } from 'react-native';
import { getUserProfile } from '../storage';
import { getProfile } from '../api/user';
import { setTargetWeight, getTargetWeight } from '../api/weight';

// 高度从个人资料中联动

const MIN_WEIGHT = 10;
const MAX_WEIGHT = 300;
const STEP = 0.5;
const VISIBLE_RANGE = 20; // 屏幕显示±10kg范围
const ITEM_WIDTH = 16; // 每个刻度宽度
const SCALE_WIDTH = ITEM_WIDTH * (VISIBLE_RANGE / STEP + 1);
const BMI_NORMAL_MIN = 18.5;
const BMI_NORMAL_MAX = 24.9;

function getBMI(weight: number, height: number) {
  return weight / ((height / 100) ** 2);
}


// BMI 分类函数
function getBMICategory(bmi: number): 'under' | 'normal' | 'over' | 'obese' {
  if (bmi < 18.5) return 'under';
  if (bmi <= 24.9) return 'normal';
  if (bmi <= 28) return 'over';
  return 'obese';
}

const COLOR_MAP = {
  under: '#A7F3D0', // 浅绿
  normal: '#10B981', // 深绿
  over: '#FBBF24', // 橙黄
  obese: '#EF4444', // 红色
};

export default function TargetWeightScreen({ navigation }: { navigation: any }) {
  const [heightCm, setHeightCm] = React.useState<number>(170);
    const [limitTip, setLimitTip] = React.useState('');
  const weight = useRef(new Animated.Value(75)).current;
  const [weightValue, setWeightValue] = React.useState(75);
  const scrollRef = useRef<ScrollView>(null);

  // 加载个人资料中的身高，优先后端，失败回本地
  useEffect(() => {
    (async () => {
      try {
        const res = await getProfile();
        if (res.data && res.data.success) {
          const server = res.data.data || {};
          if (server && server.heightCm) setHeightCm(Number(server.heightCm));
          else {
            const local = await getUserProfile();
            if (local && local.heightCm) setHeightCm(Number(local.heightCm));
          }
        } else {
          const local = await getUserProfile();
          if (local && local.heightCm) setHeightCm(Number(local.heightCm));
        }
      } catch {
        const local = await getUserProfile();
        if (local && local.heightCm) setHeightCm(Number(local.heightCm));
      }
    })();
  }, []);

  // 加载后端已保存的目标体重并应用到刻度
  useEffect(() => {
    (async () => {
      try {
        const res = await getTargetWeight();
        if (res.data && res.data.success) {
          const raw = res.data.data?.targetWeight;
          const twNum = raw != null ? Number(raw) : NaN;
          if (!isNaN(twNum) && twNum > MIN_WEIGHT && twNum < MAX_WEIGHT) {
            setWeightValue(twNum);
            Animated.spring(weight, { toValue: twNum, useNativeDriver: false, speed: 24, bounciness: 1 }).start();
          }
        }
      } catch {
        // 忽略错误，使用默认值
      }
    })();
  }, [weight]);

  // weight 动画值监听
  useEffect(() => {
    const id = weight.addListener(({ value }) => {
      setWeightValue(value);
    });
    return () => weight.removeListener(id);
  }, [weight]);

  // 只在 weightValue 到 0.5 的整数时重算 visibleWeights，减少闪烁
  // 计算刻度区间和留白
  const { visibleWeights, leftPadding, rightPadding } = React.useMemo(() => {
    const arr = [];
    let center = Math.round(weightValue * 2) / 2;
    let start, end, leftPadding = 0, rightPadding = 0;
    // 左端居中
    if (center <= MIN_WEIGHT + VISIBLE_RANGE / 2) {
      start = MIN_WEIGHT;
      end = start + VISIBLE_RANGE;
      leftPadding = SCALE_WIDTH / 2 - ITEM_WIDTH / 2;
      rightPadding = 0;
    }
    // 右端居中
    else if (center >= MAX_WEIGHT - VISIBLE_RANGE / 2) {
      end = MAX_WEIGHT;
      start = end - VISIBLE_RANGE;
      leftPadding = 0;
      rightPadding = SCALE_WIDTH / 2 - ITEM_WIDTH / 2;
    }
    // 中间自然滑动
    else {
      start = center - VISIBLE_RANGE / 2;
      end = center + VISIBLE_RANGE / 2;
      leftPadding = 0;
      rightPadding = 0;
    }
    for (let w = start; w <= end; w += STEP) {
      arr.push(Math.round(w * 10) / 10);
    }
    return { visibleWeights: arr, leftPadding, rightPadding };
  }, [Math.round(weightValue * 2) / 2]);

  // 拖动刻度区，带动画
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      const delta = -Math.round(gesture.dx / ITEM_WIDTH) * STEP * 4;
      let newWeight = Math.round((weightValue + delta) * 2) / 2;
      // 边界提示与锁定
      if (newWeight < 30) {
        setLimitTip('太瘦啦，重新选择吧～');
        newWeight = 30;
      } else if (newWeight > 200) {
        setLimitTip('太胖啦，重新选择吧～');
        newWeight = 200;
      } else {
        setLimitTip('');
      }
      Animated.spring(weight, {
        toValue: newWeight,
        useNativeDriver: false,
        speed: 24,
        bounciness: 1,
      }).start();
    },
  });

  // 计算 BMI 区间
  const bmi = getBMI(weightValue, heightCm);
  const bmiCategory = getBMICategory(bmi);
  // 理想体重范围
  const idealMin = Math.round(BMI_NORMAL_MIN * (heightCm / 100) ** 2 * 10) / 10;
  const idealMax = Math.round(BMI_NORMAL_MAX * (heightCm / 100) ** 2 * 10) / 10;
  // visibleWeights 已用 useMemo 缓存，无需重复声明

  return (
    <View style={styles.container}>
      <Text style={styles.title}>设置体重目标</Text>
      <View style={styles.scaleWrap}>
        <View style={styles.scaleBarOuter} {...panResponder.panHandlers}>
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ alignItems: 'center' }}
            style={{ width: SCALE_WIDTH, overflow: 'hidden' }}
            scrollEnabled={false}
          >
            <View style={[styles.scaleBar, { paddingLeft: leftPadding, paddingRight: rightPadding }]}> 
              {visibleWeights.map((w, i) => {
                const bmi = getBMI(w, heightCm);
                const cat = getBMICategory(bmi);
                const isMajor = w % 5 === 0;
                return (
                  <View key={i} style={{ alignItems: 'center', width: ITEM_WIDTH }}>
                    <View style={{ width: 4, height: isMajor ? 44 : 28, backgroundColor: COLOR_MAP[cat], borderRadius: 2 }} />
                  </View>
                );
              })}
            </View>
          </ScrollView>
          {/* 居中黑色竖线作为选中指示器 */}
          <View style={styles.centerLine} />
        </View>
      </View>
      <View style={styles.centerValue}>
        <Text style={styles.weightValue}>{weightValue.toFixed(1)} 公斤</Text>
        <View style={[styles.bmiTag, { backgroundColor: COLOR_MAP[bmiCategory] }]}>
          <Text style={styles.bmiTagText}>
            {bmiCategory === 'normal' ? '理想' : bmiCategory === 'under' ? '偏瘦' : bmiCategory === 'over' ? '偏胖' : '肥胖'}
          </Text>
        </View>
        {limitTip ? (
          <Text style={{ color: '#EF4444', fontWeight: 'bold', fontSize: 16, marginTop: 8 }}>{limitTip}</Text>
        ) : null}
      </View>
      <View style={styles.infoBlock}>
        <Text style={styles.infoLabel}>理想体重范围</Text>
        <Text style={styles.infoValue}>{idealMin}–{idealMax} 公斤</Text>
        <Text style={styles.infoDesc}>已为您保留原目标体重（{weightValue.toFixed(1)}公斤），您也可以左右滑动刻度，自定义设置目标体重。</Text>
        <Text style={styles.infoLabel}>预计达成时间</Text>
        <Text style={styles.infoValue}>半年多</Text>
        <Text style={styles.infoDesc}>目标预计达成时间，是根据您和其他同体型用户的体重变化速率综合计算得出。</Text>
      </View>
      <Pressable
        style={styles.btn}
        onPress={async () => {
          try {
            const res = await setTargetWeight(weightValue);
            // if (res.data && res.data.success) {
            //   Alert.alert('提示', '目标体重已保存');
            // }
          } catch (e) {
            // 错误弹窗在 request 拦截器里已处理
          }
          navigation.goBack();
        }}
      >
        <Text style={styles.btnText}>完成</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
    centerLine: {
      position: 'absolute',
      left: '50%',
      marginLeft: -2,
      top: 0,
      width: 4,
      height: 48,
      backgroundColor: '#222',
      borderRadius: 2,
      zIndex: 10,
    },
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 32 },
  title: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 18 },
  scaleWrap: { alignItems: 'center', marginBottom: 18 },
  scaleBarOuter: { width: SCALE_WIDTH, height: 48, alignItems: 'center', justifyContent: 'center', position: 'relative', borderRadius: 12, overflow: 'hidden' },
  scaleBar: { flexDirection: 'row', alignItems: 'flex-end', height: 48 },
  thumbCenter: { position: 'absolute', left: '50%', marginLeft: -22, top: 0, width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', borderWidth: 2, borderColor: '#10B981', alignItems: 'center', justifyContent: 'center', elevation: 2 },
  thumbText: { fontSize: 16, fontWeight: 'bold', color: '#10B981' },
  centerValue: { alignItems: 'center', marginBottom: 12 },
  weightValue: { fontSize: 32, fontWeight: 'bold', color: '#222', marginBottom: 6 },
  bmiTag: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 8 },
  bmiTagText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  infoBlock: { marginHorizontal: 32, marginBottom: 18 },
  infoLabel: { color: '#10B981', fontWeight: 'bold', fontSize: 15, marginTop: 12 },
  infoValue: { color: '#222', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  infoDesc: { color: '#666', fontSize: 13, marginBottom: 6 },
  btn: { marginTop: 18, backgroundColor: '#222', borderRadius: 12, alignItems: 'center', justifyContent: 'center', height: 48, marginHorizontal: 32 },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
