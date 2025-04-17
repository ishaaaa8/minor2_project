import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import MedicalForm from "../components/MedicalForm";

const Dashboard = () => {
  const [formFilled, setFormFilled] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = localStorage.getItem("userEmail"); // Store user's email on login
    const storedUser = localStorage.getItem("lastUser");
  
    if (currentUser !== storedUser) {
      localStorage.setItem("lastUser", currentUser);
      localStorage.removeItem("formFilled"); // Reset form for new users
    }

    const isFormFilled = localStorage.getItem("formFilled") === "true";
    setFormFilled(isFormFilled);
  }, []);

  const handleFormOpen = () => {
    setShowForm(true);
  };

  const handleFormSubmit = () => {
    localStorage.setItem("formFilled", "true");
    setFormFilled(true);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen flex flex-col pt-16 bg-gray-100">
      <Navbar />
      <div className="flex flex-col items-center justify-center flex-grow space-y-6">
        {!formFilled ? (
          showForm ? (
            <MedicalForm onSubmit={handleFormSubmit} />
          ) : (
            <button
              onClick={handleFormOpen}
              className="bg-blue-600 text-white text-lg font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
            >
              Fill Medical Form
            </button>
          )
        ) : (
          <button
            onClick={() => navigate("/upload-prescription")}
            className="bg-green-600 text-white text-lg font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-green-700 transition duration-300"
          >
            Chat with Chatbot
          </button>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
