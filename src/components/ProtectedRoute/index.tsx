import { Navigate, Outlet } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase-config";
import { ADMIN_PAGE } from "@/constants";

const ProtectedRoute = () => {
  const [user, loading] = useAuthState(auth);

  if (loading) return <div>جاري التحقق من الصلاحيات...</div>;

  if (!user || ![""].includes(user.email!)) {
    return <Navigate to={ADMIN_PAGE} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
