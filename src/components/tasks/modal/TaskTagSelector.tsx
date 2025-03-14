
import { Label } from '@/components/ui/label';

interface Tag {
  id: string;
  label: string;
}

interface TaskTagSelectorProps {
  availableTags: Tag[];
  selectedTags: string[];
  onToggleTag: (tagId: string) => void;
}

const TaskTagSelector = ({ availableTags, selectedTags, onToggleTag }: TaskTagSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label>Tags</Label>
      <div className="flex flex-wrap gap-2">
        {availableTags.map(tag => (
          <button
            key={tag.id}
            type="button"
            onClick={(e) => {
              onToggleTag(tag.id);
            }}
            className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
              selectedTags.includes(tag.id)
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/70 hover:bg-muted'
            }`}
          >
            {tag.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TaskTagSelector;
