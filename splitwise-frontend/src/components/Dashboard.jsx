import React, { useState } from "react";
import AddExpenseModal from "./AddExpenseModal";
const Dashboard = ({ user, groups, token }) => {
  const [openGroupId, setOpenGroupId] = useState(null);
  const [showModalForGroup, setShowModalForGroup] = useState(null);

  const toggleGroup = (id) => {
    setOpenGroupId(openGroupId === id ? null : id);
  };

  const settledGroups = groups.filter((group) =>
    group.members.every((m) => Number(m.balance?.[0]?.amount ?? 0) === 0)
  );

  const unsettledGroups = groups.length - settledGroups.length;

  const totalOutstanding = groups.reduce((sum, group) => {
    return (
      sum +
      group.members.reduce((innerSum, m) => {
        const amount = parseFloat(m.balance?.[0]?.amount ?? 0);
        return innerSum + (amount > 0 ? amount : 0);
      }, 0)
    );
  }, 0);

  return (
    <div className="px-6 py-10 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-4 text-blue-700 text-center">
        Hello, {user.first_name} 👋
      </h1>

      {showModalForGroup && (
        <AddExpenseModal
          group={showModalForGroup}
          members={showModalForGroup.members}
          onClose={() => setShowModalForGroup(null)}
          token={token}
        />
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white mb-10 max-w-5xl mx-auto">
        <div className="bg-blue-500 rounded-xl p-4 shadow-md text-center">
          <div className="text-sm uppercase">Total Groups</div>
          <div className="text-2xl font-bold">{groups.length}</div>
        </div>
        <div className="bg-yellow-500 rounded-xl p-4 shadow-md text-center">
          <div className="text-sm uppercase">Unsettled Groups</div>
          <div className="text-2xl font-bold">{unsettledGroups}</div>
        </div>
        <div className="bg-red-500 rounded-xl p-4 shadow-md text-center">
          <div className="text-sm uppercase">Total Outstanding</div>
          <div className="text-2xl font-bold">
            ₹{totalOutstanding.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {groups.map((group) => {
          const isSettled = group.members.every(
            (m) => Number(m.balance?.[0]?.amount ?? 0) === 0
          );
          console.log(isSettled);

          return (
            <div
              key={group.id}
              className="bg-white p-6 rounded-xl shadow-md border hover:shadow-lg transition"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-blue-600">
                  {group.name}
                </h2>
                {!isSettled && (
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className="text-sm text-blue-500 hover:underline"
                  >
                    {openGroupId === group.id ? "Hide" : "Show"} Details
                  </button>
                )}
              </div>
              {!isSettled && (
                <button
                  onClick={() => setShowModalForGroup(group)}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Add Expense
                </button>
              )}
              {isSettled ? (
                <div className="mt-4 text-green-600 font-medium">
                  ✅ All Settled
                </div>
              ) : (
                openGroupId === group.id && (
                  <ul className="mt-4 text-gray-700 text-sm space-y-2">
                    {group.members.map((m) => (
                      <li key={m.id} className="flex justify-between">
                        <span>{m.first_name}</span>
                        <span className="text-gray-500">
                          {m.balance?.[0]?.amount ?? 0}{" "}
                          {m.balance?.[0]?.currency_code ?? ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
