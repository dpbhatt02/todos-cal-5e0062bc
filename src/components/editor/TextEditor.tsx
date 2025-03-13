
import React, { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Link, Heading1, Heading2, List, ListOrdered, Code } from 'lucide-react';
import { ButtonCustom } from '@/components/ui/button-custom';
import { cn } from '@/lib/utils';

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const TextEditor: React.FC<TextEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = "Add details about this task...",
  className 
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const linkInputRef = useRef<HTMLInputElement>(null);

  // Update the editor content when value prop changes
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // Save selection when user selects text
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      setSelection(sel);
      const hasText = sel.toString().length > 0;
      setShowToolbar(hasText);
      if (!hasText) {
        setShowLinkInput(false);
      }
    }
  };

  // Execute formatting command
  const executeCommand = (command: string, value: string | null = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Handle toolbar button click
  const handleFormatClick = (command: string) => {
    if (command === 'createLink') {
      setShowLinkInput(true);
      setTimeout(() => {
        linkInputRef.current?.focus();
      }, 100);
    } else {
      executeCommand(command);
    }
  };

  // Handle link insertion
  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selection) {
      // Restore the selection
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(selection.getRangeAt(0));
      }
      
      // Insert the link
      executeCommand('createLink', linkUrl);
    }
    
    // Reset link input state
    setLinkUrl('');
    setShowLinkInput(false);
  };

  // Handle content changes
  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className={cn("relative rounded-md border border-input", className)}>
      {showToolbar && (
        <div className="absolute top-0 left-0 transform -translate-y-full z-10 bg-gray-900 text-white rounded-t-md shadow-lg flex items-center">
          <ButtonCustom 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-white hover:bg-gray-800" 
            onClick={() => handleFormatClick('bold')}
            aria-label="Bold"
            icon={<Bold className="h-4 w-4" />}
          />
          
          <ButtonCustom 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-white hover:bg-gray-800" 
            onClick={() => handleFormatClick('italic')}
            aria-label="Italic"
            icon={<Italic className="h-4 w-4" />}
          />
          
          <ButtonCustom 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-white hover:bg-gray-800" 
            onClick={() => handleFormatClick('formatBlock', '<h1>')}
            aria-label="Heading 1"
            icon={<Heading1 className="h-4 w-4" />}
          />
          
          <ButtonCustom 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-white hover:bg-gray-800" 
            onClick={() => handleFormatClick('formatBlock', '<h2>')}
            aria-label="Heading 2"
            icon={<Heading2 className="h-4 w-4" />}
          />
          
          <ButtonCustom 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-white hover:bg-gray-800" 
            onClick={() => handleFormatClick('insertUnorderedList')}
            aria-label="Bulleted List"
            icon={<List className="h-4 w-4" />}
          />
          
          <ButtonCustom 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-white hover:bg-gray-800" 
            onClick={() => handleFormatClick('insertOrderedList')}
            aria-label="Numbered List"
            icon={<ListOrdered className="h-4 w-4" />}
          />
          
          <ButtonCustom 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-white hover:bg-gray-800" 
            onClick={() => handleFormatClick('formatBlock', '<pre>')}
            aria-label="Code Block"
            icon={<Code className="h-4 w-4" />}
          />
          
          <div className="w-px h-6 bg-gray-700 mx-1" />
          
          <ButtonCustom 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-white hover:bg-gray-800" 
            onClick={() => handleFormatClick('createLink')}
            aria-label="Insert Link"
            icon={<Link className="h-4 w-4" />}
          />
          
          {showLinkInput && (
            <form onSubmit={handleLinkSubmit} className="flex items-center ml-1 mr-2 bg-gray-800 rounded-sm overflow-hidden">
              <input
                ref={linkInputRef}
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="h-7 px-2 py-1 text-xs bg-gray-800 border-0 focus:ring-0 focus:outline-none"
                required
              />
              <button 
                type="submit" 
                className="px-2 h-7 text-xs bg-gray-700 hover:bg-gray-600"
              >
                Add
              </button>
            </form>
          )}
        </div>
      )}
      
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[80px] w-full rounded-md px-3 py-2 text-sm focus:outline-none"
        onInput={handleInput}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
        dangerouslySetInnerHTML={{ __html: value }}
        placeholder={placeholder}
      />
    </div>
  );
};

export default TextEditor;
