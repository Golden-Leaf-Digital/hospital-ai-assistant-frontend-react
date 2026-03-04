import axiosInstance from "@/utils/axiosInstance";

/* -------------------- Helpers -------------------- */
/**
 * Convert FormData value -> string | undefined
 */
function getString(formData, key) {
  const value = formData.get(key);
  return value ? String(value) : undefined;
}

/* -------------------- CREATE USER -------------------- */

export async function createOrgUserAction(formData) {
  try {
    const role = getString(formData, "role");

    const payload = {
      name: getString(formData, "name"),
      email: getString(formData, "email"),
      mobile: getString(formData, "mobile"),
      userRoleName: role,
      departmentId:
        role === "DOCTOR"
          ? Number(formData.get("departmentId"))
          : undefined,
    };

    const res = await axiosInstance.post("/org-user", payload);

    return {
      ok: true,
      message: "User created successfully 🎉",
      user: res.data,
    };
  } catch (err) {
    return {
      ok: false,
      message: err.response?.data || "Failed to create user",
    };
  }
}

/* -------------------- GET USERS -------------------- */

export async function getOrgUsers() {
  try {
    const res = await axiosInstance.get("/org-user/all");
    return res.data;
  } catch (err) {
    console.log(err.response?.data);
    return [];
  }
}

/* -------------------- UPDATE USER -------------------- */

export async function updateOrgUserAction(orgUserId, payload) {
  try {
    await axiosInstance.put(`/org-user/${orgUserId}`, payload);

    return {
      ok: true,
      message: "User updated successfully",
    };
  } catch (err) {
    return {
      ok: false,
      message: err.response?.data || "Failed to update user",
    };
  }
}

/* -------------------- DELETE USER -------------------- */

export async function deleteOrgUserAction(orgUserId) {
  try {
    await axiosInstance.delete(`/org-user/${orgUserId}`);

    return {
      ok: true,
      message: "User deleted successfully",
    };
  } catch (err) {
    return {
      ok: false,
      message: err.response?.data || "Failed to delete user",
    };
  }
}