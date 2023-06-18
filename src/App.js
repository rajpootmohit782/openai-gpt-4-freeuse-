import React, { useState, useRef, useEffect } from "react";
import "./styles.css";

function ChatGPT() {
  // const apiUrl = "process.env.REACT_APP_API_URL";
  const aaa = "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";
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: (
        <div className="message-content">
          <div className="capabilities">
            <h1>ChatGPT 3.5 turbo</h1>
            <h2>Capabilities</h2>
            <ul>
              <li>Remembers what the user said earlier in the conversation</li>
              <li>Allows the user to provide follow-up corrections</li>
              <li>Trained to decline inappropriate requests</li>
            </ul>
          </div>
          <div className="limitations">
            <h2>Limitations</h2>
            <ul>
              <li>May occasionally generate incorrect information</li>
              <li>Limited knowledge of the world and events</li>
            </ul>
          </div>
        </div>
      ),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListning, setIsListning] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [lastReceivedMessage, setLastReceivedMessage] = useState("");
  const chatHistoryRef = useRef(null);
  const recognition = new window.webkitSpeechRecognition(); // create a new instance of SpeechRecognition
  const handleVoiceInput = () => {
    setIsListning(true);
    recognition.start(); // start recording user's voice input
    recognition.onresult = (event) => {
      const userMessage = {
        role: "user",
        content: event.results[0][0].transcript,
      };
      setConversationHistory((prevHistory) => [...prevHistory, userMessage]);
      setInputValue(event.results[0][0].transcript);
    };
    recognition.onend = () => {
      setIsListning(false);
    };
  };
  const handleUserInput = async () => {
    setIsLoading(true);
    setConversationHistory((prevHistory) => [
      ...prevHistory,
      { role: "user", content: inputValue },
    ]);
    const formattedInput = inputValue
      .trim()
      .split("\n")
      .map((line, index) => (
        <div key={index} className="message user">
          {line}
        </div>
      ));
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: formattedInput },
    ]);
    setInputValue("");
    let val = [...conversationHistory, { role: "user", content: inputValue }];
    console.log(val);
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${aaa}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: val,
      }),
    });
    const data = await response.json();
    console.log(data);
    const output = data.choices[0].message.content;
    const formattedOutput = output.split("\n").map((line, index) => (
      <div key={index} className="message assistant">
        {line}
      </div>
    ));
    const botMessage = { role: "assistant", content: output };
    setConversationHistory((prevHistory) => [...prevHistory, botMessage]);
    // Update last received message state
    setLastReceivedMessage(botMessage.content);
    console.log(formattedOutput);
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "assistant", content: formattedOutput },
    ]);
    setIsLoading(false);
  };
  // Scroll to bottom of chat history container after messages are updated
  useEffect(() => {
    chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
  }, [messages]);
  return (
    <div className="chat-container">
      <div className="chat-history" ref={chatHistoryRef}>
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            {message.role === "assistant" && message.content}
            {message.role === "user" && (
              <div className="user-message-container">{message.content}</div>
            )}
          </div>
        ))}
      </div>
      <button
        className={`voice-button ${isListning ? "loading" : ""}`}
        onClick={handleVoiceInput}
      >
        {isListning
          ? "I am Listening plz speak..."
          : "Click to use Voice for Input"}
      </button>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyPress={(event) => {
            if (event.key === "Enter") {
              handleUserInput();
            }
          }}
        />
        {!isLoading && (
          <button className="send-button" onClick={handleUserInput}>
            Send
          </button>
        )}
        {isLoading && <div className="loading-spinner"></div>}
      </div>
    </div>
  );
}
export default ChatGPT;
