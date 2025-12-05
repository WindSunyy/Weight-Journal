import axios from "axios";
import { Alert } from "react-native";

let requestToken = "";
export function setRequestToken(token: string) {
  requestToken = token;
}

const instance = axios.create({
  baseURL: "http://172.16.1.40:3001", // 已更新为当前本地IP
  timeout: 10000,
});

instance.interceptors.request.use((config) => {
  if (requestToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${requestToken}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.data && error.response.data.message) {
      Alert.alert("错误", error.response.data.message);
    } else {
      Alert.alert("网络错误", "无法连接到服务器");
    }
    return Promise.reject(error);
  }
);

export default instance;
