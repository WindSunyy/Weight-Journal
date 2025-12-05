import React, { useRef, useState } from 'react';
import { useEffect } from 'react';
import { getWeightList, getTargetWeight } from '../api/weight';
import { ScrollView } from 'react-native';
import WeeklyChart from '../components/WeeklyChart';
import ProgressSwitchCard from '../components/ProgressSwitchCard';
import type { TabKey } from '../App';

export default function MainScreen({ active, onSwitch, token, refreshKey }: { active: TabKey; onSwitch: (t: TabKey) => void; token: string; refreshKey?: number }) {
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const scrollRef = useRef(null);
  // 真数据 state
  const [weeks, setWeeks] = useState<any[][]>([]);
  const [baseMonday, setBaseMonday] = useState<Date | null>(null);
  const [goalWeight, setGoalWeight] = useState<number>(68);

  useEffect(() => {
    getWeightList().then(res => {
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        // 调试：打印后端返回的原始数据
        const records: { record_date: string; weight: number; unit: string }[] = res.data.data;
        console.log('weight records:', records);
        const valueByDate: Record<string, number> = {};
        records.forEach(r => {
          const d = new Date(r.record_date + 'T00:00:00');
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          valueByDate[`${y}-${m}-${day}`] = Number(r.weight);
        });

        // 生成从本周（周一开始）往前3年的所有周，按周一到周日排列
        const today = new Date();
        const weekday = today.getDay(); // 0=周日,1=周一
        const offsetToMonday = weekday === 0 ? -6 : 1 - weekday;
        const thisMonday = new Date(today);
        thisMonday.setHours(0,0,0,0);
        thisMonday.setDate(today.getDate() + offsetToMonday);

        const threeYearsAgo = new Date(thisMonday);
        threeYearsAgo.setFullYear(thisMonday.getFullYear() - 3);

        const weeksAll: { day: string; value: number }[][] = [];
        const dayNamesOrder = ['周一','周二','周三','周四','周五','周六','周日'];

        // 从当前周开始向过去推进，直到3年前的周一
        for (let start = new Date(thisMonday); start >= threeYearsAgo; ) {
          const week: { day: string; value: number }[] = [];
          for (let i = 0; i < 7; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const key = `${y}-${m}-${day}`;
            week.push({ day: dayNamesOrder[i], value: valueByDate[key] ?? 0 });
          }
          weeksAll.push(week);
          // 往前一周
          const prevMonday = new Date(start);
          prevMonday.setDate(start.getDate() - 7);
          start = prevMonday;
        }

        // 最新一周在索引0，已满足“最大显示到本周”要求
        setWeeks(weeksAll);
        // 保存基准周一
        setBaseMonday(thisMonday);
        
      } else {
        // 即使接口没有返回成功，也生成空数据的三年周网格，保证可滑动
        const today = new Date();
        const weekday = today.getDay();
        const offsetToMonday = weekday === 0 ? -6 : 1 - weekday;
        const thisMonday = new Date(today);
        thisMonday.setHours(0,0,0,0);
        thisMonday.setDate(today.getDate() + offsetToMonday);

        const threeYearsAgo = new Date(thisMonday);
        threeYearsAgo.setFullYear(thisMonday.getFullYear() - 3);

        const weeksAll: { day: string; value: number }[][] = [];
        const dayNamesOrder = ['周一','周二','周三','周四','周五','周六','周日'];
        for (let start = new Date(thisMonday); start >= threeYearsAgo; ) {
          const week: { day: string; value: number }[] = [];
          for (let i = 0; i < 7; i++) {
            week.push({ day: dayNamesOrder[i], value: 0 });
          }
          weeksAll.push(week);
          const prevMonday = new Date(start);
          prevMonday.setDate(start.getDate() - 7);
          start = prevMonday;
        }
        setWeeks(weeksAll);
        setBaseMonday(thisMonday);
        
      }
    }).catch(() => {
      // 请求失败也生成空数据的三年周网格
      const today = new Date();
      const weekday = today.getDay();
      const offsetToMonday = weekday === 0 ? -6 : 1 - weekday;
      const thisMonday = new Date(today);
      thisMonday.setHours(0,0,0,0);
      thisMonday.setDate(today.getDate() + offsetToMonday);

      const threeYearsAgo = new Date(thisMonday);
      threeYearsAgo.setFullYear(thisMonday.getFullYear() - 3);

      const weeksAll: { day: string; value: number }[][] = [];
      const dayNamesOrder = ['周一','周二','周三','周四','周五','周六','周日'];
      for (let start = new Date(thisMonday); start >= threeYearsAgo; ) {
        const week: { day: string; value: number }[] = [];
        for (let i = 0; i < 7; i++) {
          week.push({ day: dayNamesOrder[i], value: 0 });
        }
        weeksAll.push(week);
        const prevMonday = new Date(start);
        prevMonday.setDate(start.getDate() - 7);
        start = prevMonday;
      }
      setWeeks(weeksAll);
      setBaseMonday(thisMonday);
      
    });
  }, [token, refreshKey]);

  // 加载目标体重（真实值）
  useEffect(() => {
    (async () => {
      try {
        const res = await getTargetWeight();
        const raw = res.data?.data?.targetWeight;
        const gw = raw != null ? Number(raw) : NaN;
        if (!isNaN(gw)) setGoalWeight(gw);
      } catch {
        // 保持默认值
      }
    })();
  }, [token, refreshKey]);

  return (
    <ScrollView ref={scrollRef} scrollEnabled={scrollEnabled}>
      <ProgressSwitchCard
        active={active}
        onSwitch={onSwitch}
        onTouchIn={() => setScrollEnabled(false)}
        onTouchOut={() => setScrollEnabled(true)}
        weight={{
          startWeight: (() => {
            // 取最早一条真实体重记录
            let minWeight = null;
            if (weeks && weeks.length > 0) {
              for (let i = weeks.length - 1; i >= 0; i--) {
                for (let j = 0; j < weeks[i].length; j++) {
                  const v = weeks[i][j];
                  if (typeof v.value === 'number' && v.value > 0) {
                    minWeight = v.value;
                    break;
                  }
                }
                if (minWeight !== null) break;
              }
            }
            return minWeight ?? 75;
          })(),
          currentWeight: (() => {
            // 取最近一次非零体重记录；若没有则为0.00
            let latest: number = 0;
            if (weeks && weeks.length > 0) {
              // 从最新周开始向前搜索
              for (let i = 0; i < weeks.length; i++) {
                const week = weeks[i];
                for (let j = week.length - 1; j >= 0; j--) {
                  const v = week[j];
                  if (typeof v.value === 'number' && v.value > 0) {
                    latest = v.value;
                    return latest;
                  }
                }
              }
            }
            return latest;
          })(),
          goalWeight
        }}
        diet={{ caloriesLeft: 1472, caloriesBudget: 1868 }}
      />
      <WeeklyChart
        weeks={weeks}
        baseMonday={baseMonday ?? undefined}
        onTouchIn={() => setScrollEnabled(false)}
        onTouchOut={() => setScrollEnabled(true)}
      />
    </ScrollView>
  );
}
