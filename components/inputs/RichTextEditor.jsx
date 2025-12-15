import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Quote,
} from "lucide-react";

/**
 * RichTextEditor Component
 * A powerful WYSIWYG editor for product descriptions with formatting capabilities
 */
export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Enter product description...",
}) {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
    insertUnorderedList: false,
    insertOrderedList: false,
  });

  // Update active format states based on cursor position
  const updateActiveFormats = useCallback(() => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strikeThrough: document.queryCommandState("strikeThrough"),
      justifyLeft: document.queryCommandState("justifyLeft"),
      justifyCenter: document.queryCommandState("justifyCenter"),
      justifyRight: document.queryCommandState("justifyRight"),
      insertUnorderedList: document.queryCommandState("insertUnorderedList"),
      insertOrderedList: document.queryCommandState("insertOrderedList"),
    });
  }, []);

  // Execute formatting command
  const execCommand = useCallback(
    (command, value = null) => {
      document.execCommand(command, false, value);
      editorRef.current?.focus();
      updateActiveFormats();
    },
    [updateActiveFormats]
  );

  // Insert heading
  const insertHeading = useCallback(
    (level) => {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        execCommand("formatBlock", `<h${level}>`);
      }
    },
    [execCommand]
  );

  // Handle input changes
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      updateActiveFormats();
    }
  }, [onChange, updateActiveFormats]);

  // Handle paste - strip formatting for cleaner paste
  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  }, []);

  // Update formats on selection change
  const handleMouseUp = useCallback(() => {
    updateActiveFormats();
  }, [updateActiveFormats]);

  const handleKeyUp = useCallback(() => {
    updateActiveFormats();
  }, [updateActiveFormats]);

  // Initialize content
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      const selection = window.getSelection();
      const range = selection?.rangeCount > 0 ? selection.getRangeAt(0) : null;
      const startOffset = range?.startOffset;

      editorRef.current.innerHTML = value;

      // Restore cursor position
      if (range && startOffset !== undefined) {
        try {
          const newRange = document.createRange();
          newRange.setStart(
            editorRef.current.firstChild || editorRef.current,
            Math.min(startOffset, editorRef.current.textContent.length)
          );
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        } catch (e) {
          // Ignore cursor restoration errors
        }
      }
    }
  }, [value]);

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <ToolbarButton
            onClick={() => execCommand("bold")}
            title="Bold (Ctrl+B)"
            isActive={activeFormats.bold}
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand("italic")}
            title="Italic (Ctrl+I)"
            isActive={activeFormats.italic}
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand("underline")}
            title="Underline (Ctrl+U)"
            isActive={activeFormats.underline}
          >
            <Underline className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand("strikeThrough")}
            title="Strikethrough"
            isActive={activeFormats.strikeThrough}
          >
            <Strikethrough className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <ToolbarButton
            onClick={() => insertHeading(2)}
            title="Heading (Large)"
          >
            <Heading2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => insertHeading(3)}
            title="Heading (Medium)"
          >
            <Heading3 className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* Alignment */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <ToolbarButton
            onClick={() => execCommand("justifyLeft")}
            title="Align Left"
            isActive={activeFormats.justifyLeft}
          >
            <AlignLeft className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand("justifyCenter")}
            title="Align Center"
            isActive={activeFormats.justifyCenter}
          >
            <AlignCenter className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand("justifyRight")}
            title="Align Right"
            isActive={activeFormats.justifyRight}
          >
            <AlignRight className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r border-gray-300 pr-2">
          <ToolbarButton
            onClick={() => execCommand("insertUnorderedList")}
            title="Bullet List"
            isActive={activeFormats.insertUnorderedList}
          >
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand("insertOrderedList")}
            title="Numbered List"
            isActive={activeFormats.insertOrderedList}
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* Other */}
        <div className="flex gap-1">
          <ToolbarButton
            onClick={() => {
              const url = prompt("Enter URL:");
              if (url) execCommand("createLink", url);
            }}
            title="Insert Link"
          >
            <LinkIcon className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand("formatBlock", "<blockquote>")}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </ToolbarButton>
        </div>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        onMouseUp={handleMouseUp}
        onKeyUp={handleKeyUp}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        data-placeholder={placeholder}
        className={`min-h-[200px] max-h-[400px] overflow-y-auto p-4 outline-none prose prose-sm max-w-none ${
          isFocused ? "ring-2 ring-orange-500 ring-inset" : ""
        }`}
        style={{
          wordWrap: "break-word",
          overflowWrap: "break-word",
        }}
      />

      {/* Character count */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 text-xs text-gray-500">
        {editorRef.current?.textContent?.length || 0} characters
      </div>
    </div>
  );
}

function ToolbarButton({ onClick, title, children, isActive = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded transition-colors ${
        isActive
          ? "bg-orange-500 text-white hover:bg-orange-600"
          : "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
      }`}
    >
      {children}
    </button>
  );
}

// Add CSS for placeholder styling
const style = document.createElement("style");
style.textContent = `
  [contenteditable][data-placeholder]:empty:before {
    content: attr(data-placeholder);
    color: #9CA3AF;
    pointer-events: none;
  }
  
  /* Style the editor content */
  [contenteditable] h2 {
    font-size: 1.5em;
    font-weight: 600;
    margin-top: 1em;
    margin-bottom: 0.5em;
  }
  
  [contenteditable] h3 {
    font-size: 1.25em;
    font-weight: 600;
    margin-top: 0.8em;
    margin-bottom: 0.4em;
  }
  
  [contenteditable] p {
    margin-bottom: 0.75em;
  }
  
  [contenteditable] ul,
  [contenteditable] ol {
    margin-left: 1.5em;
    margin-bottom: 0.75em;
  }
  
  [contenteditable] blockquote {
    border-left: 4px solid #F97316;
    padding-left: 1em;
    margin-left: 0;
    margin-bottom: 0.75em;
    font-style: italic;
    color: #6B7280;
  }
  
  [contenteditable] a {
    color: #F97316;
    text-decoration: underline;
  }
  
  [contenteditable] strong {
    font-weight: 600;
  }
  
  [contenteditable] em {
    font-style: italic;
  }
`;
document.head.appendChild(style);
