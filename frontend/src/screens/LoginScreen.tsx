import React, { useState } from 'react';
import { login } from '../api/user';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

interface LoginScreenProps {
  onLoginSuccess: (token: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const res = await login(username, password);
      if (res.data.success) {
        setError('');
        onLoginSuccess(res.data.token);
      } else {
        setError(res.data.message || '用户名或密码错误');
      }
    } catch (err) {
      // 错误弹窗已由 request 封装处理
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <MaterialIcons name="lock" size={48} color="#fff" style={styles.icon} />
        <Text style={styles.title}>登录</Text>
        <TextInput
          style={styles.input}
          placeholder="用户名"
          placeholderTextColor="#888"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="密码"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>登录</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    backgroundColor: '#222',
    borderRadius: 16,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    alignItems: 'center',
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 24,
    letterSpacing: 2,
  },
  input: {
    width: '100%',
    height: 48,
    backgroundColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#444',
  },
  button: {
    width: '100%',
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#111',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  error: {
    color: '#ff5252',
    marginBottom: 8,
    fontSize: 14,
  },
});

export default LoginScreen;
