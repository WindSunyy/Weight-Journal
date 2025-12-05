import request from "../utils/request";

export async function login(username: string, password: string) {
  return request.post("/api/login", { username, password });
}

export async function logout(token: string) {
  return request.post("/api/logout", { token });
}
// 可扩展更多用户相关接口，如注册、获取用户信息等
