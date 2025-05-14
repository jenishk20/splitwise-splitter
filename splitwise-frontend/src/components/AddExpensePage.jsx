import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Papa from "papaparse";
import ExpenseCard from "../components/ExpenseCard";
import Snackbar from "./Snackbar";

const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;

const AddExpensePage = ({ user, groups }) => {
  const { id } = useParams();
  const group = groups.find((g) => g.id === Number(id));

  const [description, setDescription] = useState("");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const [uploadMode, setUploadMode] = useState("csv");
  const [items, setItems] = useState([]);
  const [participation, setParticipation] = useState({});
  const [loading, setLoading] = useState(false);
  const [unsettledExpenses, setUnsettledExpenses] = useState([]);
  const [participationMap, setParticipationMap] = useState({});
  const [expandedMap, setExpandedMap] = useState({});

  const fetchExpenses = async () => {
    try {
      const res = await fetch(`${BASE_API_URL}/expenses/get-expenses/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setUnsettledExpenses(data);
        const pMap = {};
        data.forEach((exp) => {
          const localMap = {};
          exp.items.forEach((_, idx) => {
            localMap[idx] = exp.items[idx].participation;
          });
          pMap[exp._id] = localMap;
        });
        console.log("PMap is ", pMap);
        setParticipationMap(pMap);
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

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

  const handleSubmitNewExpense = async () => {
    const payload = {
      group: group,
      items: items,
    };

    try {
      await fetch(`${BASE_API_URL}/expenses/submit-expense`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      setItems([]);
      setParticipation({});
      fetchExpenses();
    } catch (error) {
      console.error("Error submitting new expense:", error);
    }
  };

  const toggleExpanded = (expenseId) => {
    setExpandedMap((prev) => ({
      ...prev,
      [expenseId]: !prev[expenseId],
    }));
  };

  const onToggleParticipation = (expenseId, itemIdx, userId) => {
    setParticipationMap((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated[expenseId][itemIdx][userId] =
        !updated[expenseId][itemIdx][userId];
      return updated;
    });
  };

  const handleSubmitForExpense = async (expenseId) => {
    const expense = unsettledExpenses.find((e) => e._id === expenseId);
    const updatedItems = expense.items.map((item, idx) => ({
      ...item,
      participation: participationMap[expenseId][idx],
    }));

    try {
      await fetch(`${BASE_API_URL}/expenses/update-preferences/${expenseId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ items: updatedItems }),
      });
      setSnackbarMessage("Expense submitted successfully!");
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
      fetchExpenses();
    } catch (err) {
      console.error("Failed to update preferences", err);
    }
  };

  const onFinalize = async (expenseId) => {
    try {
      const res = await fetch(
        `${BASE_API_URL}/expenses/finalize/${expenseId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (data.success) {
        setSnackbarMessage("Expense finalized on Splitwise 🎉");
        setShowSnackbar(true);
        setTimeout(() => setShowSnackbar(false), 3000);
        fetchExpenses();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setSnackbarMessage("Failed to finalize expense.");
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 3000);
      console.error(err);
    }
  };

  return (
    <div className="flex p-6 space-x-6">
      <div className="w-1/4 bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-3">{group?.name}</h2>
        <ul className="text-gray-700 space-y-2">
          {group?.members.map((m) => (
            <li key={m.id} className="border-b pb-1">
              {m.first_name} {m.id === user.id && "(You)"}
            </li>
          ))}
        </ul>
      </div>
      <Snackbar message={snackbarMessage} visible={showSnackbar} />

      <div className="w-3/4 bg-white rounded-xl shadow p-4">
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setUploadMode("csv")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold shadow 
      ${
        uploadMode === "csv"
          ? "bg-blue-600 text-white"
          : "bg-gray-100 hover:bg-gray-200"
      }`}
          >
            📄 Upload CSV
          </button>
          <button
            onClick={() => setUploadMode("image")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold shadow 
      ${
        uploadMode === "image"
          ? "bg-blue-600 text-white"
          : "bg-gray-100 hover:bg-gray-200"
      }`}
          >
            🧾 Upload Invoice Image
          </button>
        </div>

        <div className="mb-4">
          <label
            htmlFor="fileUpload"
            className="inline-block cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            {uploadMode === "csv"
              ? "📄 Choose CSV File"
              : "🧾 Choose Invoice Image"}
          </label>
          <input
            id="fileUpload"
            type="file"
            accept={uploadMode === "csv" ? ".csv" : "image/*"}
            onChange={
              uploadMode === "csv" ? handleCSVUpload : handleImageUpload
            }
            className="hidden"
          />
        </div>

        {loading && <p className="text-center">⏳ Parsing invoice...</p>}

        {items.length > 0 && (
          <>
            <table className="w-full border text-sm text-left mb-4">
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
                          onChange={() => {
                            if (m.id !== user.id) return;
                            setParticipation((prev) => ({
                              ...prev,
                              [rowIdx]: {
                                ...prev[rowIdx],
                                [m.id]: !prev[rowIdx][m.id],
                              },
                            }));
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description of the Expense
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Costco groceries, dinner bill..."
                className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="mt-4 text-right">
              <button
                onClick={handleSubmitNewExpense}
                className="px-4 py-2 rounded bg-green-600 text-white"
              >
                Submit Expense to Group
              </button>
            </div>
          </>
        )}

        {unsettledExpenses.length === 0 && (
          <div className="text-center mt-8">
            <h2 className="text-lg font-semibold mb-4">
              No unsettled expenses found.
            </h2>
            <p className="text-gray-500">All expenses are settled! 🎉</p>
          </div>
        )}

        {unsettledExpenses.length != 0 && (
          <>
            <h3 className="text-lg font-semibold mt-8 mb-4">
              Unsettled Expenses
            </h3>
            {unsettledExpenses.map((expense) => (
              <ExpenseCard
                key={expense._id}
                expense={expense}
                group={group}
                user={user}
                expanded={expandedMap[expense._id] || false}
                onToggleExpand={toggleExpanded}
                participationMap={participationMap}
                onToggleParticipation={onToggleParticipation}
                onSubmitPreferences={handleSubmitForExpense}
                onFinalize={onFinalize}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default AddExpensePage;
