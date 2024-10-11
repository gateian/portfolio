import { useEffect } from "react";
import { useAppState } from "../../../hooks/useAppState";
import SubPage from "../../SubPage";

const QueensUni = () => {
  const { setSelectedObject } = useAppState();

  useEffect(() => {
    setSelectedObject(2);
  }, [setSelectedObject]);

  return (
    <SubPage title="Queens University Belfast" objectIndex={2}>
      <p>description</p>
    </SubPage>
  );
};

export default QueensUni;
