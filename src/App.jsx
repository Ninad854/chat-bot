import { useEffect, useRef, useState } from "react";
import ChatbotIcon from "./components/chatbotIcon";
import ChatForm from "./components/ChatForm";
import ChatMessage from "./components/ChatMessage";
import { companyInfo } from "./companyInfo";

const App = () => {
  const [chatHistory, setChatHistory] = useState([{
    hideInChat: true,
    role: "model",
    text: companyInfo
  }]);
  const [showChatbot, setShowChatbot] = useState(false);
  const chatBodyRef = useRef();

  const generateBotResponse = async (history) => {
    const updateHistory = (text, isError = false) => {
      setChatHistory(prev => [...prev.filter(msg => msg.text !== "Thinking..."), {role:"model", text, isError}]);
    }
    history = history.map(({role, text}) => ({role, parts: [{text}]}))
    const requestOptions = {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({content: history})
    };
    try {
      const response = await fetch("http://localhost:3000/chat", requestOptions);
      const data = await response.json();
      if(!response.ok) throw new Error(data.error.message || "Something went wrong!");

      const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
      updateHistory(apiResponseText);
    } catch (error) {
      updateHistory(error.message, true);
    }
  };

  useEffect(() => {
    chatBodyRef.current.scrollTo({top: chatBodyRef.current.scrollHeight, behaviour: "smooth"}); 
  },[chatHistory]);

  return (
  <div className={`container ${showChatbot ? "show-chatbot" : ""}`}>
    <button onClick={() => setShowChatbot((prev) => !prev)} id="chatbot-toggler">
      <span className="material-symbols-rounded">mode_comment</span>
      <span className="material-symbols-rounded">close</span>
    </button>
    <div className="chatbot-popup">
      <div className="chat-header">
        <div className="header-info">
          <ChatbotIcon />         
          <h2 className="logo-text">Chatbot</h2>
        </div>
        <button onClick={() => setShowChatbot((prev) => !prev)} className="material-symbols-rounded">keyboard_arrow_down</button>
      </div>
      <div ref={chatBodyRef} className="chat-body">
        <div className="message bot-message">
          <ChatbotIcon />
          <p className="message-text">
            Hey there!! <br /> How can I help you today?
          </p>
        </div>
        {chatHistory.map((chat, index) => (
          <ChatMessage key ={index} chat={chat}/>
        ))}
        
      </div>
      <div className="chat-footer">
        <ChatForm chatHistory={chatHistory} setChatHistory = {setChatHistory} generateBotResponse={generateBotResponse}/>
      </div>
    </div>
  </div>
  )
};


export default App;