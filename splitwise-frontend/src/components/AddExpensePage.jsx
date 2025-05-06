import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Papa from "papaparse";

const AddExpensePage = ({ user, groups }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const group = groups.find((g) => g.id === Number(id));
  const [uploadMode, setUploadMode] = useState("csv");
  const [items, setItems] = useState([]);
  const [participation, setParticipation] = useState({});
  const [loading, setLoading] = useState(false);

  const initParticipation = (data) => {
    const state = {};
    data.forEach((_, idx) => {
      state[idx] = {};
      group.members.forEach((m) => {
        state[idx][m.id] = m.id === user.id;
      });
    });
    setParticipation(state);
  };

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
    setLoading(true);
    const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;
    const res = await fetch(`${BASE_API_URL}/upload/parse-invoice`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    const parsedItems = await res.json();
    setItems(parsedItems);
    initParticipation(parsedItems);
    setLoading(false);
  };

  const toggleParticipation = (itemIdx, userId) => {
    if (userId !== user.id) return;
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
    navigate("/");
  };
  console.log(group);

  return (
    <div className="flex p-6 space-x-6">
      {/* Left: Members */}
      <div className="w-1/4 bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-3">{group.name}</h2>
        <ul className="text-gray-700 space-y-2">
          {group.members.map((m) => (
            <li key={m.id} className="border-b pb-1">
              {m.first_name} {m.id === user.id && "(You)"}
            </li>
          ))}
        </ul>
      </div>

      {/* Right: Upload + Table */}
      <div className="w-3/4 bg-white rounded-xl shadow p-4">
        <div className="mb-4">
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
            className={`ml-2 px-4 py-2 rounded ${
              uploadMode === "image" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Upload Invoice Image
          </button>
        </div>

        <input
          type="file"
          accept={uploadMode === "csv" ? ".csv" : "image/*"}
          onChange={uploadMode === "csv" ? handleCSVUpload : handleImageUpload}
          className="mb-4"
        />

        {loading && <p className="text-center">⏳ Parsing invoice...</p>}

        {items.length > 0 && (
          <table className="w-full border text-sm text-left">
            <thead>
              <tr className="bg-gray-100">
                {Object.keys(items[0]).map((key) => (
                  <th key={key} className="p-2 border">
                    {key}
                  </th>
                ))}
                {group.members.map((m) => (
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
                  {group.members.map((m) => (
                    <td key={m.id} className="p-2 border text-center">
                      <input
                        type="checkbox"
                        checked={participation?.[rowIdx]?.[m.id] ?? false}
                        disabled={m.id !== user.id}
                        onChange={() => toggleParticipation(rowIdx, m.id)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {items.length > 0 && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Submit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddExpensePage;
