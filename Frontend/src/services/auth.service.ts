// src/services/auth.service.ts
import { api } from "./api";
import type { LoginResponse } from "../types"; // nếu bạn có type

export async function login(username: string, password: string) {
  const res = await api.post<LoginResponse>("/auth/login", {
    username,
    password,
  });

  // ❗ BẮT BUỘC trả đúng shape cho AuthContext
  return {
    token: res.data.token,
    user: res.data.user,
  };
}
