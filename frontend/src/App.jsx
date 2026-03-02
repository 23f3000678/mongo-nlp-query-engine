import { useState } from "react";
import axios from "axios";

export default function App() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    console.log("Button clicked");
    if (!query) return;

    try {
      setLoading(true);
      console.log("Loading started");
      const res = await axios.post("http://localhost:5000/query", {
        query,
      });
      setResponse(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bgLight">

      {/* Navigation Bar */}
      <div className="w-full bg-white border-b border-borderLight px-10 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-primary">
          MongoAI
        </h1>
        <div className="text-sm text-gray-500">
          Hybrid NLP Query Engine
        </div>
      </div>

      {/* Main Content */}
      <div className="p-10 max-w-4xl mx-auto">

        {/* Query Card */}
        <div className="bg-cardLight border border-borderLight rounded-lg p-6 shadow-sm hover:shadow-md transition duration-300">
          <input
            type="text"
            placeholder="Ask your database in plain English..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border border-borderLight rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`mt-4 px-6 py-2 text-white rounded-md transition-all duration-300 ease-in-out ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary hover:bg-primaryHover hover:px-8 hover:rounded-full"
            }`}
          >
            {loading ? "Processing..." : "Ask Database"}
          </button>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="mt-6 flex justify-center">
            <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Response Section */}
        {response && (
          <div className="mt-8 space-y-6 animate-fadeIn">

            {/* Summary Card */}
            <div className="bg-cardLight border border-borderLight rounded-lg p-6 shadow-sm hover:shadow-md transition duration-300">
              <p className="text-primary font-medium text-lg">
                {response.summary}
              </p>
            </div>

            {/* Explanation Card */}
            {response.explanation && (
              <div className="bg-cardLight border border-borderLight rounded-lg p-6 shadow-sm hover:shadow-md transition duration-300">
                <h2 className="font-semibold mb-3 text-gray-700">
                  Explanation
                </h2>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {response.explanation.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Data Table */}
            {Array.isArray(response.data) && response.data.length > 0 && (
              <div className="bg-cardLight border border-borderLight rounded-lg shadow-sm hover:shadow-md transition duration-300 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-borderLight">
                    <tr>
                      {Object.keys(response.data[0]).map((key) => (
                        <th
                          key={key}
                          className="text-left px-4 py-3 font-medium text-gray-600"
                        >
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {response.data.map((row, index) => (
                      <tr
                        key={index}
                        className="border-b border-borderLight hover:bg-gray-50 transition"
                      >
                        {Object.values(row).map((value, i) => (
                          <td key={i} className="px-4 py-3">
                            {typeof value === "object"
                              ? JSON.stringify(value)
                              : value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center text-xs text-gray-400">
          Powered by MongoDB Atlas + spaCy NLP Engine
        </div>

      </div>
    </div>
  );
}