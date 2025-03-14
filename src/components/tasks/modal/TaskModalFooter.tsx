
import { ButtonCustom } from '@/components/ui/button-custom';

interface TaskModalFooterProps {
  onClose: () => void;
  isEditMode: boolean;
}

const TaskModalFooter = ({ onClose, isEditMode }: TaskModalFooterProps) => {
  return (
    <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-muted/30">
      <ButtonCustom 
        type="button" 
        variant="ghost" 
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        Cancel
      </ButtonCustom>
      <ButtonCustom 
        type="submit" 
        variant="primary"
      >
        {isEditMode ? 'Update Task' : 'Create Task'}
      </ButtonCustom>
    </div>
  );
};

export default TaskModalFooter;
