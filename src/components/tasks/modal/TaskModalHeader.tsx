
import { X } from 'lucide-react';

interface TaskModalHeaderProps {
  title: string;
  onClose: () => void;
}

const TaskModalHeader = ({ title, onClose }: TaskModalHeaderProps) => {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b">
      <h2 className="text-lg font-semibold">{title}</h2>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
};

export default TaskModalHeader;
