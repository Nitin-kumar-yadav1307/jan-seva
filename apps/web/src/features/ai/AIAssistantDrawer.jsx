import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../lib/api';
import { 
  Sparkles, 
  X, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  Star, 
  Clock, 
  ShieldCheck, 
  Zap, 
  HeartHandshake,
  Bot,
  Layers,
  ArrowRight
} from 'lucide-react';

const QUICK_PROMPTS = [
  { label: '🚨 Leaking Pipe Emergency', text: 'Water pipe burst under kitchen sink, leaking heavily! Need an urgent plumber right now.' },
  { label: '⚡ Electrical Short Circuit', text: 'Main switchboard sparked and electricity tripped in the living room.' },
  { label: '🧹 Deep Cleaning Tomorrow', text: 'Full house deep cleaning needed tomorrow morning at 10 AM.' },
  { label: '❄️ AC Not Cooling', text: 'Split AC is blowing warm air, need gas check and filter repair.' },
  { label: '🇮🇳 हिन्दी: नल खराब है', text: 'हमारे बाथरूम का नल टूट गया है, पानी बह रहा है तुरंत कोई कारीगर भेजो।' }
];

export const AIAssistantDrawer = ({ isOpen, onClose, onSelectWorkerForBooking }) => {
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [supervisorResult, setSupervisorResult] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [agentStep, setAgentStep] = useState('');

  const handleRunAI = async (textToRun) => {
    const query = textToRun || prompt;
    if (!query.trim()) return;

    setLoading(true);
    setSupervisorResult(null);
    setSelectedCandidate(null);
    setAgentStep('Booking Agent: Extracting natural language intent & urgency...');

    try {
      setTimeout(() => {
        setAgentStep('Matching Agent: Querying certified workers & applying deterministic fairness engine...');
      }, 700);

      const res = await api.post('/ai/supervisor', {
        prompt: query,
        customerLocation: {
          coordinates: [77.2167, 28.6328],
          address: 'Barakhamba Road, Connaught Place, New Delhi'
        }
      });

      setSupervisorResult(res.data);
      if (res.data.matchingResult?.topRecommendation) {
        setSelectedCandidate(res.data.matchingResult.topRecommendation);
      }
    } catch (err) {
      console.error('AI Error:', err);
    } finally {
      setLoading(false);
      setAgentStep('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-coop-900 via-coop-800 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/30 border border-blue-400/40 flex items-center justify-center text-blue-200">
              <Bot className="w-5 h-5 text-blue-300 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                Co-opSeva Autonomous AI Layer
                <span className="text-[10px] bg-blue-500/40 text-blue-200 px-1.5 py-0.5 rounded font-mono">
                  Supervisor + Agents
                </span>
              </h3>
              <p className="text-[11px] text-blue-200">Multi-agent ethical dispatch & explainable matching</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Conversation Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Quick Prompts */}
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Try a Quick Scenario:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPrompt(qp.text);
                    handleRunAI(qp.text);
                  }}
                  className="text-xs bg-slate-100 hover:bg-coop-50 hover:text-coop-700 hover:border-coop-300 border border-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg transition-colors text-left"
                >
                  {qp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Loading Animation with Sub-agent Steps */}
          {loading && (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 space-y-3">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 animate-spin" />
                <span className="text-sm font-semibold">Supervisor Agent Coordinating...</span>
              </div>
              <p className="text-xs text-blue-700 font-mono bg-white/70 p-2.5 rounded-lg border border-blue-100">
                ⚡ {agentStep}
              </p>
            </div>
          )}

          {/* AI Result View */}
          {supervisorResult && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Intent Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Structured Booking Intent Extracted
                  </span>
                  {supervisorResult.bookingIntent?.isEmergency && (
                    <span className="bg-rose-100 text-rose-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Zap className="w-3 h-3 text-rose-600 fill-rose-600" />
                      EMERGENCY MODE
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Service</span>
                    <span className="font-semibold text-slate-800">{supervisorResult.bookingIntent?.serviceCategory}</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">Language Detected</span>
                    <span className="font-semibold text-slate-800">{supervisorResult.bookingIntent?.detectedLanguage}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 italic bg-white p-2 rounded-lg border border-slate-100">
                  "{supervisorResult.agentMessage}"
                </p>
              </div>

              {/* Top Worker Recommendation */}
              {selectedCandidate && (
                <div className="p-4 rounded-xl border-2 border-coop-500 bg-white shadow-md space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-coop-700 bg-blue-50 px-2 py-0.5 rounded-md">
                      AI Recommended Match (Score: {selectedCandidate.scores?.totalScore}/100)
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      ₹{selectedCandidate.worker?.hourlyRate || 299}
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <img
                      src={selectedCandidate.worker?.avatar}
                      alt={selectedCandidate.worker?.name}
                      className="w-12 h-12 rounded-full object-cover border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        {selectedCandidate.worker?.name}
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      </h4>
                      <p className="text-xs text-slate-500 truncate">
                        {selectedCandidate.worker?.certifications?.[0]?.name || 'NSDC Certified Master Technician'}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-600">
                        <span className="flex items-center gap-0.5 font-bold text-amber-600">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {selectedCandidate.worker?.rating}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          ETA {selectedCandidate.etaMinutes}m ({selectedCandidate.distanceKm}km)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Multi-Factor Fairness Breakdown */}
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-semibold text-slate-700">
                      <span className="flex items-center gap-1">
                        <HeartHandshake className="w-3.5 h-3.5 text-coop-600" />
                        Fairness Balancing Breakdown
                      </span>
                      <span className="text-[11px] text-coop-600">Deterministic</span>
                    </div>

                    <div className="space-y-1 pt-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Skill Certified Match:</span>
                        <span className="font-semibold text-slate-800">{selectedCandidate.scores?.skillScore}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Proximity & ETA:</span>
                        <span className="font-semibold text-slate-800">{selectedCandidate.scores?.proximityScore}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Workload Balance (Burnout Protection):</span>
                        <span className="font-semibold text-emerald-600 font-bold">{selectedCandidate.scores?.workloadScore}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Cooperative Welfare Factor:</span>
                        <span className="font-semibold text-blue-600">{selectedCandidate.scores?.welfareFactor}%</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 pt-1.5 border-t border-slate-200 leading-relaxed font-sans">
                      💡 <strong>Explainability:</strong> {selectedCandidate.explainability?.reason}
                    </p>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => {
                      onSelectWorkerForBooking({
                        worker: selectedCandidate.worker,
                        serviceId: supervisorResult.suggestedServiceId,
                        isEmergency: supervisorResult.bookingIntent?.isEmergency,
                        matchingScores: selectedCandidate.scores
                      });
                      onClose();
                    }}
                    className="w-full bg-coop-600 hover:bg-coop-700 text-white font-bold py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2 text-sm transition-all"
                  >
                    <span>Proceed to Book with {selectedCandidate.worker?.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRunAI();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you need in plain words..."
              className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-coop-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="bg-coop-600 hover:bg-coop-700 disabled:opacity-50 text-white p-2.5 rounded-xl shadow-sm transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
