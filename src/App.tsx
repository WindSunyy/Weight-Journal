import React, { useState } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { MonochromeLightTheme } from './theme';
import { View, StyleSheet } from 'react-native';
import HeaderTabs from './components/HeaderTabs';
import MainScreen from './screens/MainScreen';
import BottomNav from './components/BottomNav';
import SettingsScreen from './screens/SettingsScreen';
import PlusSheet from './components/PlusSheet';
import RecordScreen from './screens/RecordScreen';

export type TabKey = 'diet' | 'weight';
type PageKey = 'record' | 'settings';

export default function App() {
  const [tab, setTab] = useState<TabKey>('weight');
  const [page, setPage] = useState<PageKey>('record');
  const [plusOpen, setPlusOpen] = useState(false);
  const [recordKey, setRecordKey] = useState<string | null>(null);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={MonochromeLightTheme}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.container}>
            {page === 'record' && (
              recordKey ? (
                <RecordScreen keyProp={recordKey} onClose={() => setRecordKey(null)} />
              ) : (
                <>
                  <HeaderTabs active={tab} onChange={setTab} />
                  <MainScreen active={tab} onSwitch={setTab} />
                </>
              )
            )}
            {page === 'settings' && <SettingsScreen />}
            <BottomNav
              onPressLeft={() => { setPage('record'); setRecordKey(null); }}
              onPressRight={() => setPage('settings')}
              onPressCenter={() => setPlusOpen(true)}
            />
            <PlusSheet visible={plusOpen} onClose={() => setPlusOpen(false)} onSelect={(key: string) => {
              // 简单处理：选择“记体重”等后关闭弹层；后续可导航到对应记录页面
              setPlusOpen(false);
              setPage('record');
              // 选择后进入通用记录页面，同时根据体重切换到体重标签
              setRecordKey(key);
              if (key === 'weight') setTab('weight');
            }} />
          </View>
        </SafeAreaView>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fcfcfc' },
  container: {
    flex: 1,
    paddingTop: 4,
    paddingBottom: 96,
    backgroundColor: '#ffffff'
  }
});
