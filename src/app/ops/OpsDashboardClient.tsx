'use client';

import React, { useEffect, useState } from 'react';
import { getStore } from '@/lib/data';
import { AiRunWithEval, AiOutcomeStats } from '@/lib/data/types';
import { ThumbsUp, ThumbsDown, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface OpsDashboardClientProps {
  opikStatus: {
    enabled: boolean;
    project: string;
  };
}

export default function OpsDashboardClient({ opikStatus }: OpsDashboardClientProps) {
  const [runs, setRuns] = useState<AiRunWithEval[]>([]);
  const [outcomeStats, setOutcomeStats] = useState<AiOutcomeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRun, setSelectedRun] = useState<AiRunWithEval | null>(null);
  const [lastTrace, setLastTrace] = useState<string | null>(null);
  const [filterVersion, setFilterVersion] = useState<string>('ALL');

  useEffect(() => {
    loadRuns();
    const stored = localStorage.getItem('opik_last_trace');
    if (stored) setLastTrace(stored);
  }, []);

  const loadRuns = async () => {
    try {
      const store = getStore();
      // Try to get userId from local storage for LocalStore scenario
      let userId = 'unknown';
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('goalsectors_user');
        if (stored) {
          const user = JSON.parse(stored);
          userId = user.id;
        }
      }

      // If we are using Supabase, we might need a real user ID. 
      // For the dashboard, we ideally want ALL runs, but our store interface requires a userId.
      // In a real app, we'd have an admin function to list all. 
      // For this MVP, we'll list for the current detected user.
      const [data, stats] = await Promise.all([
        store.listAiRunsWithEvals(userId, 50),
        store.getAiOutcomeStats(userId, 1) // 1 day = 24h
      ]);
      setRuns(data);
      setOutcomeStats(stats);
    } catch (error) {
      console.error('Failed to load runs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter runs based on version selection
  const displayRuns = filterVersion === 'ALL' 
    ? runs 
    : runs.filter(r => (r.prompt_version || 'A') === filterVersion);

  // Metrics
  const totalRuns = displayRuns.length;
  const validSchemaCount = displayRuns.filter(r => r.schema_valid).length;
  const successRate = totalRuns > 0 ? Math.round((validSchemaCount / totalRuns) * 100) : 0;
  
  const totalLatency = displayRuns.reduce((acc, r) => acc + r.latency_ms, 0);
  const avgLatency = totalRuns > 0 ? Math.round(totalLatency / totalRuns) : 0;

  const totalScore = displayRuns.reduce((acc, r) => acc + (r.eval?.score_total || 0), 0);
  const avgScore = totalRuns > 0 ? Math.round(totalScore / totalRuns) : 0;

  const violationCount = displayRuns.filter(r => r.eval?.violated_sector).length;

  // New Metrics
  const feedbackRuns = displayRuns.filter(r => r.feedback);
  const helpfulCount = feedbackRuns.filter(r => r.feedback?.helpful).length;
  const helpfulRate = feedbackRuns.length > 0 ? Math.round((helpfulCount / feedbackRuns.length) * 100) : 0;

  const totalActions = displayRuns.reduce((acc, r) => {
    try {
        const json = JSON.parse(r.response);
        return acc + (json.actions?.length || 0);
    } catch { return acc; }
  }, 0);
  const avgActions = totalRuns > 0 ? (totalActions / totalRuns).toFixed(1) : '0.0';

  // Prompt Version Experiment Logic
  const [promptVersion, setPromptVersion] = useState<string>('A');

  useEffect(() => {
    const stored = localStorage.getItem('prompt_version');
    if (stored) setPromptVersion(stored);
  }, []);

  const toggleVersion = (ver: string) => {
    setPromptVersion(ver);
    localStorage.setItem('prompt_version', ver);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Time', 'Version', 'Schema Valid', 'Actions', 'Helpful', 'Score', 'Latency'];
    const rows = displayRuns.map(run => {
        let actions = 0;
        try { actions = JSON.parse(run.response).actions?.length || 0; } catch {}
        return [
            run.id,
            new Date(run.created_at).toISOString(),
            run.prompt_version || 'A',
            run.schema_valid ? 'Yes' : 'No',
            actions,
            run.feedback ? (run.feedback.helpful ? 'Yes' : 'No') : '',
            run.eval?.score_total || '',
            run.latency_ms
        ].join(',');
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "goal_sectors_runs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
            <div className="flex items-center gap-3 mb-1">
                <Link href="/" className="text-gray-400 hover:text-gray-900 transition-colors p-1 -ml-1">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-2xl font-bold">Coach Ops Dashboard</h1>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500 font-mono pl-8">
                <span className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${successRate > 90 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    System Health
                </span>
                <span>Schema: {successRate}%</span>
                <span>Helpful: {helpfulRate}%</span>
                <span>Completion: {outcomeStats?.completionRate}%</span>
            </div>
        </div>
        
        <div className="flex gap-3">
            <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 font-medium text-sm rounded hover:bg-gray-50 flex items-center gap-2"
            >
                Download CSV
            </button>
            {/* Version Filter */}
            <div className="flex items-center gap-2 bg-white p-1 rounded border border-gray-300">
                <span className="text-xs font-bold text-gray-500 px-2">VIEW:</span>
                <button 
                    onClick={() => setFilterVersion('ALL')}
                    className={`px-3 py-1 text-sm rounded ${filterVersion === 'ALL' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    All
                </button>
                <button 
                    onClick={() => setFilterVersion('A')}
                    className={`px-3 py-1 text-sm rounded ${filterVersion === 'A' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    A
                </button>
                <button 
                    onClick={() => setFilterVersion('B')}
                    className={`px-3 py-1 text-sm rounded ${filterVersion === 'B' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    B
                </button>
            </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Success Rate (Schema)</div>
          <div className="text-3xl font-bold text-gray-900">{successRate}%</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Avg Latency</div>
          <div className="text-3xl font-bold text-gray-900">{avgLatency}<span className="text-lg text-gray-400 font-normal ml-1">ms</span></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Avg Score</div>
          <div className="text-3xl font-bold text-gray-900">{avgScore}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Sector Violations</div>
          <div className="text-3xl font-bold text-red-500">{violationCount}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Helpful Rate</div>
            <div className="text-3xl font-bold text-gray-900 flex items-baseline gap-2">
                {helpfulRate}%
                <span className="text-xs font-medium text-gray-400">({feedbackRuns.length} votes)</span>
            </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Outcome (24h)</div>
            <div className="text-3xl font-bold text-gray-900 flex items-baseline gap-2">
                {outcomeStats?.completionRate}%
                <span className="text-xs font-medium text-gray-400">({outcomeStats?.completedWithin24h}/{outcomeStats?.aiCreated})</span>
            </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Avg Actions/Run</div>
            <div className="text-3xl font-bold text-gray-900">{avgActions}</div>
        </div>
      </div>

      {/* Opik Status & Experiments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200/60 flex items-center justify-between">
            <div>
              <span className="font-bold text-gray-700 mr-2">Opik Status</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${opikStatus.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {opikStatus.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            {opikStatus.enabled && (
              <div className="text-sm text-gray-500 text-right">
                <div className="font-medium">Project: <span className="font-mono text-gray-700">{opikStatus.project}</span></div>
                {lastTrace && (
                    <div className="text-xs text-gray-400 mt-1">Last trace: {new Date(lastTrace).toLocaleTimeString()}</div>
                )}
              </div>
            )}
          </div>

          <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 flex items-center justify-between">
              <div>
                  <h3 className="font-bold text-blue-900 mb-1">Prompt Experiment</h3>
                  <p className="text-xs font-medium text-blue-600/80 uppercase tracking-wide">
                      A: Default &nbsp;•&nbsp; B: Concise
                  </p>
              </div>
              <div className="flex bg-white rounded-xl border border-blue-100 p-1 shadow-sm">
                  <button 
                      onClick={() => toggleVersion('A')}
                      className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${promptVersion === 'A' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                      Ver A
                  </button>
                  <button 
                      onClick={() => toggleVersion('B')}
                      className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${promptVersion === 'B' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                      Ver B
                  </button>
              </div>
          </div>
      </div>

      {/* Runs Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Time</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Version</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Schema</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Feedback</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Score</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Flags</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">Loading runs...</td>
              </tr>
            ) : displayRuns.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">No runs found for this view.</td>
              </tr>
            ) : (
              displayRuns.map((run) => (
                <tr 
                  key={run.id} 
                  onClick={() => setSelectedRun(run)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(run.created_at).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs font-mono">
                        {run.prompt_version || 'A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {run.schema_valid ? (
                      <span className="text-green-600">Valid</span>
                    ) : (
                      <span className="text-red-600">Invalid</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(() => {
                        try {
                            const json = JSON.parse(run.response);
                            const count = json.actions?.length || 0;
                            return <span className={count > 0 ? "font-bold text-gray-900" : ""}>{count}</span>;
                        } catch { return "0"; }
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {run.feedback ? (
                        run.feedback.helpful ? (
                            <span className="flex items-center gap-1 text-green-600 font-medium">
                                <ThumbsUp size={14} /> Helpful
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-red-600 font-medium">
                                <ThumbsDown size={14} /> Unhelpful
                            </span>
                        )
                    ) : (
                        <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {run.eval?.score_total || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex gap-2">
                        {run.eval?.violated_sector && (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded">Sector</span>
                        )}
                        {run.eval?.empty_actions && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded">No Action</span>
                        )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedRun && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedRun(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">Run Details</h2>
                <button onClick={() => setSelectedRun(null)} className="text-gray-400 hover:text-gray-600">
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">User Message</h3>
                  <div className="mt-1 p-3 bg-gray-50 rounded text-sm whitespace-pre-wrap">{selectedRun.prompt}</div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Assistant Response</h3>
                  <div className="mt-1 p-3 bg-gray-50 rounded text-sm font-mono whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {selectedRun.response}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Scores</h3>
                    <dl className="mt-1 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <dt className="text-gray-600">Total:</dt>
                      <dd className="font-bold">{selectedRun.eval?.score_total ?? '-'}</dd>
                      <dt className="text-gray-600">Schema:</dt>
                      <dd>{selectedRun.eval?.schema_score ?? '-'}</dd>
                      <dt className="text-gray-600">Sector:</dt>
                      <dd>{selectedRun.eval?.sector_score ?? '-'}</dd>
                      <dt className="text-gray-600">Usefulness:</dt>
                      <dd>{selectedRun.eval?.usefulness_score ?? '-'}</dd>
                      <dt className="text-gray-600">Efficiency:</dt>
                      <dd>{selectedRun.eval?.efficiency_score ?? '-'}</dd>
                    </dl>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Metadata</h3>
                    <dl className="mt-1 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <dt className="text-gray-600">Run ID:</dt>
                      <dd className="font-mono text-xs truncate" title={selectedRun.id}>{selectedRun.id}</dd>
                      <dt className="text-gray-600">Latency:</dt>
                      <dd>{selectedRun.latency_ms}ms</dd>
                      <dt className="text-gray-600">Prompt Ver:</dt>
                      <dd className="font-mono">{selectedRun.prompt_version || 'A'}</dd>
                    </dl>
                  </div>
                </div>

                {selectedRun.feedback && (
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">User Feedback</h3>
                        <div className={`mt-1 p-3 rounded text-sm border ${selectedRun.feedback.helpful ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                            <div className="flex items-center gap-2 mb-2 font-medium">
                                {selectedRun.feedback.helpful ? <ThumbsUp size={16} className="text-green-600"/> : <ThumbsDown size={16} className="text-red-600"/>}
                                {selectedRun.feedback.helpful ? 'Helpful' : 'Unhelpful'}
                            </div>
                            {selectedRun.feedback.comment && (
                                <p className="text-gray-700 italic">"{selectedRun.feedback.comment}"</p>
                            )}
                        </div>
                    </div>
                )}

                {selectedRun.eval?.reasons && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Evaluation Reasons</h3>
                    <div className="mt-1 p-3 bg-yellow-50 rounded text-sm border border-yellow-100">
                      {/* Handle both parsed array and raw string if something went wrong */}
                      {Array.isArray(selectedRun.eval.reasons) ? (
                        <ul className="list-disc list-inside">
                          {selectedRun.eval.reasons.map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                      ) : (
                        <p>{typeof selectedRun.eval.reasons === 'string' ? selectedRun.eval.reasons : JSON.stringify(selectedRun.eval.reasons)}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
