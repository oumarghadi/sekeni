-- 04 INTERACTIONS (FAVORITES, CHAT, CONTACT)

-- Favorites
CREATE TABLE IF NOT EXISTS public.favorites (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, listing_id)
);

-- Conversations
CREATE TABLE IF NOT EXISTS public.conversations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id uuid REFERENCES public.listings(id) ON DELETE SET NULL,
    initiator_id uuid NOT NULL REFERENCES public.profiles(id),
    receiver_id uuid NOT NULL REFERENCES public.profiles(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Messages
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id uuid NOT NULL REFERENCES public.profiles(id),
    body text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Contact Requests
CREATE TABLE IF NOT EXISTS public.contact_requests (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id uuid NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    requester_id uuid NOT NULL REFERENCES public.profiles(id),
    owner_id uuid NOT NULL REFERENCES public.profiles(id),
    message text,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'closed')),
    created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage own favorites" ON public.favorites FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Participants can view conversations" ON public.conversations FOR SELECT USING (auth.uid() IN (initiator_id, receiver_id));
CREATE POLICY "Participants can view messages" ON public.messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.conversations WHERE id = conversation_id AND auth.uid() IN (initiator_id, receiver_id))
);
CREATE POLICY "Participants can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Parties can view contact requests" ON public.contact_requests FOR SELECT USING (auth.uid() IN (requester_id, owner_id));
CREATE POLICY "Requesters can create requests" ON public.contact_requests FOR INSERT WITH CHECK (auth.uid() = requester_id);
