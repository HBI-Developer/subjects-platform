import { Outlet, useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/firebase-config";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

const ProtectedRoute = () => {
  const [user, loading] = useAuthState(auth),
    [isAdmin, setIsAdmin] = useState<boolean | null>(null),
    navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user?.email) {
        const adminRef = doc(db, "admins", user.email);
        const adminSnap = await getDoc(adminRef);
        setIsAdmin(adminSnap.exists());
      } else {
        setIsAdmin(false);
      }
    };

    if (!loading) {
      checkAdminStatus();
    }
  }, [user, loading]);

  useEffect(() => {
    if (typeof isAdmin === "boolean") {
      if (!user || !isAdmin) {
        navigate("/");
      }
    }
  }, [isAdmin, user, navigate]);

  if (loading) return <div />;

  return <Outlet />;
};

export default ProtectedRoute;
