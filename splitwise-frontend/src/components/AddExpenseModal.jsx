import React, { useState } from "react";
import Papa from "papaparse";

const AddExpenseModal = ({ group, members, onClose, token }) => {
  const [uploadMode, setUploadMode] = useState("csv"); // "csv" or "image"
  const [items, setItems] = useState([]);
  const [participation, setParticipation] = useState({});
  console.log("Upload Mode is ", uploadMode);
  const initParticipation = (data) => {
    const defaultState = {};
    data.forEach((_, idx) => {
      defaultState[idx] = {};
      members.forEach((m) => {
        defaultState[idx][m.id] = true;
      });
    });
    setParticipation(defaultState);
  };

  console.log(import.meta.env.VITE_API_BASE_URL);
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setItems(results.data);
        initParticipation(results.data);
      },
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("invoice", file);
    const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;
    const res = await fetch(
      `${BASE_API_URL}/upload/parse-invoice?access_token=${token}`,
      {
        method: "POST",
        body: formData,
      }
    );

    const parsedItems = await res.json();
    setItems(parsedItems);
    console.log(parsedItems);
    initParticipation(parsedItems);
  };

  const toggleParticipation = (itemIdx, userId) => {
    setParticipation((prev) => ({
      ...prev,
      [itemIdx]: {
        ...prev[itemIdx],
        [userId]: !prev[itemIdx][userId],
      },
    }));
  };

  const handleSubmit = () => {
    console.log("Items:", items);
    console.log("Participation:", participation);

    onClose(); // close modal
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-4xl h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-4">
          Add Expense - {group.name}
        </h2>

        {/* Toggle */}
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setUploadMode("csv")}
            className={`px-4 py-2 rounded ${
              uploadMode === "csv" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Upload CSV
          </button>
          <button
            onClick={() => setUploadMode("image")}
            className={`px-4 py-2 rounded ${
              uploadMode === "image" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Upload Invoice Image
          </button>
        </div>

        {/* File Input */}
        <input
          type="file"
          accept={uploadMode === "csv" ? ".csv" : "image/*"}
          onChange={uploadMode === "csv" ? handleCSVUpload : handleImageUpload}
          className="mb-6"
        />

        {/* Preview Table */}
        {items.length > 0 && (
          <table className="w-full border text-sm text-left">
            <thead>
              <tr className="bg-gray-100">
                {Object.keys(items[0]).map((key) => (
                  <th key={key} className="p-2 border">
                    {key}
                  </th>
                ))}
                {members.map((m) => (
                  <th key={m.id} className="p-2 border text-center">
                    {m.first_name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  {Object.values(row).map((val, colIdx) => (
                    <td key={colIdx} className="p-2 border">
                      {val}
                    </td>
                  ))}
                  {members.map((m) => (
                    <td key={m.id} className="p-2 border text-center">
                      <input
                        type="checkbox"
                        checked={participation?.[rowIdx]?.[m.id] ?? false}
                        onChange={() => toggleParticipation(rowIdx, m.id)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddExpenseModal;
