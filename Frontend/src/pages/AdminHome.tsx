import { useAuth } from "../context/AuthContext";

export default function AdminHome() {
  const { user, logout } = useAuth();
  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Home</h2>
      <p>Xin chào: {user?.username}</p>
      <p>Role: {user?.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
