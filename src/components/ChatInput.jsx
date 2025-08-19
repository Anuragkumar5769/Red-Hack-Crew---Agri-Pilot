import { MicIcon, ImageIcon, SunIcon, UserIcon, FileTextIcon, LeafIcon, BotIcon } from 'lucide-react';
import { useState } from 'react';

const ChatInput = () => {
  const [selectedTool, setSelectedTool] = useState(null);

  const tools = [
    { id: 'weather', name: 'Weather', icon: SunIcon, color: 'bg-blue-500' },
    { id: 'user-info', name: 'User Info', icon: UserIcon, color: 'bg-green-500' },
    { id: 'government-scheme', name: 'Govt Scheme', icon: FileTextIcon, color: 'bg-purple-500' },
    { id: 'disease-detection', name: 'Disease Detection', icon: LeafIcon, color: 'bg-red-500' },
    { id: 'ai-agent', name: 'AI Agent', icon: BotIcon, color: 'bg-orange-500' },
  ];

  const handleToolClick = (toolId) => {
    setSelectedTool(selectedTool === toolId ? null : toolId);
  };

  return (
    <div className="fixed bottom-16 left-0 right-0 px-4 z-10">
      {/* Tools Section */}
      <div className="mb-3">
        <div className="frost rounded-2xl shadow-soft p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">Quick Tools</span>
            <span className="text-xs text-gray-500">Tap to use</span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool.id)}
                className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${
                  selectedTool === tool.id 
                    ? 'bg-white shadow-md scale-105' 
                    : 'hover:bg-white/50'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg ${tool.color} flex items-center justify-center mb-1`}>
                  <tool.icon size={16} className="text-white" />
                </div>
                <span className="text-xs font-medium text-gray-700">{tool.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Input */}
      <div className="frost rounded-full shadow-soft px-3 py-2 flex items-center gap-2">
        <button className="p-2 rounded-full bg-white shadow hover:shadow-md transition-shadow">
          <ImageIcon size={18} className="text-gray-600" />
        </button>
        <input 
          className="flex-1 bg-transparent outline-none text-sm px-2 placeholder-gray-500" 
          placeholder={selectedTool ? `Ask about ${selectedTool}...` : "Type your question..."} 
        />
        <button className="p-2 rounded-full bg-green-600 text-white shadow hover:bg-green-700 transition-colors">
          <MicIcon size={18} />
        </button>
      </div>

      {/* Selected Tool Indicator */}
      {selectedTool && (
        <div className="mt-2 text-center">
          <span className="inline-block bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">
            {tools.find(t => t.id === selectedTool)?.name} mode active
          </span>
        </div>
      )}
    </div>
  );
};

export default ChatInput;