import React from "react";

function GroupCard({ group }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition border border-gray-100">
      <h3 className="text-xl font-semibold text-indigo-700 mb-1">
        {group.name}
      </h3>
      <p className="text-gray-600 text-sm">Group ID: {group.id}</p>
      <p className="text-gray-600 text-sm">Members: {group.members.length}</p>
      <button
        className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-400 w-full"
        onclick={() => handleExpenseAdd()}
      >
        ➕ Add Expense
      </button>
    </div>
  );
}

export default GroupCard;
