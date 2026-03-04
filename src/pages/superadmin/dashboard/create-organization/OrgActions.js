import axiosInstance from "@/utils/axiosInstance";

/* -------------------- GET ORGANIZATIONS -------------------- */

export async function getOrganizations() {
  try {
    const res = await axiosInstance.get("/organizations");
    return res.data;
  } catch (err) {
    console.error(
      "GET ORG ERROR:",
      err?.response?.data || err?.message
    );
    return [];
  }
}

/* -------------------- DELETE ORGANIZATION -------------------- */

export async function deleteOrganizationAction(orgId) {
  try {
    await axiosInstance.delete(`/organizations/${orgId}`);

    return {
      success: true,
      message: "Organization deleted successfully",
    };
  } catch {
    return { success: false, message: "Delete failed" };
  }
}

/* -------------------- UPDATE ORGANIZATION -------------------- */

export async function updateOrganizationAction(
  orgId,
  formData
) {
  try {
    const lang = formData.get("preferredLang");

    const preferredLang =
      lang === "HI" || lang === "MR" ? lang : "EN";

    const payload = {
      orgName: formData.get("orgName"),
      orgShortform: formData.get("orgShortform"),
      orgLogo: formData.get("orgLogo"),
      adminName: formData.get("adminName"),
      adminEmail: formData.get("adminEmail"),
      adminMobile: formData.get("adminMobile"),
      subscriptionPlan: formData.get("subscriptionPlan"),
      preferredLang,
    };

    await axiosInstance.put(
      `/organizations/${orgId}`,
      payload
    );

    return {
      success: true,
      message: "Organization updated successfully",
    };
  } catch {
    return {
      success: false,
      message: "Something went wrong!",
    };
  }
}