import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Bot, X, Send, MapPin, Search } from 'lucide-react';

interface EventAssistantProps {
  eventName: string;
  eventLocation: string;
  eventDescription: string;
}

export function EventAssistant({ eventName, eventLocation, eventDescription }: EventAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'search' | 'maps'>('search');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      
      const systemInstruction = `Você é um assistente virtual para o evento "${eventName}". 
A localização do evento é: "${eventLocation}".
A descrição do evento é: "${eventDescription}".
Ajude o usuário com dúvidas sobre o evento, localização, dicas de viagem, etc.
Responda em português de forma amigável e concisa.`;

      const tools = mode === 'search' 
        ? [{ googleSearch: {} }] 
        : [{ googleMaps: {} }];

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMessage,
        config: {
          systemInstruction,
          tools,
        }
      });

      setMessages(prev => [...prev, { role: 'model', text: response.text || 'Desculpe, não consegui gerar uma resposta.' }]);
    } catch (error) {
      console.error('Error generating response:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'Ocorreu um erro ao processar sua solicitação.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-xl bg-orange-600 hover:bg-orange-700 p-0 z-50"
      >
        <Bot className="w-6 h-6 text-white" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] shadow-2xl flex flex-col z-50 overflow-hidden border-orange-200">
      <CardHeader className="bg-orange-600 text-white p-4 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bot className="w-5 h-5" />
          Assistente do Evento
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-orange-700 hover:text-white h-8 w-8">
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      
      <div className="bg-orange-50 p-2 flex gap-2 border-b border-orange-100">
        <Button 
          variant={mode === 'search' ? 'default' : 'outline'} 
          size="sm" 
          className={`flex-1 text-xs ${mode === 'search' ? 'bg-orange-600 hover:bg-orange-700' : 'text-orange-600 border-orange-200'}`}
          onClick={() => setMode('search')}
        >
          <Search className="w-3 h-3 mr-1" /> Busca Geral
        </Button>
        <Button 
          variant={mode === 'maps' ? 'default' : 'outline'} 
          size="sm" 
          className={`flex-1 text-xs ${mode === 'maps' ? 'bg-orange-600 hover:bg-orange-700' : 'text-orange-600 border-orange-200'}`}
          onClick={() => setMode('maps')}
        >
          <MapPin className="w-3 h-3 mr-1" /> Localização
        </Button>
      </div>

      <CardContent className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground text-sm mt-4">
            Olá! Sou o assistente do evento. Posso te ajudar com informações gerais ou dicas sobre o local. O que você gostaria de saber?
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
              msg.role === 'user' 
                ? 'bg-orange-600 text-white rounded-tr-sm' 
                : 'bg-white border shadow-sm rounded-tl-sm text-gray-800'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border shadow-sm rounded-2xl rounded-tl-sm p-3 text-sm text-gray-500 flex gap-1 items-center">
              <span className="animate-bounce">.</span>
              <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
              <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>.</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      <div className="p-3 bg-white border-t">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex gap-2"
        >
          <Input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder={mode === 'search' ? "Pergunte algo..." : "Ex: Restaurantes próximos..."}
            className="flex-1"
            disabled={loading}
          />
          <Button type="submit" size="icon" className="bg-orange-600 hover:bg-orange-700" disabled={loading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
