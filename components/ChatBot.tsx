
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { X, Send, Loader2, Sparkles, User, Bot, ShoppingBag, Wallet, Truck, Package, MessageSquareMore, Zap, ChevronDown } from 'lucide-react';
import { ORANGE_MONEY_NUMBER } from '../constants.tsx';
import { useUI } from '../contexts/UIContext.tsx';
import { 
  getCurrentUser, 
  getProducts, 
  getUserOrders
} from '../services/storageService.ts';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const SYSTEM_INSTRUCTION = `
You are the Innovative Gadget Shopping Assistant (IGA), a professional tech concierge.
Your goal is to help users discover high-performance hardware and manage their purchases.

We sell:
- Laptops, Phones, Watches, Speakers, Smart Home gear, and Cameras.

Rules:
- Strictly professional and hardware-focused. No financial advice or investment talk.
- Use Markdown for clean formatting.
- If users ask about their credit, use tools to check their store balance.
- If users ask about orders, use tools to check shipping status.
- Our Orange Money number for top-ups is ${ORANGE_MONEY_NUMBER}.
`;

const vaultStatsTool: FunctionDeclaration = {
  name: "get_wallet_stats",
  parameters: {
    type: Type.OBJECT,
    description: "Check the user's available store credit and account info.",
    properties: {}
  }
};

const marketIntelligenceTool: FunctionDeclaration = {
  name: "get_catalog",
  parameters: {
    type: Type.OBJECT,
    description: "Fetch the latest gadgets available in the store.",
    properties: {}
  }
};

const userPortfolioTool: FunctionDeclaration = {
  name: "get_user_orders",
  parameters: {
    type: Type.OBJECT,
    description: "Retrieve the user's recent orders and shipping status.",
    properties: {}
  }
};

const parseFormattedText = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <span key={index} className="font-bold text-white">
          {part.slice(2, -2)}
        </span>
      );
    }
    return part;
  });
};

const MessageContent: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  return (
    <div className="space-y-2 text-[13px] md:text-sm leading-relaxed text-gray-300">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-1" />;
        if (trimmed.startsWith('### ')) return <h4 key={i} className="text-emerald-400 font-bold text-sm uppercase mt-4 mb-2 flex items-center gap-2"><Sparkles size={12} />{trimmed.substring(4)}</h4>;
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) return <div key={i} className="flex gap-2 items-start pl-2"><div className="mt-2 w-1 h-1 rounded-full bg-emerald-500 shrink-0"></div><div className="flex-1">{parseFormattedText(trimmed.substring(2))}</div></div>;
        return <p key={i}>{parseFormattedText(trimmed)}</p>;
      })}
    </div>
  );
};

