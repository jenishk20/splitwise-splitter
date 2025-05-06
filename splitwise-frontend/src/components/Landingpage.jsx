import React from "react";

const LandingPage = ({ accessToken }) => {
  const user = {};
  const groups = [];
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <h1 className="text-4xl font-bold mb-6 text-center text-blue-700">
        Welcome, {user?.first_name} 👋
      </h1>
      <p className="text-center text-gray-600 mb-10 text-lg">
        Here's a list of your Splitwise groups:
      </p>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.length === 0 ? (
          <p className="col-span-2 text-center text-gray-500">
            No groups found.
          </p>
        ) : (
          groups.map((group) => (
            <div
              key={group.id}
              className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold text-blue-600">
                {group.name}
              </h2>
              <ul className="mt-4 text-gray-700 text-sm space-y-1">
                {group.members.map((member) => (
                  <li key={member.id} className="flex justify-between">
                    <span>{member.first_name}</span>
                    <span className="text-gray-500">
                      Balance: {member.balance[0]?.amount ?? 0}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LandingPage;
