import City from "./City";
import River from "./River";
import Roads from "./Roads";

const CityModel = () => {
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
