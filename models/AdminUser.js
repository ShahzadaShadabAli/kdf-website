export const AdminUserShape = {
  _id: "string (Firestore document id)",
  email: "string", // unique
  passwordHash: "string", // bcrypt, cost 12
  role: "super_admin | editor",
  name: "string",
  isActive: "boolean",
  lastLoginAt: "Date | null",
  failedAttempts: "number",
  lockedUntil: "Date | null",
  createdAt: "Date",
};

export const adminUserIndexes = [{ key: { email: 1 }, options: { unique: true } }];
