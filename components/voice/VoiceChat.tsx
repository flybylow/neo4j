'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  intent?: string;
}

interface VoiceChatProps {
  className?: string;
  onQueryExecuted?: (cypher: string) => void;
}

export default function VoiceChat({ className = '', onQueryExecuted }: VoiceChatProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          const current = event.resultIndex;
          const result = event.results[current];
          const transcriptText = result[0].transcript;
          setTranscript(transcriptText);

          if (result.isFinal) {
            handleSendMessage(transcriptText);
          }
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setError(`Speech recognition error: ${event.error}`);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  // Start listening
  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setError(null);
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  // Send message to backend
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    setIsProcessing(true);
    setTranscript('');
    
    // Add user message
    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Send to chat API
      const chatResponse = await fetch('/api/voice/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      const chatData = await chatResponse.json();
      
      // Add assistant message
      const assistantMessage: Message = {
        role: 'assistant',
        content: chatData.response || chatData.error || 'Sorry, I encountered an error.',
        intent: chatData.intent,
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Notify parent of executed query
      if (chatData.cypher && onQueryExecuted) {
        onQueryExecuted(chatData.cypher);
      }

      // Speak the response
      await speakResponse(assistantMessage.content);

    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I had trouble connecting. Please try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Text-to-speech
  const speakResponse = async (text: string) => {
    setIsSpeaking(true);
    
    try {
      const response = await fetch('/api/voice/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('TTS failed');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        await audioRef.current.play();
      }
    } catch (err) {
      console.error('TTS error:', err);
      // Fallback to browser TTS
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
      }
    } finally {
      setIsSpeaking(false);
    }
  };

  // Handle text input submission
  const [textInput, setTextInput] = useState('');
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      handleSendMessage(textInput);
      setTextInput('');
    }
  };

  return (
    <>
      {/* Hidden audio element for TTS playback */}
      <audio ref={audioRef} onEnded={() => setIsSpeaking(false)} />

      {/* Floating chat button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-24 right-4 z-[1000] w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center ${className}`}
          aria-label="Open voice chat"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 z-[1000] w-96 bg-slate-900/95 backdrop-blur-lg rounded-2xl border border-slate-700 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎤</span>
              <span className="font-semibold text-white">Glass Haus Voice</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="h-72 overflow-y-auto p-4 space-y-3 scrollbar-dark">
            {messages.length === 0 && (
              <div className="text-center text-slate-400 py-8">
                <p className="text-lg mb-2">👋 Hello!</p>
                <p className="text-sm">Ask me about Glass Haus building materials, carbon footprint, or suppliers.</p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  <Badge 
                    className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-300"
                    onClick={() => handleSendMessage("What's the total carbon footprint?")}
                  >
                    Carbon footprint?
                  </Badge>
                  <Badge 
                    className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-300"
                    onClick={() => handleSendMessage("Which products are from Belgium?")}
                  >
                    Belgian suppliers?
                  </Badge>
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-violet-600 text-white'
                      : 'bg-slate-800 text-slate-100'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  {msg.intent && (
                    <Badge className="mt-1 text-xs bg-slate-700/50 text-slate-400">
                      {msg.intent}
                    </Badge>
                  )}
                </div>
              </div>
            ))}

            {/* Listening indicator */}
            {isListening && (
              <div className="flex justify-start">
                <div className="bg-slate-800 rounded-2xl px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm text-slate-400">
                      {transcript || 'Listening...'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Processing indicator */}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-slate-800 rounded-2xl px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-slate-400">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-2 bg-red-900/30 border-t border-red-800/50">
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}

          {/* Input area */}
          <div className="p-3 border-t border-slate-700 bg-slate-800/50">
            <form onSubmit={handleTextSubmit} className="flex gap-2">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type or speak..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-full px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                disabled={isListening || isProcessing}
              />
              
              {/* Voice button */}
              <Button
                type="button"
                size="sm"
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing}
                className={`rounded-full w-10 h-10 p-0 transition-all ${
                  isListening
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                    : 'bg-violet-600 hover:bg-violet-700'
                }`}
              >
                {isListening ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </Button>

              {/* Send button */}
              <Button
                type="submit"
                size="sm"
                disabled={!textInput.trim() || isProcessing}
                className="rounded-full w-10 h-10 p-0 bg-indigo-600 hover:bg-indigo-700"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </Button>
            </form>

            {/* Speaking indicator */}
            {isSpeaking && (
              <div className="mt-2 flex items-center justify-center gap-2 text-xs text-violet-400">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className="w-1 bg-violet-500 rounded-full animate-pulse"
                      style={{
                        height: `${Math.random() * 12 + 4}px`,
                        animationDelay: `${i * 100}ms`,
                      }}
                    />
                  ))}
                </div>
                <span>Speaking...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

