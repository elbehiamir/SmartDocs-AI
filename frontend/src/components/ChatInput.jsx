
import { useState } from "react";

import {
  ArrowUp,
  Paperclip,
  LoaderCircle
} from "lucide-react";

export default function ChatInput({
  onSend,
  onUpload,
  loading,
  disabled
}) {
  const [value, setValue] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    const question = value.trim();

    if (!question || loading || disabled) {
      return;
    }

    onSend(question);
    setValue("");
  }

  function handleKeyDown(event) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      handleSubmit(event);
    }
  }

  return (
    <div className="chat-input-wrapper">

      <form
        className="chat-input-box"
        onSubmit={handleSubmit}
      >

        <textarea
          value={value}
          onChange={event => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about your documents..."
          rows={1}
          disabled={loading || disabled}
        />

        <div className="input-toolbar">

          <button
            type="button"
            className="attach-button"
            onClick={onUpload}
            title="Upload PDF"
            disabled={loading}
          >
            <Paperclip size={18} />
            <span>Attach PDF</span>
          </button>

          <button
            type="submit"
            className="send-button"
            disabled={
              !value.trim() ||
              loading ||
              disabled
            }
          >
            {loading ? (
              <LoaderCircle
                size={19}
                className="spin"
              />
            ) : (
              <ArrowUp size={20} />
            )}
          </button>

        </div>
      </form>

      <p className="input-disclaimer">
        SmartDocs AI can make mistakes.
        Verify important information against your documents.
      </p>

    </div>
  );
}
