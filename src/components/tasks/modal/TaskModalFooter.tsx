
import { ButtonCustom } from '@/components/ui/button-custom';

interface TaskModalFooterProps {
  onClose: () => void;
  isEditMode: boolean;
  isLoading?: boolean;
}

const TaskModalFooter = ({ onClose, isEditMode, isLoading = false }: TaskModalFooterProps) => {
  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    onClose();
  };

  return (
    <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-muted/30" >
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
        isLoading={isLoading}
      >
        {isEditMode ? 'Update Task' : 'Create Task'}
      </ButtonCustom>
    </div>
  );
};

export default TaskModalFooter;
