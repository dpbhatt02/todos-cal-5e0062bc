
import { ButtonCustom } from '@/components/ui/button-custom';

interface TaskModalFooterProps {
  onClose: () => void;
  isEditMode: boolean;
}

const TaskModalFooter = ({ onClose, isEditMode }: TaskModalFooterProps) => {
  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-muted/30" onClick={(e) => e.stopPropagation()}>
      <ButtonCustom 
        type="button" 
        variant="ghost" 
        onClick={handleCancel}
      >
        Cancel
      </ButtonCustom>
      <ButtonCustom 
        type="submit" 
        variant="primary"
        onClick={(e) => e.stopPropagation()}
      >
        {isEditMode ? 'Update Task' : 'Create Task'}
      </ButtonCustom>
    </div>
  );
};

export default TaskModalFooter;
