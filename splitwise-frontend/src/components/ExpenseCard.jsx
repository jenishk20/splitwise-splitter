import React from "react";

const ExpenseCard = ({
  expense,
  group,
  user,
  expanded,
  onToggleExpand,
  participationMap,
  onToggleParticipation,
  onSubmitPreferences,
}) => {
  return (
    <div className="border rounded mb-4 shadow">
      <div
        className="flex justify-between items-center p-4 bg-gray-100 cursor-pointer"
        onClick={() => onToggleExpand(expense._id)}
      >
        <span className="font-semibold">
          Expense #{expense._id.slice(-4)} by {expense.userId}
        </span>
        <span>{expanded ? "▲" : "▼"}</span>
      </div>

      {expanded && (
        <div className="p-4 bg-white">
          <table className="w-full text-sm border">
            <thead>
              <tr>
                <th className="p-2 border">Item</th>
                <th className="p-2 border">Qty</th>
                <th className="p-2 border">Price</th>
                {group.members.map((m) => (
                  <th key={m.id} className="p-2 border">
                    {m.first_name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expense.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="p-2 border">{item.item}</td>
                  <td className="p-2 border">{item.quantity}</td>
                  <td className="p-2 border">${item.price}</td>
                  {group.members.map((m) => (
                    <td key={m.id} className="p-2 border text-center">
                      <input
                        type="checkbox"
                        checked={
                          participationMap?.[expense._id]?.[idx]?.[m.id] ??
                          false
                        }
                        disabled={String(m.id) !== String(user.id)}
                        onChange={() =>
                          String(m.id) === String(user.id) &&
                          onToggleParticipation(expense._id, idx, m.id)
                        }
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 text-right">
            <button
              onClick={() => onSubmitPreferences(expense._id)}
              className="px-4 py-2 rounded bg-blue-600 text-white"
            >
              Submit Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseCard;
