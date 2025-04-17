import { useState } from "react";

const MedicalForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    medical_conditions: "",
    allergies: "",
    medications: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const email = localStorage.getItem("userEmail"); // Fetch user email

      const response = await fetch("http://localhost:5000/medical/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, email }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Medical details saved successfully!");
        onSubmit(); // Update formFilled state in Dashboard
      } else {
        alert(data.error || "Failed to save medical details.");
      }
    } catch (error) {
      console.error("Error saving medical details:", error);
      alert("Error saving medical details. Try again later.");
    }
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md mt-4">
      <h2 className="text-2xl font-bold mb-4">Medical Information</h2>
      <form onSubmit={handleSubmit}>
        <label className="block">
          Age:
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            required
          />
        </label>

        <label className="block mt-3">
          Gender:
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            required
          >
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </label>

        <label className="block mt-3">
          Medical Conditions:
          <input
            type="text"
            name="medical_conditions"
            value={formData.medical_conditions}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </label>

        <label className="block mt-3">
          Allergies:
          <input
            type="text"
            name="allergies"
            value={formData.allergies}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </label>

        <label className="block mt-3">
          Medications:
          <input
            type="text"
            name="medications"
            value={formData.medications}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </label>

        <button
          type="submit"
          className="mt-4 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default MedicalForm;
