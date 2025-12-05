import request from "../utils/request";

export async function login(username: string, password: string) {
  return request.post("/api/login", { username, password });
}

export async function logout(token: string) {
  return request.post("/api/logout", { token });
}
// 可扩展更多用户相关接口，如注册、获取用户信息等

export async function getProfile() {
  return request.get("/api/user/profile");
}

export async function updateProfile(data: {
  avatarUri?: string;
  nickname?: string;
  gender?: string;
  birthYear?: number;
  heightCm?: number;
}) {
  return request.post("/api/user/profile", data);
}
