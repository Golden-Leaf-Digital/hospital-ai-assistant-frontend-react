import axiosInstance from "@/utils/axiosInstance";

/* -------------------- Action -------------------- */

export async function createOrganizationAction(formData) {
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

    const res = await axiosInstance.post(
      "/organizations/create",
      payload
    );

    return {
      success: true,
      message: res.data,
    };
  } catch (err) {
    return {
      success: false,
      message: "Something went wrong",
    };
  }
}