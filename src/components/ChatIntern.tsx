import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserDisplayName } from '@/hooks/useUserDisplayName';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Smile, Edit2, Trash2, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ChatMessage {
  id: string;
  user_id: string;
  user_email: string;
  display_name: string;
  message: string;
  created_at: string;
}

export const ChatIntern = () => {
  const { user } = useAuth();
  const { displayName } = useUserDisplayName();
  const { isAdmin } = useAdmin();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          setMessages((current) => [...current, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-au putut încărca mesajele',
        variant: 'destructive',
      });
      return;
    }

    setMessages(data || []);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    setLoading(true);

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        user_email: user.email || 'Utilizator',
        display_name: displayName,
        message: newMessage.trim(),
      });

    if (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut trimite mesajul',
        variant: 'destructive',
      });
    } else {
      setNewMessage('');
    }

    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const startEdit = (messageId: string, currentText: string) => {
    setEditingId(messageId);
    setEditText(currentText);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const saveEdit = async (messageId: string) => {
    if (!editText.trim()) return;

    const { error } = await supabase
      .from('chat_messages')
      .update({ message: editText.trim() })
      .eq('id', messageId);

    if (error) {
      console.error('Error updating message:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut actualiza mesajul',
        variant: 'destructive',
      });
    } else {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, message: editText.trim() } : msg
        )
      );
      cancelEdit();
      toast({
        title: 'Succes',
        description: 'Mesaj actualizat',
      });
    }
  };

  const confirmDelete = (messageId: string) => {
    setMessageToDelete(messageId);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!messageToDelete) return;

    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('id', messageToDelete);

    if (error) {
      console.error('Error deleting message:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut șterge mesajul',
        variant: 'destructive',
      });
    } else {
      setMessages((prev) => prev.filter((msg) => msg.id !== messageToDelete));
      toast({
        title: 'Succes',
        description: 'Mesaj șters',
      });
    }

    setDeleteDialogOpen(false);
    setMessageToDelete(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-white">
      <Card className="flex-1 flex flex-col p-4 bg-white border border-black">
        <ScrollArea className="flex-1 pr-4 mb-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.user_id === user?.id ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    msg.user_id === user?.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-xs font-semibold mb-1">{msg.display_name}</p>
                  
                  {editingId === msg.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="text-sm min-h-[60px]"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => saveEdit(msg.id)}
                          className="h-7"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Salvează
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEdit}
                          className="h-7"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Anulează
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs opacity-70">
                          {formatDistanceToNow(new Date(msg.created_at), {
                            addSuffix: true,
                            locale: ro,
                          })}
                        </p>
                        {(msg.user_id === user?.id || isAdmin) && (
                          <div className="flex gap-1 ml-2">
                            {msg.user_id === user?.id && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => startEdit(msg.id, msg.message)}
                                className="h-6 w-6 p-0"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => confirmDelete(msg.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Scrie un mesaj..."
            className="resize-none border border-black"
            rows={2}
          />
          <div className="flex flex-col gap-2 border border-black rounded-md p-1">
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-0" align="end">
                <EmojiPicker onEmojiClick={handleEmojiClick} width={280} height={350} />
              </PopoverContent>
            </Popover>
            
            <Button
              onClick={handleSendMessage}
              disabled={loading || !newMessage.trim()}
              size="icon"
              className="h-10 w-10"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmare ștergere</AlertDialogTitle>
            <AlertDialogDescription>
              Ești sigur că vrei să ștergi acest mesaj? Această acțiune nu poate fi anulată.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Șterge</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
