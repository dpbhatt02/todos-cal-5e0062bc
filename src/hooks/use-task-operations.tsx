
import { useState } from 'react';
import { useTaskCreate } from './task-operations/use-task-create';
import { useTaskUpdate } from './task-operations/use-task-update';
import { useTaskDelete } from './task-operations/use-task-delete';
import { useTaskSync } from './task-operations/use-task-sync';

export const useTaskOperations = (user: any) => {
  const { createTask, createLoading } = useTaskCreate(user);
  const { updateTask, updateLoading } = useTaskUpdate(user);
  const { deleteTask, deleteLoading } = useTaskDelete(user);
  const { syncTaskWithGoogleCalendar, deleteGoogleCalendarEvent, syncLoading } = useTaskSync();
  
  // Combine loading states
  const operationLoading = createLoading || updateLoading || deleteLoading || syncLoading;

  return {
    operationLoading,
    createTask,
    updateTask,
    deleteTask,
    syncTaskWithGoogleCalendar,
    deleteGoogleCalendarEvent
  };
};
