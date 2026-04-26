-- 11 FIX: conversations/messages/contact_requests RLS + grants
-- Root cause:
-- 1. conversations had SELECT only, but the app also INSERTs and UPDATEs rows.
-- 2. messages had no UPDATE policy, while the inbox marks messages as read.
-- 3. explicit grants keep PostgREST access consistent for authenticated users.

GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT, INSERT, UPDATE ON public.conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.messages TO authenticated;
GRANT SELECT, INSERT ON public.contact_requests TO authenticated;

DROP POLICY IF EXISTS "Participants can create conversations" ON public.conversations;
CREATE POLICY "Participants can create conversations"
  ON public.conversations
  FOR INSERT
  WITH CHECK (auth.uid() = initiator_id);

DROP POLICY IF EXISTS "Participants can update conversations" ON public.conversations;
CREATE POLICY "Participants can update conversations"
  ON public.conversations
  FOR UPDATE
  USING (auth.uid() IN (initiator_id, receiver_id))
  WITH CHECK (auth.uid() IN (initiator_id, receiver_id));

DROP POLICY IF EXISTS "Participants can update messages" ON public.messages;
CREATE POLICY "Participants can update messages"
  ON public.messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.conversations
      WHERE conversations.id = messages.conversation_id
        AND auth.uid() IN (conversations.initiator_id, conversations.receiver_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.conversations
      WHERE conversations.id = messages.conversation_id
        AND auth.uid() IN (conversations.initiator_id, conversations.receiver_id)
    )
  );

DROP POLICY IF EXISTS "Participants can send messages" ON public.messages;
CREATE POLICY "Participants can send messages"
  ON public.messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1
      FROM public.conversations
      WHERE conversations.id = messages.conversation_id
        AND auth.uid() IN (conversations.initiator_id, conversations.receiver_id)
    )
  );
