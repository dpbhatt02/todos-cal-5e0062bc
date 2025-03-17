
import { useState } from 'react';
import { Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ButtonCustom } from '@/components/ui/button-custom';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TagsListProps {
  isSidebarOpen: boolean;
}

// This component is completely hidden as per user request
const TagsList = ({ isSidebarOpen }: TagsListProps) => {
  // Return null to hide the component
  return null;
};

export default TagsList;
