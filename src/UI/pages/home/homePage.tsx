import { useEffect } from "react";
import { useAppState } from "../../../hooks/useAppState";

const HomePage = () => {
  const { setSelectedObject } = useAppState();

  useEffect(() => {
    setSelectedObject(0);
  }, [setSelectedObject]);

  return <div>&nbsp;</div>;
};

export default HomePage;
