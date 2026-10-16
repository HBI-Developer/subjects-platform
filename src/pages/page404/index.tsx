import { Center, Spinner } from "@chakra-ui/react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Page404() {
  const navigate = useNavigate();

  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only redirect timer
  useEffect(() => {
    setTimeout(() => {
      navigate("/");
    }, 1000);
  }, []);

  return (
    <Center p="10" backgroundColor={"bg"} boxSize={"100%"}>
      <Spinner size={"lg"} borderWidth="3px" colorPalette={"gray"} />
    </Center>
  );
}
