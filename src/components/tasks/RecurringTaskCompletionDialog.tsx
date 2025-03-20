
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface RecurringTaskCompletionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteOnce: () => void;
  onCompleteForever: () => void;
  taskTitle: string;
}

const RecurringTaskCompletionDialog = ({
  isOpen,
  onClose,
  onCompleteOnce,
  onCompleteForever,
  taskTitle
}: RecurringTaskCompletionDialogProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Complete Recurring Task</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-medium">{taskTitle}</span> is a recurring task. What would you like to do?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onCompleteOnce}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Complete This Occurrence
          </AlertDialogAction>
          <AlertDialogAction 
            onClick={onCompleteForever}
            className="bg-red-600 hover:bg-red-700"
          >
            Complete Forever
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RecurringTaskCompletionDialog;
