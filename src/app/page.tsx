
import Link from 'next/link';
import { 
  Activity, 
  ArrowRight, 
  Bot, 
  CheckCircle2, 
  Database, 
  Zap, 
  Layout, 
  MessageSquare, 
  BarChart3, 
  ShieldCheck, 
  Target, 
  Users, 
  Code2, 
  Briefcase 
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* 🟦 1. HERO */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="flex justify-between items-center p-4 max-w-7xl mx-auto">
            <Link href="/" className="text-xl font-bold text-gray-900 flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <Activity size={20} />
                </div>
                GoalSectors
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/onboarding" className="bg-gray-900 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-gray-800 transition shadow-lg shadow-gray-900/20">
                  Launch App
              </Link>
            </div>
        </div>
      </nav>

      <header className="relative flex flex-col items-center text-center px-6 pt-20 pb-24 max-w-4xl mx-auto">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-50 rounded-full blur-[120px] -z-10 opacity-60" />
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-gray-900 leading-[1.1]">
          Turn Ambition into <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Daily Action.</span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-10 max-w-2xl leading-relaxed mx-auto">
          Plan your day, build habits, and hit goals automatically with an AI coach that turns intentions into real tasks, not just reminders.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center mb-8">
          <Link href="/onboarding" className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 transform hover:-translate-y-0.5">
            Start Free Demo <ArrowRight size={20} />
          </Link>
          <Link href="/ops" className="text-gray-500 font-medium hover:text-gray-900 underline decoration-gray-300 hover:decoration-gray-900 underline-offset-4 transition">
             View System Health
          </Link>
        </div>

        <div className="flex items-center gap-6 text-sm font-medium text-gray-400">
            <span>No sign-up required</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span>Works on mobile</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span>Install like an app</span>
        </div>
      </header>

      {/* 🟦 2. PRODUCT SCREENSHOTS */}
      <section className="py-20 bg-gray-50/50 border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
             <h2 className="text-3xl font-bold text-gray-900">See it in action</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1: Dashboard */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
               <div className="h-48 bg-gray-100 border-b border-gray-100 relative p-4 flex flex-col gap-2">
                  {/* CSS Mockup */}
                  <div className="h-8 w-1/3 bg-white rounded-md shadow-sm mb-2"></div>
                  <div className="flex-1 bg-white rounded-xl shadow-sm p-3 space-y-2">
                     <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded border border-gray-300"></div>
                        <div className="h-2 w-2/3 bg-gray-100 rounded"></div>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded border border-gray-300"></div>
                        <div className="h-2 w-1/2 bg-gray-100 rounded"></div>
                     </div>
                     <div className="flex items-center gap-2 opacity-50">
                        <div className="w-4 h-4 rounded border border-blue-500 bg-blue-500"></div>
                        <div className="h-2 w-3/4 bg-gray-200 rounded"></div>
                     </div>
                  </div>
               </div>
               <div className="p-6">
                 <h3 className="font-bold text-lg text-gray-900 mb-1 flex items-center gap-2">
                    <Layout size={18} className="text-blue-600"/> Dashboard
                 </h3>
                 <p className="text-gray-600 text-sm">Your day, auto-planned with clear priorities.</p>
               </div>
            </div>

            {/* Card 2: Chat Coach */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
               <div className="h-48 bg-gray-100 border-b border-gray-100 relative p-4 flex flex-col justify-end gap-3">
                  {/* CSS Mockup */}
                  <div className="self-end bg-blue-600 text-white p-2 rounded-t-xl rounded-bl-xl text-[10px] w-2/3 shadow-sm">
                    Plan my day for productivity.
                  </div>
                  <div className="self-start bg-white border border-gray-200 text-gray-700 p-2 rounded-t-xl rounded-br-xl text-[10px] w-3/4 shadow-sm">
                    I've created 3 focus tasks and set a reminder for your workout.
                  </div>
               </div>
               <div className="p-6">
                 <h3 className="font-bold text-lg text-gray-900 mb-1 flex items-center gap-2">
                    <MessageSquare size={18} className="text-indigo-600"/> Chat Coach
                 </h3>
                 <p className="text-gray-600 text-sm">Just ask. It creates tasks & habits for you.</p>
               </div>
            </div>

            {/* Card 3: Ops Dashboard */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
               <div className="h-48 bg-gray-100 border-b border-gray-100 relative p-4 grid grid-cols-2 gap-2">
                  {/* CSS Mockup */}
                  <div className="bg-white rounded-lg border border-gray-200 p-2 shadow-sm flex flex-col justify-center items-center">
                     <div className="text-[10px] text-gray-400">Success</div>
                     <div className="text-lg font-bold text-green-600">99%</div>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-2 shadow-sm flex flex-col justify-center items-center">
                     <div className="text-[10px] text-gray-400">Latency</div>
                     <div className="text-lg font-bold text-gray-800">650ms</div>
                  </div>
                  <div className="col-span-2 bg-white rounded-lg border border-gray-200 p-2 shadow-sm mt-1">
                      <div className="h-1 bg-gray-100 rounded overflow-hidden">
                          <div className="h-full w-3/4 bg-blue-500"></div>
                      </div>
                  </div>
               </div>
               <div className="p-6">
                 <h3 className="font-bold text-lg text-gray-900 mb-1 flex items-center gap-2">
                    <BarChart3 size={18} className="text-emerald-600"/> Ops Dashboard
                 </h3>
                 <p className="text-gray-600 text-sm">Every AI decision measured and evaluated.</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🟦 3. SIMPLE WORKFLOW */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-3">Get Started in Seconds</h2>
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900">How to use GoalSectors</h3>
                <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
                    Stop managing lists. Start living your day. Here is your new simple daily routine.
                </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 relative">
                {/* Connector Line (Desktop) */}
                <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-100 via-indigo-100 to-emerald-100 -z-10"></div>

                {/* Step 1 */}
                <div className="group relative bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute -top-6 left-8 bg-blue-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-600/20">
                        1
                    </div>
                    <div className="mt-6">
                        <h3 className="text-xl font-bold mb-3 text-gray-900 flex items-center gap-2">
                            <Layout className="text-blue-600" size={20}/> Check Your Plan
                        </h3>
                        <p className="text-gray-600 leading-relaxed text-sm">
                            Open the app every morning. Your AI coach has already organized your <strong>Tasks</strong>, <strong>Habits</strong>, and <strong>Goals</strong> into a single view.
                        </p>
                        <div className="mt-4 bg-blue-50/50 p-3 rounded-xl border border-blue-100 text-xs text-blue-700 font-medium">
                            💡 Tip: Click "Launch App" to set up your sectors first.
                        </div>
                    </div>
                </div>
                
                {/* Step 2 */}
                <div className="group relative bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute -top-6 left-8 bg-indigo-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-600/20">
                        2
                    </div>
                    <div className="mt-6">
                        <h3 className="text-xl font-bold mb-3 text-gray-900 flex items-center gap-2">
                            <MessageSquare className="text-indigo-600" size={20}/> Just Ask
                        </h3>
                        <p className="text-gray-600 leading-relaxed text-sm">
                            Don't waste time on menus. Go to the <strong>Chat</strong> tab and tell your coach what you need.
                        </p>
                        <div className="mt-4 space-y-2">
                            <div className="bg-gray-50 p-2 rounded-lg text-xs text-gray-600 border border-gray-100">
                                "Add a meeting with John at 2pm"
                            </div>
                            <div className="bg-gray-50 p-2 rounded-lg text-xs text-gray-600 border border-gray-100">
                                "I drank water" (updates habit)
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Step 3 */}
                <div className="group relative bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute -top-6 left-8 bg-emerald-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-600/20">
                        3
                    </div>
                    <div className="mt-6">
                        <h3 className="text-xl font-bold mb-3 text-gray-900 flex items-center gap-2">
                            <Zap className="text-emerald-600" size={20}/> Build Streaks
                        </h3>
                        <p className="text-gray-600 leading-relaxed text-sm">
                            As you check off items, your <strong>Streaks</strong> grow. The AI learns what you can handle and adjusts your future plans.
                        </p>
                        <div className="mt-4 flex items-center gap-2">
                            <div className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                5 Day Streak
                            </div>
                            <div className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                90% Completion
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-16 text-center">
                <Link href="/onboarding" className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-800 transition shadow-xl hover:scale-105 transform duration-200">
                    Start Step 1 Now <ArrowRight size={20} />
                </Link>
            </div>
        </div>
      </section>

      {/* 🟦 4. DIFFERENTIATION */}
      <section className="py-24 bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-6">
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900">Why GoalSectors actually works</h2>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="space-y-3">
                      <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-blue-600 shadow-sm">
                          <Zap size={20} />
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg">Not just chat</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">We don’t give advice. We create real tasks, habits, and plans automatically.</p>
                  </div>
                  
                  <div className="space-y-3">
                      <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-purple-600 shadow-sm">
                          <Code2 size={20} />
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg">Structured AI</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">Strict JSON outputs. No hallucinations. No messy text. Only actions.</p>
                  </div>

                  <div className="space-y-3">
                      <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-emerald-600 shadow-sm">
                          <ShieldCheck size={20} />
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg">Measured reliability</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">Every AI run is validated, scored, and traced with Opik.</p>
                  </div>

                  <div className="space-y-3">
                      <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-orange-600 shadow-sm">
                          <Target size={20} />
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg">Built for consistency</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">Daily loops, streaks, and feedback help you stick to goals long-term.</p>
                  </div>
              </div>
          </div>
      </section>

      {/* 🟦 5. OBSERVABILITY / OPIK SECTION */}
      <section className="py-24 bg-gray-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                    <div className="inline-flex items-center gap-2 bg-blue-900/50 text-blue-300 px-3 py-1 rounded-full text-xs font-bold mb-6 border border-blue-800/50">
                        <Activity size={12} /> Powered by Opik Observability
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                        Built for <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Reliability & Observability</span>
                    </h2>
                    <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                        We don’t trust black-box AI. Every decision is traced, evaluated, and improved using Opik. 
                        We measure schema accuracy, usefulness, and real-world outcomes so the system gets better every day.
                    </p>
                    
                    <ul className="space-y-3 text-gray-300 font-medium">
                        <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> Strict JSON output</li>
                        <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> Real-time evaluations</li>
                        <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div> Human feedback loops</li>
                        <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div> Completion tracking</li>
                    </ul>
                </div>
                
                <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-2xl blur opacity-30"></div>
                    <div className="relative bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-2xl">
                        <div className="bg-gray-900 px-4 py-3 border-b border-gray-700 flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <div className="ml-4 text-xs font-mono text-gray-500">ops-dashboard.tsx</div>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm">System Health</span>
                                <span className="text-emerald-400 text-sm font-mono">ONLINE</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                                    <div className="text-xs text-gray-500 mb-1">Schema Success</div>
                                    <div className="text-2xl font-bold text-white">99.2%</div>
                                    <div className="w-full bg-gray-700 h-1 mt-2 rounded-full">
                                        <div className="bg-emerald-500 h-1 rounded-full w-[99%]"></div>
                                    </div>
                                </div>
                                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                                    <div className="text-xs text-gray-500 mb-1">Avg Latency</div>
                                    <div className="text-2xl font-bold text-white">650ms</div>
                                    <div className="w-full bg-gray-700 h-1 mt-2 rounded-full">
                                        <div className="bg-blue-500 h-1 rounded-full w-[60%]"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-gray-400">Latest Run</span>
                                    <span className="text-gray-500">Just now</span>
                                </div>
                                <div className="font-mono text-xs text-green-400">
                                    {`{ "action": "CREATE_TASK", "title": "Review PR" }`}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* 🟦 6. WHO IT’S FOR */}
      <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-16 text-center">Who it’s for</h2>
              
              <div className="grid md:grid-cols-4 gap-8">
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 mb-4 shadow-sm">
                          <Briefcase size={20} />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-1">Students</h3>
                      <p className="text-sm text-gray-600">Stay consistent with study habits and deadlines.</p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-purple-600 mb-4 shadow-sm">
                          <Users size={20} />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-1">Founders</h3>
                      <p className="text-sm text-gray-600">Plan your day without mental overhead.</p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-indigo-600 mb-4 shadow-sm">
                          <Code2 size={20} />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-1">Builders</h3>
                      <p className="text-sm text-gray-600">Break big goals into weekly action steps.</p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-600 mb-4 shadow-sm">
                          <CheckCircle2 size={20} />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-1">Anyone</h3>
                      <p className="text-sm text-gray-600">Who’s tired of productivity apps that don’t actually help.</p>
                  </div>
              </div>
          </div>
      </section>

      {/* 🟦 7. PROOF / METRICS */}
      <section className="py-20 border-t border-b border-gray-100 bg-gray-50/30">
          <div className="max-w-7xl mx-auto px-6 text-center">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-10">System Performance</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div>
                      <div className="text-4xl font-extrabold text-gray-900 mb-2">92%</div>
                      <div className="text-sm font-bold text-gray-700">Schema Success</div>
                      <div className="text-xs text-gray-500 mt-1">AI responses validated</div>
                  </div>
                  <div>
                      <div className="text-4xl font-extrabold text-gray-900 mb-2">650ms</div>
                      <div className="text-sm font-bold text-gray-700">Avg Latency</div>
                      <div className="text-xs text-gray-500 mt-1">Fast, real-time planning</div>
                  </div>
                  <div>
                      <div className="text-4xl font-extrabold text-gray-900 mb-2">85%</div>
                      <div className="text-sm font-bold text-gray-700">Completion Rate</div>
                      <div className="text-xs text-gray-500 mt-1">Tasks actually finished</div>
                  </div>
                  <div>
                      <div className="text-4xl font-extrabold text-gray-900 mb-2">1,000+</div>
                      <div className="text-sm font-bold text-gray-700">Runs Evaluated</div>
                      <div className="text-xs text-gray-500 mt-1">Continuously improving</div>
                  </div>
              </div>
          </div>
      </section>

      {/* 🟦 8. FINAL CTA */}
      <section className="py-32 bg-white text-center">
          <div className="max-w-3xl mx-auto px-6">
              <h2 className="text-4xl font-bold text-gray-900 mb-8">Ready to turn goals into action?</h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/onboarding" className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-600/20">
                      Launch App
                  </Link>
                  <Link href="/ops" className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-lg hover:bg-gray-50 transition">
                      View Observability Dashboard
                  </Link>
              </div>
          </div>
      </section>

      {/* 🟦 9. FOOTER */}
      <footer className="bg-gray-50 py-16 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-12 mb-12">
                <div className="col-span-1 md:col-span-1">
                    <div className="flex items-center gap-2 font-bold text-xl text-gray-900 mb-4">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center">
                            <Activity size={18} />
                        </div>
                        GoalSectors
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        Turn ambition into daily action with structured AI planning.
                    </p>
                </div>
                
                <div>
                    <h4 className="font-bold text-gray-900 mb-4">Product</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li><Link href="/onboarding" className="hover:text-blue-600">Launch App</Link></li>
                        <li><Link href="/ops" className="hover:text-blue-600">Ops Dashboard</Link></li>
                    </ul>
                </div>
                
                <div>
                    <h4 className="font-bold text-gray-900 mb-4">Resources</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li><a href="#" className="hover:text-blue-600">GitHub</a></li>
                        <li><a href="#" className="hover:text-blue-600">Docs</a></li>
                    </ul>
                </div>
                
                <div>
                    <h4 className="font-bold text-gray-900 mb-4">Legal</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li><a href="#" className="hover:text-blue-600">Privacy</a></li>
                        <li><a href="#" className="hover:text-blue-600">Terms</a></li>
                        <li><span className="text-gray-400">Built with Opik</span></li>
                    </ul>
                </div>
            </div>
            
            <div className="pt-8 border-t border-gray-200 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
                <p>&copy; 2026 GoalSectors. All rights reserved.</p>
                <div className="flex gap-6 mt-4 md:mt-0">
                    <a href="#" className="hover:text-gray-600">Twitter</a>
                    <a href="#" className="hover:text-gray-600">LinkedIn</a>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
}