export const ChatBot: React.FC = () => {
    const { isChatOpen, closeChat } = useUI();
    const [messages, setMessages] = useState<ChatMessage[]>([
      { role: 'model', text: 'Hello! I am your **Innovative Gadget Assistant**. How can I help you find your next piece of tech today?' }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
  
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isChatOpen]);
  
    const executeTool = async (name: string, args: any) => {
        const user = getCurrentUser();
        if (!user) return "Please login to access your shopping data.";

        switch (name) {
            case "get_wallet_stats":
                return { balance: user.balance, phone: user.phone, currency: "SLE" };
            case "get_catalog":
                const products = await getProducts();
                return products.slice(0, 5).map(p => ({ name: p.name, price: p.price }));
            case "get_user_orders":
                const orders = await getUserOrders(user.id);
                return orders.map(o => ({ item: o.product_name, status: o.status }));
            default:
                return "Instruction not found.";
        }
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!inputText.trim() || isLoading) return;
      
      const userMessage = inputText.trim();
      setInputText('');
      setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
      setIsLoading(true);

      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const config = { 
            systemInstruction: SYSTEM_INSTRUCTION,
            tools: [{ functionDeclarations: [vaultStatsTool, marketIntelligenceTool, userPortfolioTool] }]
        };

        const response = await ai.models.generateContent({
          model: 'gemini-3-pro-preview', 
          contents: [
              ...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
              { role: 'user', parts: [{ text: userMessage }] }
          ],
          config
        });

        if (response.functionCalls && response.functionCalls.length > 0) {
            const toolResults = [];
            for (const fc of response.functionCalls) {
                const result = await executeTool(fc.name, fc.args);
                toolResults.push({
                    functionResponses: {
                        id: fc.id,
                        name: fc.name,
                        response: { result }
                    }
                });
            }

            const secondResponse = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: [
                    ...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
                    { role: 'user', parts: [{ text: userMessage }] },
                    { role: 'model', parts: response.candidates[0].content.parts },
                    { role: 'user', parts: [{ text: `System Feedback: ${JSON.stringify(toolResults)}` }] }
                ],
                config
            });
            
            setMessages(prev => [...prev, { role: 'model', text: secondResponse.text || "Hardware database synced. How else can I assist?" }]);
        } else {
            setMessages(prev => [...prev, { role: 'model', text: response.text || "I am here to help with your tech shopping." }]);
        }
      } catch (error) {
        setMessages(prev => [...prev, { role: 'model', text: "Support node busy. Please retry in a moment." }]);
      } finally { setIsLoading(false); }
    };

    return (
        <div className={`fixed z-[100] md:z-[60] bottom-0 md:bottom-8 right-0 md:right-8 w-full md:w-[450px] h-[100dvh] md:h-[650px] md:max-h-[85vh] glass-card rounded-none md:rounded-[40px] flex flex-col overflow-hidden shadow-2xl border-0 md:border md:border-emerald-500/20 transition-all duration-500 md:origin-bottom-right ${isChatOpen ? 'translate-y-0 opacity-100' : 'translate-y-full md:translate-y-10 opacity-0 md:scale-90 pointer-events-none'}`}>
            {/* Header */}
            <div className="bg-[#0a0a0f] p-6 flex justify-between items-center border-b border-white/5 shrink-0 pt-[env(safe-area-inset-top)] md:pt-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-600/20 rounded-2xl flex items-center justify-center border border-emerald-500/30">
                        <MessageSquareMore size={24} className="text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="font-black text-white text-base tracking-tighter uppercase leading-none">Gadget Support</h3>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                           <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                           Retail Concierge
                        </p>
                    </div>
                </div>
                <button 
                  onClick={closeChat} 
                  className="p-2.5 bg-white/5 rounded-full transition text-gray-400 hover:text-white"
                >
                    <ChevronDown size={24} className="md:hidden" />
                    <X size={20} className="hidden md:block" />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6 bg-[#020617]/60 custom-scrollbar">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 md:gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                        <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 shadow-lg border ${
                            msg.role === 'user' 
                            ? 'bg-blue-600/20 text-blue-400 border-blue-500/30' 
                            : 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30'
                        }`}>
                            {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                        </div>
                        <div className={`max-w-[85%] p-4 md:p-5 rounded-[24px] md:rounded-[28px] ${
                            msg.role === 'user' 
                            ? 'bg-blue-600/10 text-white rounded-tr-none border border-blue-500/20 shadow-xl' 
                            : 'bg-[#0f172a]/90 text-gray-100 rounded-tl-none border border-white/5 shadow-2xl backdrop-blur-md'
                        }`}>
                            {msg.role === 'user' ? <p className="text-[13px] md:text-sm leading-relaxed">{msg.text}</p> : <MessageContent text={msg.text} />}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-center gap-3 text-gray-500 text-[10px] font-black uppercase tracking-widest ml-12 md:ml-14 animate-pulse">
                        <Loader2 size={16} className="animate-spin text-emerald-500" />
                        Analyzing Hardware...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-4 md:px-6 py-4 bg-[#0a0a0f]/80 flex gap-2 overflow-x-auto no-scrollbar border-t border-white/5">
                {[
                    { label: "Check Credit", icon: <Wallet size={12} />, text: "How much store credit do I have?" },
                    { label: "My Orders", icon: <Package size={12} />, text: "Show me my recent purchases and tracking." },
                    { label: "Latest Tech", icon: <Zap size={12} />, text: "What are the latest gadgets in stock?" },
                    { label: "Delivery Speed", icon: <Truck size={12} />, text: "How long does shipping take?" }
                ].map((act, i) => (
                    <button 
                        key={i}
                        onClick={() => { setInputText(act.text); }}
                        className="px-5 py-3 bg-white/5 border border-white/5 rounded-full text-[9px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30 transition-all flex items-center gap-2 active:scale-95"
                    >
                        {act.icon} {act.label}
                    </button>
                ))}
            </div>

            {/* Input Bar */}
            <div className="p-4 md:p-6 bg-[#0a0a0f] border-t border-white/5 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] md:pb-6">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-[24px] p-2 pl-6 focus-within:border-emerald-500/50 focus-within:bg-black/60 transition-all shadow-inner">
                    <input 
                        type="text" 
                        value={inputText} 
                        onChange={(e) => setInputText(e.target.value)} 
                        placeholder="Search gadgets or orders..." 
                        className="flex-1 bg-transparent text-white placeholder-gray-600 text-[13px] md:text-sm focus:outline-none py-3" 
                    />
                    <button 
                        type="submit" 
                        disabled={isLoading || !inputText.trim()} 
                        className="w-11 h-11 md:w-12 md:h-12 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl flex items-center justify-center text-white shadow-xl hover:shadow-emerald-500/20 active:scale-90 transition-all disabled:opacity-30 group shrink-0"
                    >
                        <Send size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                </form>
            </div>
        </div>
    );
};
