import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Sparkles, Lightbulb, TrendingUp, Mic, ImageIcon, Volume2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Load messages from localStorage or return default message
const loadMessages = () => {
  try {
    const saved = localStorage.getItem('aiChatMessages');
    if (saved) {
      return JSON.parse(saved).map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    }
  } catch (e) {
    console.error('Failed to load messages:', e);
  }
  // Default welcome message
  return [{
    id: Date.now(),
    type: 'bot',
    content: "Hello! I'm your AI farming assistant. I can help you with crop management, weather advice, pest control, and more. What would you like to know today?",
    timestamp: new Date()
  }];
};

const AIAgentPage = ({ onNavigate, location, setLocation }) => {
  const [messages, setMessages] = useState(loadMessages());
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('aiChatMessages', JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save messages:', e);
    }
  }, [messages]);

  // Clear chat only on logout
  useEffect(() => {
    const handleLogout = () => {
      if (!localStorage.getItem('token')) {
        localStorage.removeItem('aiChatMessages');
      }
    };

    window.addEventListener('beforeunload', handleLogout);
    return () => {
      window.removeEventListener('beforeunload', handleLogout);
    };
  }, []);

  useEffect(() => {
    setSessionId(uuidv4());
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    { text: 'Crop recommendations', icon: TrendingUp },
    { text: 'Pest control advice', icon: Lightbulb },
    { text: 'Weather impact on crops', icon: Sparkles },
    { text: 'Fertilizer suggestions', icon: Bot }
  ];

  const formatResponse = (text) => {
    if (!text) return text;
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/^\s*[-*]\s+(.*)/gm, '<li>$1</li>');
    text = text.replace(/<\/li>\n<li>/g, '</li><li>');
    const listRegex = /(<li>.*<\/li>)/s;
    if (listRegex.test(text)) {
      text = text.replace(listRegex, '<ul class="list-disc pl-5 space-y-1 mt-2">$1</ul>');
    }
    return text.split('\n').map((p, i) => (
      <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
    ));
  };

  // ✅ Voice Input
  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    if (!recognitionRef.current) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      setIsRecording(true);
      recognitionRef.current.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            transcript += result[0].transcript;
          }
        }
        if (transcript) {
          setInputMessage(prev => prev + " " + transcript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        if (isRecording) {
          recognitionRef.current.start();
        }
      };      
    }

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsListening(false);
    }
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
      setIsListening(false);
      setIsRecording(false);
    }
  };

  // ✅ Text-to-Speech for bot messages
  const speakMessage = (text) => {
    if (!window.speechSynthesis) {
      alert("Speech synthesis is not supported in this browser.");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    setIsSpeaking(true);
    utterance.lang = "en-US";
    utterance.rate = 1; // speed
    utterance.pitch = 1; // tone
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const sendData = async (formData) => {
    setIsTyping(true);
    try {
      const response = await axios.post("http://localhost:8000/chat", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: response.data.response,
        timestamp: new Date()
      };

      setMessages(prev => {
        const updated = [...prev, botMessage];
        return updated;
      });

    } catch (err) {
      console.error("Error:", err);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "bot",
          content: "⚠️ Error: Could not process request.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsTyping(false);
      setSelectedImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !selectedImage) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      image: selectedImage ? URL.createObjectURL(selectedImage) : null,
      timestamp: new Date()
    };
    setMessages(prev => {
      const updated = [...prev, userMessage];
      return updated;
    });

    const formData = new FormData();
    formData.append("session_id", sessionId);
    if (inputMessage) formData.append("text", inputMessage);
    if (selectedImage) formData.append("image", selectedImage);

    // ✅ add location
    if (location) {
      const locationStr = `${location.lat},${location.lon}`;
      formData.append("location", locationStr);
    }

    setInputMessage('');
    await sendData(formData);
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 pb-20">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">AI Farming Assistant</h1>
            <p className="text-gray-600 text-sm">Your intelligent farming companion</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft mb-6">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Chat</h3>
          </div>
          
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md p-3 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.type === 'bot' && (
                      <Bot className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                    )}
                    <div>
                      {message.image && (
                        <img
                          src={message.image}
                          alt="Uploaded"
                          className="my-2 max-w-full max-h-48 rounded-lg border"
                        />
                      )}
                      <div className="flex items-center gap-2">
                        <p className="text-sm">{formatResponse(message.content)}</p>
                        {/* ✅ Speaker button only for bot messages */}
                        {message.type === 'bot' && (
                          <button
                            onClick={() => isSpeaking ? stopSpeaking() : speakMessage(message.content)}
                            className="ml-2 p-1 rounded-full hover:bg-gray-200"
                            title="Listen"
                          >
                            <Volume2 className="h-4 w-4 text-blue-600" />
                          </button>
                        )}
                      </div>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {message.type === 'user' && (
                      <User className="h-4 w-4 text-white mt-1 flex-shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 max-w-xs lg:max-w-md p-3 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-blue-600" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ✅ Image preview before sending */}
        {selectedImage && (
          <div className="fixed bottom-32 left-0 right-0 px-4 z-30">
            <div className="flex items-center justify-between bg-white border rounded-lg shadow-md p-2">
              <img
                src={URL.createObjectURL(selectedImage)}
                alt="Preview"
                className="h-20 object-contain rounded"
              />
              <button
                onClick={() => {
                  setSelectedImage(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="text-red-500 text-sm px-2 py-1 hover:bg-red-100 rounded"
              >
                ❌ Remove
              </button>
            </div>
          </div>
        )}

        <div className="fixed bottom-16 left-0 right-0 p-4 bg-white shadow-lg z-20">
          <div className="flex gap-3 items-center">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me anything about farming..."
              className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isTyping}
            />

            <button
              onClick={isListening ? stopVoiceInput : startVoiceInput}
              className={`p-3 rounded-lg ${
                isListening ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'
              } hover:bg-gray-200 transition-colors`}
              title={isListening ? 'Stop recording' : 'Start recording'}
              disabled={isTyping}
            >
              <Mic className="h-5 w-5" />
            </button>
            
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
            <button
              onClick={() => fileInputRef.current.click()}
              className="p-3 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              title="Upload image"
              disabled={isTyping}
            >
              <ImageIcon className="h-5 w-5" />
            </button>

            <button
              onClick={handleSendMessage}
              disabled={(!inputMessage.trim() && !selectedImage) || isTyping}
              className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-10">
        <Navbar onNavigate={onNavigate} activePage="ai" />
      </div>
    </div>
  );
};

export default AIAgentPage;