import { useEffect } from "react";
import { useAppState } from "../../../hooks/useAppState";

const QueensUni = () => {
  const { setSelectedObject } = useAppState();

  useEffect(() => {
    setSelectedObject(2);
  }, [setSelectedObject]);

  return (
    <div>
      <h1>Queens University Belfast</h1>
      <p>description</p>
    </div>
  );
};

export default QueensUni;
