
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Tag {
  id: string;
  name: string;
  color: string;
}

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  // Fetch tags
  useEffect(() => {
    if (!user) {
      setTags([]);
      setLoading(false);
      return;
    }

    const fetchTags = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('tags')
          .select('*')
          .order('name');

        if (error) {
          throw new Error(error.message);
        }

        setTags(data);
      } catch (err) {
        console.error('Error fetching tags:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch tags'));
      } finally {
        setLoading(false);
      }
    };

    fetchTags();

    // Set up real-time subscription
    const channel = supabase
      .channel('tags-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'tags',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          console.log('Tag change received!', payload);
          if (payload.eventType === 'INSERT') {
            setTags(prev => [...prev, payload.new as Tag]);
          } else if (payload.eventType === 'UPDATE') {
            setTags(prev => prev.map(tag => 
              tag.id === payload.new.id ? (payload.new as Tag) : tag
            ));
          } else if (payload.eventType === 'DELETE') {
            setTags(prev => prev.filter(tag => tag.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Create a new tag
  const createTag = async (name: string, color: string) => {
    if (!user) {
      toast.error('You must be logged in to create tags');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('tags')
        .insert([{
          user_id: user.id,
          name,
          color,
        }])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Tag created successfully');
      return data as Tag;
    } catch (err) {
      console.error('Error creating tag:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to create tag');
      return null;
    }
  };

  // Update a tag
  const updateTag = async (id: string, updates: Partial<Omit<Tag, 'id'>>) => {
    if (!user) {
      toast.error('You must be logged in to update tags');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('tags')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as Tag;
    } catch (err) {
      console.error('Error updating tag:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to update tag');
      return null;
    }
  };

  // Delete a tag
  const deleteTag = async (id: string) => {
    if (!user) {
      toast.error('You must be logged in to delete tags');
      return false;
    }

    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      toast.success('Tag deleted successfully');
      return true;
    } catch (err) {
      console.error('Error deleting tag:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete tag');
      return false;
    }
  };

  // Get task tags
  const getTaskTags = async (taskId: string) => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('task_tags')
        .select(`
          tag_id,
          tags:tag_id (
            id,
            name,
            color
          )
        `)
        .eq('task_id', taskId);

      if (error) {
        throw new Error(error.message);
      }

      return data.map(item => item.tags) as Tag[];
    } catch (err) {
      console.error('Error getting task tags:', err);
      return [];
    }
  };

  // Add tag to task
  const addTagToTask = async (taskId: string, tagId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('task_tags')
        .insert([{
          task_id: taskId,
          tag_id: tagId
        }]);

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (err) {
      console.error('Error adding tag to task:', err);
      return false;
    }
  };

  // Remove tag from task
  const removeTagFromTask = async (taskId: string, tagId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('task_tags')
        .delete()
        .eq('task_id', taskId)
        .eq('tag_id', tagId);

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (err) {
      console.error('Error removing tag from task:', err);
      return false;
    }
  };

  return {
    tags,
    loading,
    error,
    createTag,
    updateTag,
    deleteTag,
    getTaskTags,
    addTagToTask,
    removeTagFromTask
  };
}
