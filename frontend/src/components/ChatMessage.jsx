
import { useState } from "react";

import {
  Bot,
  User,
  Copy,
  Check
} from "lucide-react";

export default function ChatMessage({ message }) {
  const [copied, setCopied] = useState(false);

  const isUser = message.role === "user";

  async function copyAnswer() {
    try {
      await navigator.clipboard.writeText(message.content);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);

    } catch (error) {
      console.error("Copy error:", error);
    }
  }

  return (
    <article
      className={`message-row ${
        isUser ? "user-row" : "ai-row"
      }`}
    >
      {/* Avatar */}
      <div
        className={`message-avatar ${
          isUser ? "user-avatar" : "ai-avatar"
        }`}
      >
        {isUser ? (
          <User size={18} />
        ) : (
          <Bot size={19} />
        )}
      </div>

      {/* Message */}
      <div className="message-content">

        <div className="message-author">
          {isUser ? "You" : "SmartDocs AI"}

          {!isUser && (
            <span className="ai-label">
              AI Assistant
            </span>
          )}
        </div>

        <div className="message-text">
          {message.content}
        </div>

        {/* Copy button */}
        {!isUser && (
          <div className="message-actions">
            <button onClick={copyAnswer}>
              {copied ? (
                <Check size={15} />
              ) : (
                <Copy size={15} />
              )}

              <span>
                {copied ? "Copied" : "Copy"}
              </span>
            </button>
          </div>
        )}

      </div>
    </article>
  );
}
