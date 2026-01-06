import { Center, Spinner } from "@chakra-ui/react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Page404() {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      navigate("/");
    }, 1000);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Center p="10" backgroundColor={"bg"} boxSize={"100%"}>
      <Spinner size={"lg"} borderWidth="3px" colorPalette={"gray"} />
    </Center>
  );
}
