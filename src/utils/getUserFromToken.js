import { jwtDecode } from "jwt-decode";

export function getUserFromToken(token) {
  try {
    if (!token) return null;

    const decoded = jwtDecode(token);

    return {
      token,
      ...decoded, // email, role, orgId
    };
  } catch (err) {
    console.error("Token decode error:", err);
    return null;
  }
}