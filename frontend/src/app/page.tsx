'use client';

import { useState } from 'react';

export default function Home() {
  const [inputVal, setInputVal] = useState(`[
  "A->B", "A->B", "A->B",
  "A->B", "B->C", "C->A",
  "A->D", "B->D", "C->D",
  "Z->X", "X->Y", "Y->Z",
  "A->B", "C->D", "E->F",
  "A->B", "A->C", "C->D", "D->E",
  " A->B ", "A->a", "AA->B", "A->", ""
]`);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);

  const handleSubmit = async () => {
    setError(null);
    setResults(null);
    
    let parsedData;
    try {
      parsedData = JSON.parse(inputVal);
    } catch (e) {
      setError("Invalid JSON format in the input.");
      return;
    }

    setLoading(true);

    try {
      // It uses localhost:3001 locally, or whatever environment variable you set when deployed
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      const res = await fetch(`${apiUrl}/bfhl`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: parsedData })
      });

      const json = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError("API Error: " + (json.error || res.statusText));
        return;
      }

      setResults(json);
    } catch (err) {
      setLoading(false);
      setError("Network Error: Could not connect to backend. Is the server running on port 3001?");
    }
  };

  return (
    <main className="min-h-[100vh] bg-gray-100 p-6 font-sans text-gray-900">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-blue-600">Challenge Dashboard (Next.js)</h1>
        
        <div className="mb-6">
          <label className="block font-semibold mb-2">Input Edges (JSON array of strings):</label>
          <textarea 
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            rows={10} 
            className="w-full border rounded p-2 text-gray-800 font-mono text-sm" 
            placeholder='["A->B", "A->C", "B->D"]'
          />
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Execute /bfhl'}
          </button>
        </div>

        {error && (
          <div className="text-red-600 bg-red-50 border border-red-200 p-3 rounded font-semibold mb-4 text-sm mt-3">
            {error}
          </div>
        )}

        {results && (
          <div className="space-y-6 mt-6">
            <div className="grid grid-cols-2 gap-4 bg-blue-50 p-4 rounded text-sm">
              <div><span className="font-bold">User API:</span> <span className="text-gray-700">{results.user_id}</span></div>
              <div><span className="font-bold">Email:</span> <span className="text-gray-700">{results.email_id}</span></div>
              <div><span className="font-bold">Roll Number:</span> <span className="text-gray-700">{results.college_roll_number}</span></div>
              <div><span className="font-bold">Success:</span> <span className="text-green-600 font-bold">{String(results.is_success)}</span></div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-red-600 border-b pb-1 mb-2">Invalid Entries</h3>
                <pre className="bg-gray-100 p-2 text-sm rounded max-h-32 overflow-auto">
                  {JSON.stringify(results.invalid_entries, null, 2)}
                </pre>
              </div>
              <div>
                <h3 className="font-bold text-orange-600 border-b pb-1 mb-2">Duplicate Edges</h3>
                <pre className="bg-gray-100 p-2 text-sm rounded max-h-32 overflow-auto">
                  {JSON.stringify(results.duplicate_edges, null, 2)}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 border-b pb-1 mb-2 text-lg">Summary</h3>
              <div className="bg-gray-50 p-4 rounded grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xs uppercase justify-center text-gray-500 font-bold">Total Trees</div>
                  <div className="text-xl text-blue-600 font-bold">{results.summary?.total_trees}</div>
                </div>
                <div>
                  <div className="text-xs uppercase justify-center text-gray-500 font-bold">Total Cycles</div>
                  <div className="text-xl text-red-600 font-bold">{results.summary?.total_cycles}</div>
                </div>
                <div>
                  <div className="text-xs uppercase justify-center text-gray-500 font-bold">Largest Tree Root</div>
                  <div className="text-xl text-green-600 font-bold">{results.summary?.largest_tree_root || 'None'}</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 border-b pb-1 mb-2 text-lg">Hierarchies (Trees / Cycles)</h3>
              <div className="space-y-4">
                {results.hierarchies?.map((h: any, i: number) => (
                  <div key={i} className={`border rounded p-4 ${h.has_cycle ? "bg-red-50 border-red-200" : "bg-white"}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-lg">Root: {h.root}</span>
                      <div className="text-sm space-x-2">
                        {h.has_cycle ? (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded">Cycle Detected</span>
                        ) : (
                          <>
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Tree</span>
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Depth: {h.depth}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <pre className="bg-gray-100 p-2 text-xs rounded overflow-auto mt-2 text-gray-800 flex">
                      {JSON.stringify(h.tree, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}