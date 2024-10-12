import { useLocation } from "react-router-dom";
import City from "./City";
import River from "./River";
import Roads from "./Roads";

const CityModel = () => {
  const location = useLocation();

  if (location.pathname !== "/") {
    return null;
  }

  return (
    <>
      <City />
      <Roads />
      <River />
    </>
  );
};

export default CityModel;
