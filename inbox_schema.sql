-- `messages` table for Omnichannel Inbox
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    channel TEXT NOT NULL, -- 'email', 'whatsapp', 'linkedin', 'instagram'
    direction TEXT NOT NULL, -- 'inbound', 'outbound'
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated users" ON messages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- realtime synchronization for instant chat updates
alter publication supabase_realtime add table messages;
