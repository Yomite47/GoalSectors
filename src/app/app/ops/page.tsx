'use client';

import { useEffect, useState } from 'react';
import { AiRunWithEval } from '@/lib/data/types';

export default function OpsDashboard() {
  const [runs, setRuns] = useState<AiRunWithEval[]>([]);
  const [loading, setLoading] = useState(true);
  const [opikStatus, setOpikStatus] = useState<any>(null);
  const [selectedRun, setSelectedRun] = useState<AiRunWithEval | null>(null);

  useEffect(() => {
    const fetchRuns = async () => {
      const stored = localStorage.getItem('goalsectors_user');
      if (!stored) {
          setLoading(false);
          return;
      }
      const user = JSON.parse(stored);
      
      try {
        const res = await fetch(`/api/ops/runs?userId=${user.id}`);
        const data = await res.json();
        if (data.runs) {
            setRuns(data.runs);
            setOpikStatus(data.opikStatus);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRuns();
    // Refresh every 5s for "live" feel
    const interval = setInterval(fetchRuns, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalRuns = runs.length;
  const validSchemaCount = runs.filter(r => r.schema_valid).length;
  const successRate = totalRuns ? Math.round((validSchemaCount / totalRuns) * 100) : 0;
  const avgLatency = totalRuns ? Math.round(runs.reduce((acc, r) => acc + r.latency_ms, 0) / totalRuns) : 0;
  const avgScore = totalRuns ? Math.round(runs.reduce((acc, r) => acc + (r.eval?.score_total || 0), 0) / totalRuns) : 0;
  const sectorViolations = runs.filter(r => r.eval?.violated_sector).length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Ops Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow border border-gray-200">
            <div className="text-sm text-gray-500">Success Rate</div>
            <div className="text-2xl font-bold">{successRate}%</div>
        </div>
        <div className="bg-white p-4 rounded shadow border border-gray-200">
            <div className="text-sm text-gray-500">Avg Latency</div>
            <div className="text-2xl font-bold">{avgLatency}ms</div>
        </div>
        <div className="bg-white p-4 rounded shadow border border-gray-200">
            <div className="text-sm text-gray-500">Avg Score</div>
            <div className="text-2xl font-bold">{avgScore}</div>
        </div>
        <div className="bg-white p-4 rounded shadow border border-gray-200">
            <div className="text-sm text-gray-500">Sector Violations</div>
            <div className="text-2xl font-bold text-red-600">{sectorViolations}</div>
        </div>
      </div>

      {/* Opik Status */}
      <div className="bg-gray-50 p-4 rounded border border-gray-200 flex items-center justify-between">
         <div>
            <h3 className="font-semibold">Opik Status</h3>
            <p className="text-sm text-gray-600">Project: {opikStatus?.project || 'N/A'}</p>
         </div>
         <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-xs font-bold ${opikStatus?.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {opikStatus?.enabled ? 'ENABLED' : 'DISABLED'}
            </span>
         </div>
      </div>

      {/* Runs Table */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-600 uppercase">
                <tr>
                    <th className="p-3">Time</th>
                    <th className="p-3">Mode</th>
                    <th className="p-3">Schema</th>
                    <th className="p-3">Actions</th>
                    <th className="p-3">Latency</th>
                    <th className="p-3">Score</th>
                    <th className="p-3">Flags</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                {runs.map(run => (
                    <tr 
                        key={run.id} 
                        onClick={() => setSelectedRun(run)}
                        className="hover:bg-gray-50 cursor-pointer"
                    >
                        <td className="p-3">{new Date(run.created_at).toLocaleTimeString()}</td>
                        <td className="p-3">{run.route.replace('/api/', '')}</td>
                        <td className="p-3">{run.schema_valid ? '✅' : '❌'}</td>
                        <td className="p-3">{(run.response.match(/"action":/g) || []).length}</td> 
                        <td className="p-3">{run.latency_ms}ms</td>
                        <td className="p-3 font-bold">
                            {run.eval?.score_total ?? '-'}
                        </td>
                        <td className="p-3 flex gap-1">
                            {run.eval?.violated_sector && <span className="text-xs bg-red-100 text-red-800 px-1 rounded">Sector</span>}
                            {run.eval?.empty_actions && <span className="text-xs bg-yellow-100 text-yellow-800 px-1 rounded">Empty</span>}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedRun && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedRun(null)}>
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Run Details</h2>
                    <button onClick={() => setSelectedRun(null)} className="text-gray-500 hover:text-black">✕</button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-gray-700">User Prompt</h3>
                        <div className="bg-gray-50 p-3 rounded text-sm whitespace-pre-wrap">{selectedRun.prompt}</div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-700">Assistant Response</h3>
                        <div className="bg-gray-50 p-3 rounded text-sm font-mono whitespace-pre-wrap max-h-60 overflow-y-auto">
                            {selectedRun.response}
                        </div>
                    </div>
                    
                    {selectedRun.eval && (
                        <div className="border-t pt-4">
                            <h3 className="font-semibold text-gray-700 mb-2">Evaluation</h3>
                            <div className="grid grid-cols-2 gap-4 mb-2">
                                <div className="p-2 bg-blue-50 rounded">
                                    <div className="text-xs text-blue-800">Total Score</div>
                                    <div className="text-xl font-bold text-blue-900">{selectedRun.eval.score_total}</div>
                                </div>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between"><span>Schema:</span> <span>{selectedRun.eval.schema_score}/25</span></div>
                                    <div className="flex justify-between"><span>Sector:</span> <span>{selectedRun.eval.sector_score}/25</span></div>
                                    <div className="flex justify-between"><span>Useful:</span> <span>{selectedRun.eval.usefulness_score}/25</span></div>
                                    <div className="flex justify-between"><span>Efficiency:</span> <span>{selectedRun.eval.efficiency_score}/25</span></div>
                                </div>
                            </div>
                            
                            {selectedRun.eval.reasons && (
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-600">Reasons</h4>
                                    <ul className="list-disc list-inside text-sm text-gray-700">
                                        {(Array.isArray(selectedRun.eval.reasons) ? selectedRun.eval.reasons : JSON.parse(selectedRun.eval.reasons as any)).map((r: string, i: number) => (
                                            <li key={i}>{r}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
