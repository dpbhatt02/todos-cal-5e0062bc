
import { Search } from 'lucide-react';
import { ButtonCustom } from '@/components/ui/button-custom';

interface SearchBarProps {
  isSidebarOpen: boolean;
  handleSearchClick: () => void;
}

const SearchBar = ({ isSidebarOpen, handleSearchClick }: SearchBarProps) => {
  return (
    <>
      {isSidebarOpen ? (
        <div className="w-full transition-all duration-300 ease-in-out mb-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              className="w-full h-10 pl-9 pr-4 rounded-md bg-muted/50 border border-border/50 focus:border-primary/30 focus:ring-4 focus:ring-primary/10 transition-all duration-200 text-sm outline-none"
            />
          </div>
        </div>
      ) : (
        <div className="flex justify-center mb-3">
          <ButtonCustom
            variant="ghost"
            size="icon"
            className="w-10 h-10 rounded-full hover:bg-muted"
            icon={<Search className="h-5 w-5" />}
            onClick={handleSearchClick}
            aria-label="Search tasks"
          />
        </div>
      )}
    </>
  );
};

export default SearchBar;
