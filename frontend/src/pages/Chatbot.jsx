import { useState, useEffect, useRef } from "react";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const newMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: localStorage.getItem("userEmail"), query: input }),
      });

      const data = await response.json();
      console.log("Raw response from backend:", data);

      const botReply = { 
        text: data.answer || "🤖 Sorry, I couldn't understand that!", 
        sender: "bot" 
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (error) {
      console.error("Error fetching response:", error);
      setMessages((prev) => [...prev, { text: "❌ Server error! Please try again.", sender: "bot" }]);
    }

    setLoading(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center py-4 text-xl font-semibold shadow-lg">
        AI Chat Assistant 🤖
      </div>

      {/* Chat Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xs sm:max-w-md p-3 rounded-xl shadow-md text-white ${msg.sender === "user" ? "bg-blue-500" : "bg-purple-600"}`}>
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="max-w-xs sm:max-w-md p-3 rounded-xl shadow-md bg-purple-600 text-white">
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={chatRef}></div>
      </div>

      {/* Chat Input */}
      <div className="bg-white p-4 flex items-center border-t shadow-lg">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          disabled={loading}
        />
        <button 
          onClick={sendMessage} 
          className={`ml-3 px-6 py-3 rounded-lg text-white font-medium transition duration-300 ${
            loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-700"
          }`}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send 🚀"}
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
