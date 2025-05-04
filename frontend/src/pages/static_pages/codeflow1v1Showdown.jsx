import React, { useState } from "react";
import { Calendar, Code, Trophy, Users, Clock, Shield, AlertCircle, GitPullRequest, Zap, Cpu, Check, Copy } from "lucide-react";

// Sample data - will be replaced by JSON imports
import questions from "./data/questions.json";
import snippets from "./data/snippets.json";

export default function CodeFlowShowdown() {
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedRules, setExpandedRules] = useState(false);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Hero Section with Animated Background */}
      <header className="relative overflow-hidden py-12 px-6 md:py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(76,0,255,0.5)_0%,transparent_70%)]"></div>
          <div className="absolute top-60 right-20 w-72 h-72 bg-blue-500 rounded-full filter blur-3xl opacity-20"></div>
          <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-purple-500 rounded-full filter blur-3xl opacity-20"></div>
        </div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                <Code className="text-blue-400" />
                <h2 className="text-blue-400 font-mono uppercase tracking-wider">1v1 Showdown</h2>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                  CodeFlow
                </span>
              </h1>
              <p className="text-gray-300 text-lg md:text-xl mb-8">
                The ultimate live coding battle to test your skills, speed, and problem-solving prowess
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <div className="px-4 py-2 bg-gray-800 rounded-lg flex items-center gap-2">
                  <Calendar size={16} className="text-blue-400" />
                  <span>May 04, 2025</span>
                </div>
                <div className="px-4 py-2 bg-gray-800 rounded-lg flex items-center gap-2">
                  <Clock size={16} className="text-blue-400" />
                  <span>05:30 PM IST</span>
                </div>
                <div className="px-4 py-2 bg-gray-800 rounded-lg flex items-center gap-2">
                  <Users size={16} className="text-blue-400" />
                  <span>Lab 4</span>
                </div>
              </div>
            </div>
            <div className="w-full md:w-auto md:flex-shrink-0">
              <div className="relative">
                <div className="w-52 h-52 border-4 border-blue-500/30 rounded-2xl p-4 backdrop-blur-sm bg-gray-900/70 flex items-center justify-center rotate-3 transform transition hover:rotate-0">
                  <Trophy className="w-24 h-24 text-yellow-500" />
                </div>
                <div className="absolute -bottom-4 -right-4 px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-sm font-medium">
                  Rise to the top
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="sticky top-0 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 z-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex overflow-x-auto no-scrollbar py-3 gap-1 md:gap-2">
            {[
              { id: "overview", label: "Overview", icon: <Cpu size={16} /> },
              { id: "format", label: "Format", icon: <GitPullRequest size={16} /> },
              { id: "bughunt", label: "Bug Hunt", icon: <AlertCircle size={16} /> },
              { id: "codeduel", label: "Code Duel", icon: <Zap size={16} /> },
              { id: "rules", label: "Rules", icon: <Shield size={16} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Overview Section */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <section className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Cpu className="text-blue-400" />
                <span>CodeFlow: 1v1 Showdown</span>
              </h2>
              <p className="text-gray-300">
                Welcome to the ultimate live coding battle – CodeFlow: 1v1 Showdown! This knockout-style competition challenges
                participants to debug and solve problems head-to-head in thrilling rounds. Winners advance through the bracket,
                with points awarded at each stage based on performance.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-gray-900/80 p-4 rounded-lg border border-gray-700">
                  <h3 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                    <AlertCircle size={18} />
                    Bug Hunt
                  </h3>
                  <p className="text-sm text-gray-300">Fix buggy code snippets correctly before your opponent</p>
                  <div className="text-xs text-gray-400 mt-2">10–15 minutes</div>
                </div>
                
                <div className="bg-gray-900/80 p-4 rounded-lg border border-gray-700">
                  <h3 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                    <Zap size={18} />
                    Code Duel
                  </h3>
                  <p className="text-sm text-gray-300">Solve coding problems with speed and accuracy</p>
                  <div className="text-xs text-gray-400 mt-2">15–20 minutes</div>
                </div>
                
                <div className="bg-gray-900/80 p-4 rounded-lg border border-gray-700">
                  <h3 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                    <Clock size={18} />
                    Tiebreaker
                  </h3>
                  <p className="text-sm text-gray-300">Fast-paced challenge to decide the winner</p>
                  <div className="text-xs text-gray-400 mt-2">5–10 minutes</div>
                </div>
              </div>
            </section>
            
            <section className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
              <h2 className="text-2xl font-bold mb-4">Tournament Format</h2>
              <div className="relative">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(76,0,255,0.2)_0%,transparent_50%)]"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-center flex-wrap gap-y-4">
                    <div className="flex-1 min-w-[200px] bg-gray-900/80 p-4 rounded-lg border border-blue-900/30 text-center">
                      <div className="text-sm text-gray-400">Round 1</div>
                      <div className="font-medium">Round of X</div>
                    </div>
                    <div className="hidden md:block w-8 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
                    <div className="flex-1 min-w-[200px] bg-gray-900/80 p-4 rounded-lg border border-blue-900/30 text-center">
                      <div className="text-sm text-gray-400">Round 2</div>
                      <div className="font-medium">Quarterfinals</div>
                    </div>
                    <div className="hidden md:block w-8 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
                    <div className="flex-1 min-w-[200px] bg-gray-900/80 p-4 rounded-lg border border-blue-900/30 text-center">
                      <div className="text-sm text-gray-400">Round 3</div>
                      <div className="font-medium">Semifinals</div>
                    </div>
                    <div className="hidden md:block w-8 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
                    <div className="flex-1 min-w-[200px] bg-gray-900/80 p-4 rounded-lg border border-purple-900/50 text-center">
                      <div className="text-sm text-purple-400">Final Round</div>
                      <div className="font-medium">Finals</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            
            <section className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
              <h2 className="text-2xl font-bold mb-4">Scoring System</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-900/80">
                      <th className="p-3 text-left text-sm font-medium text-gray-300 border-b border-gray-700">Stage</th>
                      <th className="p-3 text-center text-sm font-medium text-gray-300 border-b border-gray-700">Match Win</th>
                      <th className="p-3 text-center text-sm font-medium text-gray-300 border-b border-gray-700">Match Loss</th>
                      <th className="p-3 text-center text-sm font-medium text-gray-300 border-b border-gray-700">Bug Hunt Win</th>
                      <th className="p-3 text-center text-sm font-medium text-gray-300 border-b border-gray-700">Code Duel Win</th>
                      <th className="p-3 text-center text-sm font-medium text-gray-300 border-b border-gray-700">Tiebreak Win</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-gray-900/50">
                      <td className="p-3 text-sm border-b border-gray-700">Round of X</td>
                      <td className="p-3 text-sm text-center border-b border-gray-700">10</td>
                      <td className="p-3 text-sm text-center border-b border-gray-700">4</td>
                      <td className="p-3 text-sm text-center border-b border-gray-700">3</td>
                      <td className="p-3 text-sm text-center border-b border-gray-700">3</td>
                      <td className="p-3 text-sm text-center border-b border-gray-700">2</td>
                    </tr>
                    <tr className="hover:bg-gray-900/50">
                      <td className="p-3 text-sm border-b border-gray-700">Quarterfinals</td>
                      <td className="p-3 text-sm text-center border-b border-gray-700">15</td>
                      <td className="p-3 text-sm text-center border-b border-gray-700">6</td>
                      <td className="p-3 text-sm text-center border-b border-gray-700">3</td>
                      <td className="p-3 text-sm text-center border-b border-gray-700">3</td>
                      <td className="p-3 text-sm text-center border-b border-gray-700">3</td>
                    </tr>
                    <tr className="hover:bg-gray-900/50">
                      <td className="p-3 text-sm border-b border-gray-700">Semifinals</td>
                      <td className="p-3 text-sm text-center border-b border-gray-700">25</td>
                      <td className="p-3 text-sm text-center border-b border-gray-700">10</td>
                      <td className="p-3 text-sm text-center border-b border-gray-700">3</td>
                      <td className="p-3 text-sm text-center border-b border-gray-700">3</td>
                      <td className="p-3 text-sm text-center border-b border-gray-700">4</td>
                    </tr>
                    <tr className="hover:bg-gray-900/50">
                      <td className="p-3 text-sm border-b border-gray-700">Finals</td>
                      <td className="p-3 text-sm text-center border-b border-gray-700">40</td>
                      <td className="p-3 text-sm text-center border-b border-gray-700">15</td>
                      <td className="p-3 text-sm text-center border-b border-gray-700">5</td>
                      <td className="p-3 text-sm text-center border-b border-gray-700">5</td>
                      <td className="p-3 text-sm text-center border-b border-gray-700">5</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Bonus Points</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-gray-900/80 p-3 rounded-lg border border-gray-700 flex items-center gap-2">
                    <div className="p-1.5 bg-gray-800 rounded-full">
                      <Clock size={16} className="text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Close Match (Tiebreaker)</div>
                      <div className="text-xs text-gray-400">+2 points</div>
                    </div>
                  </div>
                  <div className="bg-gray-900/80 p-3 rounded-lg border border-gray-700 flex items-center gap-2">
                    <div className="p-1.5 bg-gray-800 rounded-full">
                      <AlertCircle size={16} className="text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Fastest Bug Fix</div>
                      <div className="text-xs text-gray-400">+3 points</div>
                    </div>
                  </div>
                  <div className="bg-gray-900/80 p-3 rounded-lg border border-gray-700 flex items-center gap-2">
                    <div className="p-1.5 bg-gray-800 rounded-full">
                      <Zap size={16} className="text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Fastest Problem Solved</div>
                      <div className="text-xs text-gray-400">+3 points</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Format Section */}
        {activeTab === "format" && (
          <div className="space-y-8">
            <section className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <GitPullRequest className="text-blue-400" />
                <span>Match Structure</span>
              </h2>
              <p className="text-gray-300 mb-6">
                Each match consists of up to 3 stages, with participants advancing based on their performance.
              </p>
              
              <div className="space-y-4">
                <div className="bg-gray-900/80 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-500/20 text-blue-400 rounded-full">1</div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <AlertCircle size={18} className="text-blue-400" />
                      Bug Hunt
                    </h3>
                  </div>
                  <div className="pl-11">
                    <p className="text-gray-300 text-sm">A buggy code snippet is shared. First to fix it correctly wins the round.</p>
                    <div className="text-xs text-gray-400 mt-1">Duration: 10–15 minutes</div>
                  </div>
                </div>
                
                <div className="bg-gray-900/80 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-500/20 text-blue-400 rounded-full">2</div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Zap size={18} className="text-blue-400" />
                      Code Duel
                    </h3>
                  </div>
                  <div className="pl-11">
                    <p className="text-gray-300 text-sm">Solve a coding problem. First correct solution or most test cases passed wins.</p>
                    <div className="text-xs text-gray-400 mt-1">Duration: 15–20 minutes</div>
                  </div>
                </div>
                
                <div className="bg-gray-900/80 p-4 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-500/20 text-blue-400 rounded-full">3</div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Clock size={18} className="text-blue-400" />
                      Tiebreaker (If needed)
                    </h3>
                  </div>
                  <div className="pl-11">
                    <p className="text-gray-300 text-sm">A short, fast-paced challenge to decide the winner.</p>
                    <div className="text-xs text-gray-400 mt-1">Duration: 5–10 minutes</div>
                  </div>
                </div>
              </div>
            </section>
            
            <section className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
              <h2 className="text-2xl font-bold mb-4">Evaluation Criteria</h2>
              
              <div className="space-y-4">
                <div className="bg-gray-900/80 p-4 rounded-lg border border-gray-700">
                  <h3 className="font-semibold text-blue-400 mb-2">Bug Hunt</h3>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>First correct submission wins</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>Participants must explain their fix if asked</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gray-900/80 p-4 rounded-lg border border-gray-700">
                  <h3 className="font-semibold text-blue-400 mb-2">Code Duel</h3>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>Judged on correctness & efficiency</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>Partial credit for partial test case success</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gray-900/80 p-4 rounded-lg border border-gray-700">
                  <h3 className="font-semibold text-blue-400 mb-2">Tiebreaker</h3>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>Speed and accuracy both matter</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Bug Hunt Section */}
        {activeTab === "bughunt" && (
          <div className="space-y-8">
            <section className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="text-blue-400" />
                <span>Bug Hunt Challenge</span>
              </h2>
              <p className="text-gray-300 mb-6">
                Debug and fix the code snippets as quickly as possible. Each snippet contains one or more bugs that need to be identified and corrected.
              </p>
              
              <div className="space-y-6">
                {snippets.map((snippet, index) => (
                  <div key={index} className="bg-gray-900/80 rounded-lg border border-gray-700 overflow-hidden">
                    <div className="border-b border-gray-700 p-3 flex justify-between items-center">
                      <h3 className="font-medium text-blue-400 flex items-center gap-2">
                        <Code size={16} />
                        <span>Snippet #{index + 1}: {snippet.title}</span>
                      </h3>
                      <div className="px-2 py-0.5 bg-gray-800 rounded text-xs font-medium">{snippet.language}</div>
                    </div>
                    <div className="p-4">
                    <CodeSnippet code={snippet.code} />
                      
                      {/* {snippet.hint && (
                        <div className="mt-3 p-2 bg-blue-900/20 border border-blue-900/30 rounded text-xs text-gray-300">
                          <span className="font-medium text-blue-400">Hint:</span> {snippet.hint}
                        </div>
                      )} */}
                      
                      {snippet.expectedOutput && (
                        <div className="mt-3">
                          <div className="text-xs font-medium text-gray-400 mb-1">Expected Output:</div>
                          <div className="bg-gray-950 rounded p-2 text-xs font-mono text-gray-300">
                            {snippet.expectedOutput}
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between items-center mt-3">
        
                        <div className="mt-3 p-2 bg-blue-900/20 border border-blue-900/30 rounded text-xs text-gray-300">
                          <span className="font-medium text-blue-400">Copy the Code and paste it on Leetcode or any other IDE (VS Code) and then start debugging</span>
                        </div>
                        <a 
                          href={snippet.link ==null? "https://leetcode.com/: " : snippet.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                        >
                          Fix on Leetcode
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M15 3h6v6" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M10 14L21 3" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Code Duel Section */}
        {activeTab === "codeduel" && (
          <div className="space-y-8">
            <section className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Zap className="text-blue-400" />
                <span>Code Duel Problems</span>
              </h2>
              <p className="text-gray-300 mb-6">
                Solve coding problems faster than your opponent. Problems focus on algorithms, data structures, and efficient solutions.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {questions.map((question) => (
                  <div key={question.id} className="bg-gray-900/80 rounded-lg border border-gray-700 overflow-hidden">
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-medium">
                          <span className="text-blue-400">#{question.id}:</span> {question.title}
                        </h3>
                        <div className="px-2 py-0.5 bg-gray-800 rounded text-xs font-medium">{question.category}</div>
                      </div>
                      <p className="text-sm text-gray-300 mb-3 line-clamp-2">{question.description}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {question.timeLimit} mins
                        </span>
                        <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                        <span>Contest Questions</span>
                      </div>
                    </div>
                    <div className="bg-gray-950/50 border-t border-gray-700 p-3">
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-400">
                          Topics: <span className="text-blue-400">{question.tags.join(", ")}</span>
                        </div>
                        <a 
                          href={question.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                        >
                          Solve
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M15 3h6v6" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M10 14L21 3" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Rules Section */}
        {activeTab === "rules" && (
          <div className="space-y-8">
            <section className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Shield className="text-blue-400" />
                <span>Rules & Fair Play</span>
              </h2>
              
              <div className="bg-red-900/20 border border-red-900/30 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-red-400 mb-2">Important Notice</h3>
                <p className="text-sm text-gray-300">
                  Any violation of these rules may result in immediate disqualification from the competition.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-900/80 p-4 rounded-lg border border-gray-700">
                  <h3 className="font-semibold text-blue-400 mb-2">Prohibited Actions</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">✕</span>
                      <span>No copying or collaboration with other participants</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">✕</span>
                      <span>No use of AI tools, scripts, or unauthorized resources</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">✕</span>
                      <span>No unauthorized communication during challenges</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gray-900/80 p-4 rounded-lg border border-gray-700">
                  <h3 className="font-semibold text-blue-400 mb-2">Required Actions</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">✓</span>
                      <span>Compete with integrity - only your skill should shine</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">✓</span>
                      <span>Be prepared to explain your solutions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">✓</span>
                      <span>Follow judge instructions promptly</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div 
                className="mt-6 p-4 bg-gray-900/80 rounded-lg border border-gray-700 cursor-pointer transition-all"
                onClick={() => setExpandedRules(!expandedRules)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-blue-400">Additional Guidelines</h3>
                  <div className="text-blue-400">
                    {expandedRules ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                </div>
                
                {expandedRules && (
                  <div className="mt-4 space-y-3 text-sm text-gray-300">
                    <p>
                      <span className="font-medium text-blue-400">Time Management:</span> Respect time limits for each round. Participants who exceed the time limit may receive reduced points or be disqualified from that particular round.
                    </p>
                    <p>
                      <span className="font-medium text-blue-400">Technical Issues:</span> If you experience technical problems during a match, notify a judge immediately. Decisions regarding additional time or restarts will be at the judges' discretion.
                    </p>
                    <p>
                      <span className="font-medium text-blue-400">Code Submission:</span> All code must be submitted through the provided platform. Code submitted via any other means will not be considered.
                    </p>
                    <p>
                      <span className="font-medium text-blue-400">Spectators:</span> Spectators are welcome but must remain silent during matches. Any communication between spectators and participants during a match is prohibited.
                    </p>
                  </div>
                )}
              </div>
            </section>
            
            <section className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
              <h2 className="text-2xl font-bold mb-4">Rewards & Recognition</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-amber-900/30 to-yellow-900/20 p-4 rounded-lg border border-yellow-700/30">
                  <h3 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                    <Trophy size={18} />
                    <span>Winners & Semifinalists</span>
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-0.5">•</span>
                      <span>Certificate of Achievement</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-0.5">•</span>
                      <span>Cumulative Points</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/20 p-4 rounded-lg border border-blue-700/30">
                  <h3 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                    <Zap size={18} />
                    <span>Special Mentions</span>
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>Best Debugger</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>Fastest Solver</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 text-center">
                <div className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium">
                  🔥 Bring your A-game
                </div>
                <div className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium">
                  💡 Debug fast
                </div>
                <div className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white font-medium">
                  ⚡ Code smart
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-6 px-4">
        <div className="max-w-5xl mx-auto text-center text-gray-400 text-sm">
          <p>For queries, contact us at scitech.sec@students.iiitr.ac.in • Organized by Shubham Dubey</p>
          <p className="mt-2">© {new Date().getFullYear()} CodeFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function CodeSnippet({ code }) {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-950 rounded p-3 overflow-x-auto relative">
      <button 
        onClick={copyToClipboard}
        className="absolute top-2 right-2 p-1 bg-gray-800 rounded text-gray-300 hover:bg-gray-700 transition-colors"
        aria-label="Copy code"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-400" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
      <pre className="text-xs text-gray-300 font-mono pr-8">
        <code>{code}</code>
      </pre>
    </div>
  );
}