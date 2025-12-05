import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, TextInput } from 'react-native-paper';
import { getUserProfile, saveUserProfile, UserProfile } from '../storage';
import { getProfile, updateProfile } from '../api/user';

interface ProfileEditScreenProps {
  navigation: { goBack: () => void };
}

export default function ProfileEditScreen({ navigation }: ProfileEditScreenProps) {
  const [profile, setProfile] = useState<UserProfile>({
    avatarUri: undefined,
    nickname: undefined,
    gender: '男',
    birthYear: 2000,
    heightCm: undefined,
  });
  const [pickerVisible, setPickerVisible] = useState<false | 'birthYear' | 'height'>(false);
  const ITEM_HEIGHT = 44;
  const [wheelIndex, setWheelIndex] = useState<number>(0);
  const SHEET_HEIGHT = Math.round(Dimensions.get('window').height * 0.5);

  useEffect(() => {
    (async () => {
      try {
        const res = await getProfile();
        if (res.data && res.data.success) {
          const server = res.data.data || {};
          const merged: UserProfile = {
            avatarUri: server.avatarUri || undefined,
            nickname: server.nickname || undefined,
            gender: (server.gender as UserProfile['gender']) || '男',
            birthYear: server.birthYear || undefined,
            heightCm: server.heightCm || undefined,
          };
          setProfile(merged);
          await saveUserProfile(merged);
        } else {
          const local = await getUserProfile();
          if (local) setProfile(local);
        }
      } catch {
        const local = await getUserProfile();
        if (local) setProfile(local);
      }
    })();
  }, []);

  const pickImage = async () => {
    // 留作后续集成图片选择（需安装相关库）。
    // 当前占位：不改变头像，直接返回。
    return;
  };

  const save = async () => {
    try {
      const res = await updateProfile({
        avatarUri: profile.avatarUri,
        nickname: profile.nickname,
        gender: profile.gender,
        birthYear: profile.birthYear,
        heightCm: profile.heightCm,
      });
      if (res.data && res.data.success) {
        await saveUserProfile(profile);
        navigation.goBack();
      }
    } catch (e) {
      // 后端失败也保存在本地，避免数据丢失
      await saveUserProfile(profile);
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>个人资料</Text>

          {/* 头像 */}
          <TouchableOpacity style={styles.row} onPress={pickImage}>
            <Text style={styles.label}>头像</Text>
            <View style={styles.right}>
              {profile.avatarUri ? (
                <Image source={{ uri: profile.avatarUri }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]} />
              )}
              <Text style={styles.arrow}>›</Text>
            </View>
          </TouchableOpacity>

          {/* 昵称 */}
          <View style={styles.row}>
            <Text style={styles.label}>昵称</Text>
            <View style={styles.right}>
              <TextInput
                style={styles.input}
                mode="flat"
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                placeholder="未设置昵称"
                value={profile.nickname || ''}
                onChangeText={(t) => setProfile(prev => ({ ...prev, nickname: t }))}
              />
              <Text style={styles.arrow}>›</Text>
            </View>
          </View>

          {/* 性别 */}
          <View style={styles.row}>
            <Text style={styles.label}>性别</Text>
            <View style={styles.rightButtons}>
              {['男', '女'].map(g => (
                <TouchableOpacity
                  key={g}
                  style={[styles.segmentBtn, profile.gender === g && styles.segmentBtnActive]}
                  onPress={() => setProfile(prev => ({ ...prev, gender: g as UserProfile['gender'] }))}
                >
                  <Text style={[styles.segmentText, profile.gender === g && styles.segmentTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 出生年份 */}
          <TouchableOpacity style={styles.row} onPress={() => setPickerVisible('birthYear')}>
            <Text style={styles.label}>出生年份</Text>
            <View style={styles.right}>
              <Text style={styles.valueText}>{profile.birthYear ? `${profile.birthYear}年` : '请选择'}</Text>
              <Text style={styles.arrow}>›</Text>
            </View>
          </TouchableOpacity>

          {/* 身高 */}
          <TouchableOpacity style={styles.row} onPress={() => setPickerVisible('height')}>
            <Text style={styles.label}>身高</Text>
            <View style={styles.right}>
              <Text style={styles.valueText}>{profile.heightCm ? `${profile.heightCm} cm` : '请选择'}</Text>
              <Text style={styles.arrow}>›</Text>
            </View>
          </TouchableOpacity>

          {/* 保存按钮 */}
          <TouchableOpacity style={styles.saveBtn} onPress={save}>
            <Text style={styles.saveText}>保存</Text>
          </TouchableOpacity>
        </Card.Content>
      </Card>

      {/* iOS 风格滚轮选择器 */}
      <Modal visible={!!pickerVisible} transparent animationType="slide" onRequestClose={() => setPickerVisible(false)}>
        <View style={styles.modalMask}>
          <SafeAreaView style={[styles.sheetContainer, { height: SHEET_HEIGHT }]} edges={['bottom']}>
            <View style={styles.sheetHeader}>
              <TouchableOpacity style={styles.sheetCancel} onPress={() => setPickerVisible(false)}>
                <Text style={styles.sheetCancelText}>取消</Text>
              </TouchableOpacity>
              <Text style={styles.sheetHeaderTitle}>{pickerVisible === 'birthYear' ? '选择出生年份' : '选择身高'}</Text>
              <TouchableOpacity
                style={styles.sheetDone}
                onPress={() => {
                  const data = pickerVisible === 'birthYear' ? yearsData : heightsData;
                  const chosen = data[wheelIndex] as number;
                  if (pickerVisible === 'birthYear') {
                    setProfile(prev => ({ ...prev, birthYear: chosen }));
                  } else {
                    setProfile(prev => ({ ...prev, heightCm: chosen }));
                  }
                  setPickerVisible(false);
                }}
              >
                <Text style={styles.sheetDoneText}>完成</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.wheelWrapper}>
              <View style={styles.wheelHighlight} />
              <FlatList
                data={pickerVisible === 'birthYear' ? yearsData : heightsData}
                keyExtractor={(item) => String(item)}
                getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                showsVerticalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                  const offsetY = e.nativeEvent.contentOffset.y;
                  const index = Math.round(offsetY / ITEM_HEIGHT);
                  setWheelIndex(index);
                }}
                renderItem={({ item }) => (
                  <View style={{ height: ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={styles.wheelItemText}>{pickerVisible === 'birthYear' ? `${item}年` : `${item} cm`}</Text>
                  </View>
                )}
                contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 3 }}
              />
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', paddingHorizontal: 16, paddingTop: 16 },
  card: { borderRadius: 16, backgroundColor: '#fff', elevation: 0 },
  title: { fontSize: 18, fontWeight: '700', color: '#111827', textAlign: 'center', paddingVertical: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 12,
  },
  label: { fontSize: 16, color: '#111827' },
  right: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', flex: 1 },
  rightButtons: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  avatarPlaceholder: { backgroundColor: '#e5e7eb' },
  arrow: { color: '#6b7280', marginLeft: 8 },
  input: { width: 200, backgroundColor: 'transparent', paddingLeft: 8, textAlign: 'right' },
  valueText: { color: '#6b7280' },
  segmentBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#f3f4f6', marginLeft: 8 },
  segmentBtnActive: { backgroundColor: '#111' },
  segmentText: { color: '#374151', fontSize: 14 },
  segmentTextActive: { color: '#ffffff', fontWeight: '600' },
  saveBtn: { marginTop: 18, backgroundColor: '#111', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  saveText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalMask: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'flex-end' },
  sheetContainer: { backgroundColor: '#f2f2f7', padding: 12 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sheetHeaderTitle: { color: '#111827', fontSize: 16, fontWeight: '600' },
  sheetCancel: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: '#111' },
  sheetCancelText: { color: '#ffffff', fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },
  sheetDone: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: '#111' },
  sheetDoneText: { color: '#ffffff', fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },
  wheelWrapper: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', position: 'relative' },
  wheelHighlight: { position: 'absolute', top: 44 * 3, left: 0, right: 0, height: 44, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#e5e5ea' },
  wheelItemText: { fontSize: 18, color: '#111827' },
});

// 选择器数据
const yearsData = Array.from({ length: 100 }, (_, i) => 2025 - i);
const heightsData = Array.from({ length: 81 }, (_, i) => 140 + i);
