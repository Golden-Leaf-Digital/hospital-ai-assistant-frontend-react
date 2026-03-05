import { Navigate, useParams } from "react-router-dom";

export default function OrgRedirect() {
  const { orgId } = useParams();
  return <Navigate to={`/${orgId}/webchat`} replace />;
}