import { useEffect } from "react";
import { useAppState } from "../../../hooks/useAppState";

const CombatPage = () => {
  const { setSelectedObject } = useAppState();

  useEffect(() => {
    setSelectedObject(1);
  }, [setSelectedObject]);

  return (
    <div>
      <h1>Combat Page</h1>
    </div>
  );
};

export default CombatPage;
