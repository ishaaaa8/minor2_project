import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("token");
    localStorage.removeItem("formFilled"); // Clear medical form status
    navigate("/login");
  };

  return (
    <nav className="w-full fixed top-0 left-0 bg-gradient-to-r from-blue-600 to-blue-800 text-white flex justify-between items-center px-10 py-4 shadow-md z-50">
      <h1 className="text-2xl font-bold tracking-wide">MedBot Dashboard</h1>
      <button 
        onClick={handleLogout} 
        className="bg-red-500 px-5 py-2 text-lg font-semibold rounded-lg hover:bg-red-600 transition-all duration-300 shadow-md"
      >
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
