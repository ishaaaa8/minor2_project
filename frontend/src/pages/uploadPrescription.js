import { useState } from "react";
import { useNavigate } from "react-router-dom";

const UploadPrescription = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      navigate("/chat"); // Skip upload if no file selected
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("prescription", file);
    formData.append("userEmail", localStorage.getItem("userEmail")); // Attach user email if needed
    console.log("User Email:", localStorage.getItem("userEmail"));

    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      const response = await fetch("http://localhost:5000/medical/upload-prescription", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Upload response:", data);
    } catch (error) {
      console.error("Error uploading file:", error);
    }

    setLoading(false);
    navigate("/chat"); // Proceed to chatbot
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">
          Upload Your Prescription (Optional)
        </h2>

        <label className="block w-full cursor-pointer bg-gray-200 text-gray-700 py-2 px-4 rounded-md mb-4 hover:bg-gray-300 transition">
          <input 
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          {file ? file.name : "Choose a PDF File"}
        </label>

        <div className="flex gap-4 justify-center mt-4">
          <button
            onClick={handleUpload}
            className={`px-6 py-3 rounded-lg text-white font-medium transition duration-300 ${loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload & Continue"}
          </button>

          <button
            onClick={() => navigate("/chat")}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition duration-300"
          >
            Continue Without Uploading
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadPrescription;
