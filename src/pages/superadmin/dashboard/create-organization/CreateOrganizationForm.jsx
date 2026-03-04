import { useEffect, useState } from "react";
import { createOrganizationAction } from "./actions";
import { updateOrganizationAction } from "./OrgActions";

export default function CreateOrganizationForm({ selectedOrg }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  /* -------------------- Fill form in edit mode -------------------- */
  useEffect(() => {
    if (!selectedOrg) return;

    document.querySelector("[name=orgName]").value =
      selectedOrg.orgName;
    document.querySelector("[name=orgShortform]").value =
      selectedOrg.orgShortform;
    document.querySelector("[name=adminEmail]").value =
      selectedOrg.adminEmail;
    document.querySelector("[name=adminName]").value =
      selectedOrg.adminName;
    document.querySelector("[name=adminMobile]").value =
      selectedOrg.adminMobile;
    document.querySelector("[name=preferredLang]").value =
      selectedOrg.preferredLang || "EN";
  }, [selectedOrg]);

  /* -------------------- Submit -------------------- */
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    let res;

    if (selectedOrg) {
      res = await updateOrganizationAction(
        selectedOrg.orgId,
        formData
      );
    } else {
      res = await createOrganizationAction(formData);
    }

    setLoading(false);
    setMsg(res.message);

    if (res.success) {
      form.reset();
    }
  }

  /* -------------------- UI -------------------- */

  return (
    <>
      <form onSubmit={handleSubmit} className="form">
        <h2>Create Organization</h2>

        <input
          name="orgName"
          placeholder="Organization Name"
          required
        />
        <input
          name="orgShortform"
          placeholder="Shortform (ex: Apollo)"
          required
        />
        <input name="orgLogo" placeholder="Logo URL" />

        <h3>Admin Details</h3>

        <input
          name="adminName"
          placeholder="Admin Name"
          required
        />
        <input
          name="adminEmail"
          type="email"
          placeholder="Admin Email"
          required
        />
        <input
          name="adminMobile"
          placeholder="Admin Mobile"
          required
        />

        <h3>Preferences</h3>

        <select name="preferredLang" defaultValue="EN" required>
          <option value="EN">EN (English)</option>
          <option value="HI">HI (Hindi)</option>
          <option value="MR">MR (Marathi)</option>
        </select>

        <select name="subscriptionPlan">
          <option value="FREE">FREE</option>
          <option value="PRO">PRO</option>
          <option value="ENTERPRISE">ENTERPRISE</option>
        </select>

        <button disabled={loading}>
          {loading
            ? "Processing..."
            : selectedOrg
            ? "Update Organization"
            : "Create Organization"}
        </button>

        {msg && <p className="msg">{msg}</p>}
      </form>

      <style>
        {`
        .form {
          max-width: 500px;
          margin: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 10px;
        }
        input,
        select {
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 6px;
        }
        button {
          padding: 12px;
          background: black;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        .msg {
          margin-top: 10px;
          font-weight: bold;
        }
      `}
      </style>
    </>
  );
}