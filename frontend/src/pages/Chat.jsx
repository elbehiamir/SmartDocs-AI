import { useEffect, useRef, useState } from "react";

import {
  Menu,
  Sparkles,
  ShieldCheck,
  FileText,
  BrainCircuit,
  Zap,
  Plus
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import ChatMessage from "../components/ChatMessage";
import ChatInput from "../components/ChatInput";

import {
  sendMessage,
  uploadDocument
} from "../services/chatService";

import "../styles/Chat.css";

const suggestions = [
  {
    icon: FileText,
    title: "Summarize a document",
    description: "Get the key points from your PDF.",
    question: "Summarize the main points of my selected documents."
  },
  {
    icon: BrainCircuit,
    title: "Find specific information",
    description: "Search for important details.",
    question: "What are the most important facts in my selected documents?"
  },
  {
    icon: ShieldCheck,
    title: "Analyze security",
    description: "Identify security technologies.",
    question: "What security technologies are mentioned in my selected documents?"
  },
  {
    icon: Zap,
    title: "Explain a concept",
    description: "Understand technical concepts.",
    question: "Explain the main technical concepts in my selected documents."
  }
];

function createConversation() {
  return {
    id: Date.now() + Math.random(),
    title: "New conversation",
    messages: []
  };
}

export default function Chat() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("smartdocs-theme") || "dark"
  );

  const [conversations, setConversations] = useState([
    createConversation()
  ]);

  const [activeChat, setActiveChat] = useState(null);

  const [documents, setDocuments] = useState([]);

  // Selected PDF IDs
  const [selectedDocumentIds, setSelectedDocumentIds] = useState([]);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const currentChat =
    conversations.find(chat => chat.id === activeChat) ||
    conversations[0];

  useEffect(() => {
    if (currentChat && !activeChat) {
      setActiveChat(currentChat.id);
    }
  }, [currentChat, activeChat]);

  useEffect(() => {
    localStorage.setItem("smartdocs-theme", theme);
  }, [theme]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [currentChat?.messages, loading]);

  function toggleTheme() {
    setTheme(previous =>
      previous === "dark" ? "light" : "dark"
    );
  }

  function handleNewChat() {
    const newChat = createConversation();

    setConversations(previous => [
      newChat,
      ...previous
    ]);

    setActiveChat(newChat.id);
    setSidebarOpen(false);
    setStatus("");
  }

  function handleSelectChat(id) {
    setActiveChat(id);
    setSidebarOpen(false);
    setStatus("");
  }

  function handleDeleteChat(id) {
    setConversations(previous => {
      const updated = previous.filter(
        chat => chat.id !== id
      );

      if (updated.length === 0) {
        const newChat = createConversation();
        setActiveChat(newChat.id);
        return [newChat];
      }

      if (activeChat === id) {
        setActiveChat(updated[0].id);
      }

      return updated;
    });
  }

  function updateConversation(id, updater) {
    setConversations(previous =>
      previous.map(chat =>
        chat.id === id ? updater(chat) : chat
      )
    );
  }

  // Select or deselect one document
  function handleToggleDocument(documentId) {
    setSelectedDocumentIds(previous => {
      const alreadySelected = previous.includes(documentId);

      if (alreadySelected) {
        return previous.filter(id => id !== documentId);
      }

      return [...previous, documentId];
    });

    setStatus("");
  }

  // Select all uploaded documents
  function handleSelectAllDocuments() {
    const allIds = documents
      .map(doc => Number(doc.id))
      .filter(id => Number.isInteger(id) && id > 0);

    setSelectedDocumentIds(allIds);
    setStatus("");
  }

  // Deselect all documents
  function handleClearDocumentSelection() {
    setSelectedDocumentIds([]);
    setStatus("");
  }

  async function handleSend(question) {
    if (loading || !question.trim()) return;

    // Require at least one selected document
    if (selectedDocumentIds.length === 0) {
      setStatus(
        "Please select at least one document from the sidebar before asking a question."
      );
      return;
    }

    const selectedIds = [...selectedDocumentIds];

    let chatId = activeChat;

    if (!chatId) {
      const newChat = createConversation();
      chatId = newChat.id;

      setConversations(previous => [
        newChat,
        ...previous
      ]);

      setActiveChat(chatId);
    }

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: question.trim()
    };

    updateConversation(chatId, chat => ({
      ...chat,
      title:
        chat.messages.length === 0
          ? question.trim().slice(0, 35)
          : chat.title,
      messages: [...chat.messages, userMessage]
    }));

    setLoading(true);
    setStatus("");

    try {
      // Send question + selected document IDs
      const result = await sendMessage(
        question.trim(),
        selectedIds
      );

      if (!result.success) {
        throw new Error(
          result.message || "Unable to generate answer."
        );
      }

      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: result.answer,
        sources: result.sources || [],
        documentIds: selectedIds
      };

      updateConversation(chatId, chat => ({
        ...chat,
        messages: [
          ...chat.messages,
          assistantMessage
        ]
      }));

    } catch (error) {
      console.error("Chat request error:", error);

      updateConversation(chatId, chat => ({
        ...chat,
        messages: [
          ...chat.messages,
          {
            id: Date.now() + 2,
            role: "assistant",
            content:
              error.response?.data?.message ||
              error.message ||
              "Unable to connect to SmartDocs AI.",
            sources: []
          }
        ]
      }));

    } finally {
      setLoading(false);
    }
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  async function handleFileUpload(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    event.target.value = "";

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setStatus("Please select a PDF file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setStatus("Maximum PDF size is 10 MB.");
      return;
    }

    setUploading(true);
    setStatus(`Uploading ${file.name}...`);

    try {
      const result = await uploadDocument(file);

      if (!result.success) {
        throw new Error(result.message || "Upload failed");
      }

      const uploadedDocument = result.document;

      // The API must return the inserted document ID
      const documentId = Number(uploadedDocument?.id);

      if (!Number.isInteger(documentId) || documentId <= 0) {
        throw new Error(
          "Upload succeeded, but the server did not return a valid document ID."
        );
      }

      const documentName =
        uploadedDocument.originalName ||
        uploadedDocument.original_name ||
        file.name;

      // Add document to sidebar without duplicates
      setDocuments(previous => {
        const exists = previous.some(
          doc => Number(doc.id) === documentId
        );

        if (exists) return previous;

        return [
          {
            id: documentId,
            name: documentName
          },
          ...previous
        ];
      });

      // Automatically select the newly uploaded PDF
      setSelectedDocumentIds(previous => [
        ...new Set([...previous, documentId])
      ]);

      setStatus(
        `${file.name} uploaded successfully and selected for AI search.`
      );

    } catch (error) {
      console.error("Upload error:", error);

      setStatus(
        error.response?.data?.message ||
        error.message ||
        "Failed to upload document."
      );

    } finally {
      setUploading(false);
    }
  }

  const hasMessages =
    currentChat?.messages?.length > 0;

  return (
    <div className={`app-shell ${theme}`}>

      <Sidebar
        conversations={conversations}
        documents={documents}
        activeChat={activeChat}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onUpload={openFilePicker}
        onDeleteChat={handleDeleteChat}
        theme={theme}
        onToggleTheme={toggleTheme}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}

        selectedDocumentIds={selectedDocumentIds}
        onToggleDocument={handleToggleDocument}
        onSelectAllDocuments={handleSelectAllDocuments}
        onClearDocumentSelection={handleClearDocumentSelection}
      />

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="main-panel">

        {/* Topbar */}
        <header className="topbar">

          <div className="topbar-left">

            <button
              className="icon-button menu-button"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={21} />
            </button>

            <div className="breadcrumb">
              <span>Workspace</span>
              <span className="breadcrumb-divider">/</span>
              <strong>AI Assistant</strong>
            </div>

          </div>

          <div className="topbar-right">

            <div className="connection-status">
              <span className="online-dot" />
              <span>AI Engine</span>
            </div>

            <button
              className="topbar-new-chat"
              onClick={handleNewChat}
            >
              <Plus size={16} />
              New chat
            </button>

          </div>

        </header>

        {/* Chat area */}
        <section
          className={`chat-scroll-area ${
            hasMessages ? "has-messages" : ""
          }`}
        >

          {!hasMessages ? (

            <div className="welcome-container">

              <div className="welcome-icon">
                <Sparkles size={27} />
              </div>

              <div className="welcome-heading">

                <span className="welcome-eyebrow">
                  YOUR INTELLIGENT DOCUMENT ASSISTANT
                </span>

                <h1>
                  Ask your documents.
                  <br />
                  <span>Get intelligent answers.</span>
                </h1>

                <p>
                  Upload your documents and let SmartDocs AI
                  help you discover information, understand
                  complex topics and find answers faster.
                </p>

              </div>

              <div className="suggestions-grid">

                {suggestions.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <button
                      className="suggestion-card"
                      key={index}
                      onClick={() => handleSend(item.question)}
                      disabled={loading}
                    >
                      <div className="suggestion-icon">
                        <Icon size={19} />
                      </div>

                      <strong>{item.title}</strong>

                      <span>{item.description}</span>
                    </button>
                  );
                })}

              </div>

              {documents.length === 0 && (
                <div className="upload-prompt">

                  <div className="upload-prompt-icon">
                    <FileText size={21} />
                  </div>

                  <div className="upload-prompt-text">
                    <strong>Start with your documents</strong>
                    <span>
                      Upload a PDF to begin asking questions.
                    </span>
                  </div>

                  <button
                    className="upload-prompt-button"
                    onClick={openFilePicker}
                    disabled={uploading}
                  >
                    Upload PDF
                  </button>

                </div>
              )}

            </div>

          ) : (

            <div className="messages-container">

              {currentChat.messages.map(message => (
                <ChatMessage
                  key={message.id}
                  message={message}
                />
              ))}

              {loading && (
                <div className="message-row ai-row">

                  <div className="message-avatar ai-avatar">
                    <Sparkles size={18} />
                  </div>

                  <div className="message-content">

                    <div className="message-author">
                      SmartDocs AI
                      <span className="ai-label">
                        Thinking
                      </span>
                    </div>

                    <div className="typing-indicator">
                      <span />
                      <span />
                      <span />
                    </div>

                  </div>

                </div>
              )}

              <div ref={messagesEndRef} />

            </div>

          )}

        </section>

        {/* Input */}
        <footer className="chat-footer">

          {status && (
            <div className="status-message status-info">
              {status}
            </div>
          )}

          <ChatInput
            onSend={handleSend}
            onUpload={openFilePicker}
            loading={loading || uploading}
            disabled={false}
          />

        </footer>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          hidden
          onChange={handleFileUpload}
        />

      </main>
    </div>
  );
}