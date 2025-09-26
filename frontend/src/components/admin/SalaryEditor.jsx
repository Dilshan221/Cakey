// src/pages/admin/SalaryEditor.jsx
import React from "react";
import { useParams } from "react-router-dom";

export default function SalaryEditor() {
  // If you’re passing employee id/name in the URL later,
  // e.g., /admin/salaries/new/:employeeName
  const { employeeName } = useParams();

  return (
    <div className="p-6">
      {/* Breadcrumb / Section */}
      <h2 className="text-sm text-gray-500 uppercase tracking-wide">
        Financial Dashboard
      </h2>

      {/* Step */}
      <div className="mt-2 text-gray-600 text-sm">Step 3</div>

      {/* Greeting */}
      <div className="mt-4 flex items-center gap-2">
        <span className="font-semibold">Welcome, Admin</span>
        <span className="px-2 py-0.5 text-xs bg-gray-200 rounded-full">
          Admin
        </span>
      </div>

      {/* Page Title */}
      <h1 className="mt-6 text-2xl font-bold">Salary Editor</h1>

      {/* Context */}
      <p className="mt-2 text-gray-700">
        Editing salary for:{" "}
        <span className="font-semibold">{employeeName || "Nimali Perera"}</span>
      </p>

      {/* Form placeholder */}
      <div className="mt-6 border rounded-lg p-4 bg-white shadow-sm">
        <form>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Salary Amount
            </label>
            <input
              type="number"
              placeholder="Enter salary"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Effective Date
            </label>
            <input
              type="date"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save Salary
          </button>
        </form>
      </div>
    </div>
  );
}
