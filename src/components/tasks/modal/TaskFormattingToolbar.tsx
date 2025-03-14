
import { Bold, Italic, Underline, Link, List } from 'lucide-react';
import { ButtonCustom } from '@/components/ui/button-custom';

interface TextSelection {
  start: number;
  end: number;
  text: string;
}

interface TaskFormattingToolbarProps {
  textSelection: TextSelection;
  applyFormatting: (format: 'bold' | 'italic' | 'underline' | 'link' | 'list') => void;
}

const TaskFormattingToolbar = ({ textSelection, applyFormatting }: TaskFormattingToolbarProps) => {
  return (
    <div className="flex flex-wrap gap-1 mb-1">
      <ButtonCustom
        type="button"
        size="sm"
        variant={textSelection.text ? "outline" : "ghost"}
        className="h-8 px-2 text-xs"
        onClick={() => applyFormatting('bold')}
        disabled={!textSelection.text}
      >
        <Bold className="h-3.5 w-3.5" />
      </ButtonCustom>
      <ButtonCustom
        type="button"
        size="sm"
        variant={textSelection.text ? "outline" : "ghost"}
        className="h-8 px-2 text-xs"
        onClick={() => applyFormatting('italic')}
        disabled={!textSelection.text}
      >
        <Italic className="h-3.5 w-3.5" />
      </ButtonCustom>
      <ButtonCustom
        type="button"
        size="sm"
        variant={textSelection.text ? "outline" : "ghost"}
        className="h-8 px-2 text-xs"
        onClick={() => applyFormatting('underline')}
        disabled={!textSelection.text}
      >
        <Underline className="h-3.5 w-3.5" />
      </ButtonCustom>
      <ButtonCustom
        type="button"
        size="sm"
        variant={textSelection.text ? "outline" : "ghost"}
        className="h-8 px-2 text-xs"
        onClick={() => applyFormatting('link')}
        disabled={!textSelection.text}
      >
        <Link className="h-3.5 w-3.5" />
      </ButtonCustom>
      <ButtonCustom
        type="button"
        size="sm"
        variant={textSelection.text ? "outline" : "ghost"}
        className="h-8 px-2 text-xs"
        onClick={() => applyFormatting('list')}
        disabled={!textSelection.text}
      >
        <List className="h-3.5 w-3.5" />
      </ButtonCustom>
    </div>
  );
};

export default TaskFormattingToolbar;
