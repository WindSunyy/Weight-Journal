import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>设置</Text>
          <Text style={styles.desc}>这里可以配置提醒、单位、目标等。
          </Text>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', paddingHorizontal: 16, paddingTop: 16 },
  card: { borderRadius: 16, backgroundColor: '#fff', elevation: 0 },
  title: { fontSize: 18, fontWeight: '700', color: '#111827' },
  desc: { marginTop: 8, fontSize: 14, color: '#4b5563' }
});
