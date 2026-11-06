import {
  Plus,
  MessageSquare,
  FileText,
  Upload,
  PanelLeftClose,
  Bot,
  Sun,
  Moon,
  Trash2,
  CheckSquare,
  Square
} from "lucide-react";

export default function Sidebar({
  conversations,
  documents,
  activeChat,
  onNewChat,
  onSelectChat,
  onUpload,
  onDeleteChat,
  theme,
  onToggleTheme,
  isOpen,
  onClose,

  selectedDocumentIds,
  onToggleDocument,
  onSelectAllDocuments,
  onClearDocumentSelection
}) {
  const allSelected =
    documents.length > 0 &&
    documents.every(doc =>
      selectedDocumentIds.includes(Number(doc.id))
    );

  return (
    <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>

      {/* Logo */}
      <div className="sidebar-top">
        <div className="brand">
          <div className="brand-icon">
            <Bot size={23} />
          </div>

          <div>
            <h2>
              SmartDocs<span> AI</span>
            </h2>
            <small>Intelligent workspace</small>
          </div>
        </div>

        <button
          className="icon-button mobile-close"
          onClick={onClose}
        >
          <PanelLeftClose size={19} />
        </button>
      </div>

      {/* New Chat */}
      <button
        className="new-chat-button"
        onClick={onNewChat}
      >
        <Plus size={19} />
        <span>New chat</span>
      </button>

      {/* Navigation */}
      <div className="sidebar-section">
        <p className="section-label">WORKSPACE</p>

        <button className="nav-item active">
          <MessageSquare size={18} />
          <span>AI Assistant</span>
        </button>

        <button
          className="nav-item"
          onClick={onUpload}
        >
          <Upload size={18} />
          <span>Upload document</span>
        </button>
      </div>

      {/* Recent conversations */}
      <div className="sidebar-section history-section">
        <div className="section-heading">
          <p className="section-label">RECENT CHATS</p>
          <span>{conversations.length}</span>
        </div>

        <div className="sidebar-list">
          {conversations.length === 0 ? (
            <p className="sidebar-empty">
              No conversations yet
            </p>
          ) : (
            conversations.map(chat => (
              <div
                key={chat.id}
                className={`history-item ${
                  activeChat === chat.id ? "selected" : ""
                }`}
              >
                <button
                  className="history-select"
                  onClick={() => onSelectChat(chat.id)}
                  title={chat.title}
                >
                  <MessageSquare size={15} />
                  <span>{chat.title}</span>
                </button>

                <button
                  className="delete-chat"
                  onClick={() => onDeleteChat(chat.id)}
                  aria-label="Delete conversation"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Documents */}
      <div className="sidebar-section documents-section">

        <div className="section-heading">
          <p className="section-label">YOUR DOCUMENTS</p>
          <span>{documents.length}</span>
        </div>

        {/* Selection controls */}
        {documents.length > 0 && (
          <div className="document-selection-actions">

            <button
              type="button"
              onClick={
                allSelected
                  ? onClearDocumentSelection
                  : onSelectAllDocuments
              }
            >
              {allSelected ? (
                <CheckSquare size={14} />
              ) : (
                <Square size={14} />
              )}

              {allSelected ? "Deselect all" : "Select all"}
            </button>

            <span>
              {selectedDocumentIds.length} selected
            </span>

          </div>
        )}

        <div className="sidebar-list">
          {documents.length === 0 ? (
            <p className="sidebar-empty">
              No documents uploaded
            </p>
          ) : (
            documents.map((doc, index) => {
              const documentId = Number(doc.id);

              const isSelected =
                selectedDocumentIds.includes(documentId);

              return (
                <label
                  className={`document-item document-select-item ${
                    isSelected ? "document-selected" : ""
                  }`}
                  key={doc.id ?? `${doc.name}-${index}`}
                  title={doc.name}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleDocument(documentId)}
                  />

                  <FileText size={16} />

                  <span>{doc.name}</span>
                </label>
              );
            })
          )}
        </div>

        {documents.length > 0 && (
          <p className="document-selection-hint">
            Select the documents SmartDocs AI should use.
          </p>
        )}

      </div>

      {/* Bottom section */}
      <div className="sidebar-bottom">

        <button
          className="theme-button"
          onClick={onToggleTheme}
        >
          {theme === "dark" ? (
            <Sun size={18} />
          ) : (
            <Moon size={18} />
          )}

          <span>
            Switch to {theme === "dark" ? "Light" : "Dark"} mode
          </span>
        </button>

        <div className="profile">
          <div className="profile-avatar">S</div>

          <div className="profile-info">
            <strong>SmartDocs User</strong>
            <small>Personal workspace</small>
          </div>

          <span className="online-dot" />
        </div>

      </div>
    </aside>
  );
}