import { useEffect } from "react";
import { useAppState } from "../../../hooks/useAppState";
import SubPage from "../../SubPage";

const HomePage = () => {
  const { setSelectedObject } = useAppState();

  useEffect(() => {
    setSelectedObject(0);
  }, [setSelectedObject]);

  return <SubPage title="Home" />;
};

export default HomePage;
