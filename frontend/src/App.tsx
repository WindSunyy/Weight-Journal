import React, { useState } from 'react';
import { setRequestToken } from './utils/request';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { MonochromeLightTheme } from './theme';
import { View, StyleSheet } from 'react-native';
import HeaderTabs from './components/HeaderTabs';
import MainScreen from './screens/MainScreen';
import BottomNav from './components/BottomNav';
import SettingsScreen from './screens/SettingsScreen';
import TargetWeightScreen from './screens/TargetWeightScreen';
import PlusSheet from './components/PlusSheet';
import RecordScreen from './screens/RecordScreen';
import { BlurView } from 'expo-blur';
import LoginScreen from './screens/LoginScreen';

export type TabKey = 'diet' | 'weight';
type PageKey = 'record' | 'settings';

type AppPageKey = PageKey | 'targetWeight' | 'profileEdit';

export default function App() {
  const [tab, setTab] = useState<TabKey>('weight');
  const [page, setPage] = useState<AppPageKey>('record');
  const [plusOpen, setPlusOpen] = useState(false);
  const [recordKey, setRecordKey] = useState<string | null>(null);
  const [showRecordDrawer, setShowRecordDrawer] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0);
  const handleLoginSuccess = (token: string) => {
    setToken(token);
    setRequestToken(token);
    setIsLoggedIn(true);
  };
  const handleLogout = () => {
    setToken('');
    setRequestToken('');
    setIsLoggedIn(false);
    setPage('record');
    setRecordKey(null);
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaProvider>
        <PaperProvider theme={MonochromeLightTheme}>
          <LoginScreen onLoginSuccess={handleLoginSuccess} />
        </PaperProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={MonochromeLightTheme}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.container}>
            {page === 'record' && (
              <>
                <HeaderTabs active={tab} onChange={setTab} />
                <MainScreen active={tab} onSwitch={setTab} token={token} refreshKey={refreshKey} />
                {showRecordDrawer && recordKey && (
                  <>
                    <BlurView style={StyleSheet.absoluteFill} intensity={30} tint="light" />
                    <RecordScreen
                      keyProp={recordKey}
                      visible={showRecordDrawer}
                      onClose={() => {
                        setShowRecordDrawer(false);
                        setRecordKey(null);
                      }}
                      onSave={() => setRefreshKey(k => k + 1)}
                      token={token}
                    />
                  </>
                )}
              </>
            )}
            {page === 'settings' && (
              <SettingsScreen
                token={token}
                onLogout={handleLogout}
                onGotoTargetWeight={() => setPage('targetWeight')}
                onGotoProfileEdit={() => setPage('profileEdit')}
              />
            )}
            {page === 'profileEdit' && (
              // 轻量导航：使用 goBack 返回设置页
              // 为避免引入额外导航库，这里用本地状态切换
              // eslint-disable-next-line @typescript-eslint/no-var-requires
              (() => {
                const ProfileEditScreen = require('./screens/ProfileEditScreen').default;
                return <ProfileEditScreen navigation={{ goBack: () => setPage('settings') }} />;
              })()
            )}
            {page === 'targetWeight' && <TargetWeightScreen navigation={{ goBack: () => setPage('settings') }} />}
            <BottomNav
              onPressLeft={() => { setPage('record'); setRecordKey(null); }}
              onPressRight={() => setPage('settings')}
              onPressCenter={() => setPlusOpen(true)}
            />
            <PlusSheet visible={plusOpen} onClose={() => setPlusOpen(false)} onSelect={(key: string) => {
              setPlusOpen(false);
              if (key === 'weight') {
                setPage('record');
                setRecordKey(key);
                setShowRecordDrawer(true);
                setTab('weight');
              }
              // 其他类型可按需处理
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
