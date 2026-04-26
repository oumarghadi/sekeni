'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { MessageSquare, Search, Send, Paperclip, Smile, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface Conversation {
  id: string;
  listing_id: string | null;
  updated_at: string;
  other_user: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  last_message: string | null;
  unread: boolean;
}

interface Message {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
  is_read: boolean;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  const diff = Math.floor((today.getTime() - date.getTime()) / 86400000);

  if (diff === 0) return 'اليوم';
  if (diff === 1) return 'أمس';

  return date.toLocaleDateString('fr-FR');
}

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const requestedConversationId = searchParams.get('conversation');

  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);
  const [hasSession, setHasSession] = React.useState<boolean | null>(null);
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [convsLoading, setConvsLoading] = React.useState(true);

  const [activeConv, setActiveConv] = React.useState<Conversation | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [msgsLoading, setMsgsLoading] = React.useState(false);

  const [newMessage, setNewMessage] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    async function load() {
      setConvsLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user;
      if (!user) {
        setHasSession(false);
        setCurrentUserId(null);
        setConversations([]);
        setActiveConv(null);
        setConvsLoading(false);
        return;
      }

      setHasSession(true);
      setCurrentUserId(user.id);

      const { data } = await supabase
        .from('conversations')
        .select(`
          id, listing_id, updated_at,
          initiator_id, receiver_id,
          initiator:profiles!conversations_initiator_id_fkey(id, full_name, avatar_url),
          receiver:profiles!conversations_receiver_id_fkey(id, full_name, avatar_url),
          messages(body, created_at, is_read, sender_id)
        `)
        .or(`initiator_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (data) {
        const convs: Conversation[] = (data as any[]).map((conversation) => {
          const isInitiator = conversation.initiator_id === user.id;
          const other = isInitiator ? conversation.receiver : conversation.initiator;
          const otherUser = Array.isArray(other) ? other[0] : other;
          const msgs: any[] = conversation.messages || [];
          const last = msgs.sort(
            (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0];
          const unread = msgs.some((message: any) => !message.is_read && message.sender_id !== user.id);

          return {
            id: conversation.id,
            listing_id: conversation.listing_id,
            updated_at: conversation.updated_at,
            other_user: otherUser || { id: '', full_name: 'مجهول', avatar_url: null },
            last_message: last?.body ?? null,
            unread,
          };
        });

        setConversations(convs);
        setActiveConv((previous) => {
          if (requestedConversationId) {
            return convs.find((conversation) => conversation.id === requestedConversationId) ?? convs[0] ?? null;
          }

          if (previous) {
            return convs.find((conversation) => conversation.id === previous.id) ?? convs[0] ?? null;
          }

          return convs[0] ?? null;
        });
      } else {
        setConversations([]);
        setActiveConv(null);
      }

      setConvsLoading(false);
    }

    load();
  }, [requestedConversationId]);

  React.useEffect(() => {
    if (!requestedConversationId || conversations.length === 0) return;

    const requestedConversation = conversations.find((conversation) => conversation.id === requestedConversationId);
    if (requestedConversation) {
      setActiveConv(requestedConversation);
    }
  }, [requestedConversationId, conversations]);

  React.useEffect(() => {
    if (!activeConv) return;

    setMsgsLoading(true);

    supabase
      .from('messages')
      .select('id, sender_id, body, created_at, is_read')
      .eq('conversation_id', activeConv.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setMessages((data as Message[]) || []);
        setMsgsLoading(false);

        if (currentUserId) {
          supabase
            .from('messages')
            .update({ is_read: true })
            .eq('conversation_id', activeConv.id)
            .neq('sender_id', currentUserId)
            .eq('is_read', false)
            .then(() => {
              setConversations((prev) =>
                prev.map((conversation) =>
                  conversation.id === activeConv.id ? { ...conversation, unread: false } : conversation
                )
              );
            });
        }
      });
  }, [activeConv, currentUserId]);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  React.useEffect(() => {
    if (!activeConv) return;

    const channel = supabase
      .channel(`messages:${activeConv.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${activeConv.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConv]);

  async function handleSend() {
    if (!newMessage.trim() || !activeConv || !currentUserId || sending) return;

    setSending(true);
    const body = newMessage.trim();
    setNewMessage('');

    await supabase.from('messages').insert({
      conversation_id: activeConv.id,
      sender_id: currentUserId,
      body,
    });

    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', activeConv.id);

    setSending(false);
  }

  const filteredConvs = conversations.filter(
    (conversation) =>
      conversation.other_user.full_name.includes(search) || (conversation.last_message ?? '').includes(search)
  );

  return (
    <div className="h-[calc(100vh-160px)] flex bg-white rounded-[3rem] shadow-sm border border-[var(--outline-variant)] overflow-hidden">
      <div className="w-80 border-l border-[var(--outline-variant)] flex flex-col shrink-0">
        <div className="p-6 border-b border-[var(--outline-variant)]">
          <h3 className="text-xl font-black text-[var(--primary)] mb-4">الرسائل</h3>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--on-surface-variant)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث..."
              className="w-full bg-[var(--surface-low)] border-none rounded-xl py-2 pr-10 pl-4 text-xs"
            />
          </div>
        </div>

        <div className="flex-grow overflow-y-auto divide-y divide-[var(--outline-variant)]">
          {convsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--secondary)]" />
            </div>
          ) : hasSession === false ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
              <MessageSquare className="w-10 h-10 text-[var(--on-surface-variant)]" />
              <p className="text-sm font-bold text-[var(--primary)]">سجل الدخول لعرض الرسائل</p>
              <p className="text-xs text-[var(--on-surface-variant)]">عند التواصل مع معلن ستظهر محادثتك هنا</p>
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
              <MessageSquare className="w-10 h-10 text-[var(--on-surface-variant)]" />
              <p className="text-sm font-bold text-[var(--primary)]">لا توجد محادثات بعد</p>
              <p className="text-xs text-[var(--on-surface-variant)]">عند التواصل مع معلن ستظهر محادثتك هنا</p>
            </div>
          ) : (
            filteredConvs.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setActiveConv(conversation)}
                className={cn(
                  'w-full p-5 hover:bg-[var(--surface-low)] cursor-pointer transition-all flex items-center gap-3 text-right',
                  activeConv?.id === conversation.id && 'bg-[var(--surface-low)] border-r-4 border-r-[var(--secondary)]'
                )}
              >
                <div className="w-11 h-11 rounded-full overflow-hidden bg-[var(--surface-high)] shrink-0 flex items-center justify-center text-[var(--primary)] font-black text-sm">
                  {conversation.other_user.avatar_url ? (
                    <img src={conversation.other_user.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    conversation.other_user.full_name?.charAt(0) ?? '؟'
                  )}
                </div>

                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-[10px] text-[var(--on-surface-variant)] whitespace-nowrap">
                      {formatDate(conversation.updated_at)}
                    </span>
                    <h4 className="text-sm font-bold text-[var(--primary)] truncate">
                      {conversation.other_user.full_name}
                    </h4>
                  </div>

                  <p className="text-[10px] text-[var(--on-surface-variant)] truncate text-right">
                    {conversation.last_message ?? 'لا توجد رسائل بعد'}
                  </p>
                </div>

                {conversation.unread && <div className="w-2 h-2 rounded-full bg-[var(--secondary)] shrink-0" />}
              </button>
            ))
          )}
        </div>
      </div>

      {!activeConv ? (
        <div className="flex-grow flex flex-col items-center justify-center gap-4 text-center bg-[var(--background)]/30">
          <MessageSquare className="w-16 h-16 text-[var(--on-surface-variant)]" />
          <p className="font-black text-[var(--primary)]">
            {hasSession === false ? 'سجل الدخول لبدء المحادثات' : 'اختر محادثة للبدء'}
          </p>
        </div>
      ) : (
        <div className="flex-grow flex flex-col bg-[var(--background)]/30">
          <div className="p-5 bg-white border-b border-[var(--outline-variant)] flex items-center gap-4">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--surface-low)] flex items-center justify-center text-[var(--primary)] font-black text-sm shrink-0">
              {activeConv.other_user.avatar_url ? (
                <img src={activeConv.other_user.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                activeConv.other_user.full_name?.charAt(0) ?? '؟'
              )}
            </div>
            <div>
              <h4 className="font-bold text-[var(--primary)] text-sm">{activeConv.other_user.full_name}</h4>
              <p className="text-[10px] text-[var(--on-surface-variant)]">محادثة مباشرة</p>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto p-6 space-y-4">
            {msgsLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-[var(--secondary)]" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <p className="text-sm text-[var(--on-surface-variant)]">لا توجد رسائل بعد. ابدأ المحادثة!</p>
              </div>
            ) : (
              <>
                {messages.map((message, index) => {
                  const isMine = message.sender_id === currentUserId;
                  const showDate =
                    index === 0 || formatDate(messages[index - 1].created_at) !== formatDate(message.created_at);

                  return (
                    <React.Fragment key={message.id}>
                      {showDate && (
                        <div className="flex justify-center">
                          <span className="px-3 py-1 bg-white rounded-full text-[10px] font-bold text-[var(--on-surface-variant)] border border-[var(--outline-variant)]">
                            {formatDate(message.created_at)}
                          </span>
                        </div>
                      )}

                      <div className={cn('flex gap-3 max-w-[75%]', isMine ? 'mr-auto flex-row-reverse' : '')}>
                        {!isMine && (
                          <div className="w-7 h-7 rounded-full bg-[var(--surface-low)] shrink-0 self-end flex items-center justify-center text-[var(--primary)] font-black text-[10px]">
                            {activeConv.other_user.full_name?.charAt(0) ?? '؟'}
                          </div>
                        )}

                        <div
                          className={cn(
                            'p-3 rounded-2xl text-sm leading-relaxed',
                            isMine
                              ? 'bg-[var(--primary)] text-white rounded-bl-none shadow-lg'
                              : 'bg-white text-[var(--primary)] rounded-br-none shadow-sm border border-[var(--outline-variant)]'
                          )}
                        >
                          {message.body}
                          <div
                            className={cn(
                              'text-[10px] mt-1',
                              isMine ? 'text-white/50 text-right' : 'text-[var(--on-surface-variant)] text-left'
                            )}
                          >
                            {formatTime(message.created_at)}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
                <div ref={bottomRef} />
              </>
            )}
          </div>

          <div className="p-5 bg-white border-t border-[var(--outline-variant)]">
            <div className="flex items-center gap-3 bg-[var(--surface-low)] rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-[var(--secondary)]/20 transition-all">
              <button className="text-[var(--on-surface-variant)] hover:text-[var(--primary)]">
                <Smile className="w-5 h-5" />
              </button>
              <button className="text-[var(--on-surface-variant)] hover:text-[var(--primary)] border-r border-[var(--outline-variant)] pr-3">
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="اكتب رسالتك هنا..."
                className="flex-grow bg-transparent border-none focus:ring-0 text-sm py-2 px-2"
              />
              <Button
                onClick={handleSend}
                disabled={!newMessage.trim() || sending}
                className="rounded-xl h-10 w-10 p-0 flex items-center justify-center shadow-md shrink-0"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
