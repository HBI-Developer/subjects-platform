import { Tooltip } from "@/components/ui/tooltip";
import { Button, Center, useDisclosure } from "@chakra-ui/react";
import { FaGoogle } from "react-icons/fa";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth, db } from "@/firebase-config";
import { doc, getDoc } from "firebase/firestore";
import { DASHBOARD_PAGE, TITLE } from "@/constants";
import { useNavigate } from "react-router-dom";
import { toaster, Toaster } from "@/components/ui/toaster";
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect } from "react";

export default function Login() {
  const {
      open: logging,
      onOpen: startLogging,
      onClose: endLogging,
    } = useDisclosure(),
    navigate = useNavigate(),
    [user, loading] = useAuthState(auth);

  const handleLogin = async () => {
    if (logging) return;
    startLogging();

    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user.email) {
        const adminRef = doc(db, "admins", user.email);
        const adminSnap = await getDoc(adminRef);

        if (adminSnap.exists()) {
          navigate(DASHBOARD_PAGE);
        } else {
          await signOut(auth);
          navigate("/");
        }
      }
    } catch (_) {
      toaster.create({
        title: `حدث خطأ أثناء محاولة تسجيل الدخول، أعد المحاولة`,
        type: "error",
      });
    } finally {
      endLogging();
    }
  };

  useEffect(() => {
    document.title = `${TITLE} | تسجيل الدخول`;
  }, []);

  useEffect(() => {
    if (!loading && user) {
      navigate(DASHBOARD_PAGE);
    }
  }, [user, loading, navigate]);

  return (
    <>
      <Center height={"100%"}>
        <Tooltip
          content="تسجيل الدخول عبر حساب Google"
          contentProps={{ direction: "rtl" }}
        >
          <Button
            variant={"outline"}
            borderWidth={3}
            size={"2xl"}
            borderRadius={"50%"}
            onClick={handleLogin}
            aspectRatio={1}
            padding={"2.5rem"}
            loading={logging || !!user || loading}
            color={{ base: "white", _hover: "#e54b4b" }}
          >
            <FaGoogle />
          </Button>
        </Tooltip>
      </Center>
      <Toaster />
    </>
  );
}
