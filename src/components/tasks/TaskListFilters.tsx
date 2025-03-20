
import React from 'react';
import { Filter, ChevronDown, ArrowDownAZ, ArrowUpAZ, Move, RefreshCw, Plus } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ButtonCustom } from '@/components/ui/button-custom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TaskListFiltersProps {
  viewOption: string;
  sortOption: string;
  setViewOption: (option: string) => void;
  setSortOption: (option: string) => void;
  onCreateTask: () => void;
  onSyncCalendar: () => void;
  syncing: boolean;
  isCalendarConnected: boolean;
}

const TaskListFilters = ({ 
  viewOption, 
  sortOption, 
  setViewOption, 
  setSortOption,
  onCreateTask,
  onSyncCalendar,
  syncing,
  isCalendarConnected
}: TaskListFiltersProps) => {
  const isMobile = useIsMobile();

  // Get the filter icon based on current view option
  const getFilterIcon = () => (
    <Filter className="h-4 w-4 mr-1" />
  );

  // Get the sort icon based on current sort option
  const getSortIcon = () => {
    if (sortOption === 'date') return <ArrowDownAZ className="h-4 w-4 mr-1" />;
    if (sortOption === 'priority') return <ArrowUpAZ className="h-4 w-4 mr-1" />;
    return <Move className="h-4 w-4 mr-1" />;
  };

  return (
    <div className="mb-6 flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
      <h1 className="text-2xl font-semibold">Tasks</h1>
      
      <div className="flex flex-wrap gap-2 justify-between sm:justify-end">
        {/* Filter Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {isMobile ? (
              <ButtonCustom 
                variant="outline" 
                className="flex items-center px-2"
                icon={getFilterIcon()}
              >
                <ChevronDown className="h-4 w-4 ml-1" />
              </ButtonCustom>
            ) : (
              <ButtonCustom 
                variant="outline" 
                className="flex items-center gap-1"
                icon={getFilterIcon()}
              >
                {viewOption === 'all' ? 'All Tasks' : 
                 viewOption === 'active' ? 'Active Tasks' : 'Completed Tasks'}
                <ChevronDown className="h-4 w-4 ml-1" />
              </ButtonCustom>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setViewOption('all')}>
              All Tasks
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setViewOption('active')}>
              Active Tasks
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setViewOption('completed')}>
              Completed Tasks
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Sort Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {isMobile ? (
              <ButtonCustom 
                variant="outline" 
                className="flex items-center px-2"
                icon={getSortIcon()}
              >
                <ChevronDown className="h-4 w-4 ml-1" />
              </ButtonCustom>
            ) : (
              <ButtonCustom 
                variant="outline" 
                className="flex items-center gap-1"
                icon={getSortIcon()}
              >
                {sortOption === 'date' ? 'Sort by Time' : 
                 sortOption === 'priority' ? 'Sort by Priority' : 
                 'Custom Order'}
                <ChevronDown className="h-4 w-4 ml-1" />
              </ButtonCustom>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSortOption('date')}>
              Sort by Time
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortOption('priority')}>
              Sort by Priority
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortOption('custom')}>
              Custom Order
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sync Calendar Button - Only show if calendar is connected */}
        {isCalendarConnected && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <ButtonCustom
                  variant="outline"
                  size="sm"
                  icon={<RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />}
                  onClick={onSyncCalendar}
                  disabled={syncing}
                >
                  {isMobile ? "" : "Sync Calendar"}
                </ButtonCustom>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sync with Google Calendar</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* New Task Button */}
        <ButtonCustom
          variant="primary"
          size="sm"
          icon={<Plus className="h-4 w-4" />}
          onClick={onCreateTask}
        >
          New Task
        </ButtonCustom>
      </div>
    </div>
  );
};

export default TaskListFilters;
