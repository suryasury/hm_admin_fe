import { Loader } from "lucide-react";

const Spinner = ({ type = "default" }) => {
  return (
    <Loader
      className={`animate-spin w-6 h-6 mr-2 ${
        type === "light" ? "text-white" : "text-gray-500"
      }`}
    />
  );
};

export default Spinner;
