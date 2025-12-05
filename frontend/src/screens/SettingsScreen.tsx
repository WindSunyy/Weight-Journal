import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Card } from 'react-native-paper';
import { logout } from '../api/user';

interface SettingsScreenProps {
  token: string;
  onLogout: () => void;
  onGotoTargetWeight?: () => void;
}

export default function SettingsScreen({ token, onLogout, onGotoTargetWeight }: SettingsScreenProps) {
  const handleLogout = async () => {
    try {
      const res = await logout(token);
      if (res.data.success) {
        Alert.alert('提示', '已退出登录');
        onLogout();
      } else {
        Alert.alert('错误', res.data.message || '退出失败');
      }
    } catch (err) {
      // 错误弹窗已由 request 封装处理
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>设置</Text>
          <Text style={styles.desc}>这里可以配置提醒、单位、目标等。</Text>
          <TouchableOpacity
            style={{ marginTop: 18, backgroundColor: '#F3F4F6', borderRadius: 10, padding: 14, alignItems: 'center' }}
            onPress={() => {
              if (onGotoTargetWeight) {
                onGotoTargetWeight();
              } else {
                Alert.alert('提示', '请在App导航中配置TargetWeight页面');
              }
            }}
          >
            <Text style={{ color: '#10B981', fontWeight: 'bold', fontSize: 16 }}>目标体重设置</Text>
          </TouchableOpacity>
        </Card.Content>
      </Card>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>退出登录</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', paddingHorizontal: 16, paddingTop: 16 },
  card: { borderRadius: 16, backgroundColor: '#fff', elevation: 0 },
  title: { fontSize: 18, fontWeight: '700', color: '#111827' },
  desc: { marginTop: 8, fontSize: 14, color: '#4b5563' },
  logoutBtn: {
    marginTop: 32,
    backgroundColor: '#111',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
