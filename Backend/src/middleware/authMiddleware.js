import jwt from "jsonwebtoken";

function normalizeRole(role = "") {
  return role
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .trim();
}

// ✅ REQUIRE AUTH ĐÚNG: decode JWT và gắn req.user
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Chưa đăng nhập" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 👉 GẮN USER VÀO REQUEST (QUAN TRỌNG NHẤT)
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
}

export function allowRoles(roles = []) {
  const normalizedRoles = roles.map(normalizeRole);

  return (req, res, next) => {
    const role = req.user?.role;
    if (!role) return res.status(401).json({ message: "Chưa đăng nhập" });

    const normRole = normalizeRole(role);

    if (normalizedRoles.length && !normalizedRoles.includes(normRole)) {
      return res.status(403).json({
        message: `Không đủ quyền (${role})`,
      });
    }
    next();
  };
}
