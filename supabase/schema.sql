-- Users (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  travel_style TEXT CHECK (travel_style IN ('adventure','leisure','cultural','budget')),
  interests TEXT[],
  home_city TEXT,
  is_kyc_verified BOOLEAN DEFAULT FALSE,
  is_solo_female_traveler BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trips
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  group_size INT DEFAULT 1,
  trip_type TEXT CHECK (trip_type IN ('open','private','invite-only')),
  budget_range TEXT,
  travel_style TEXT,
  description TEXT,
  cover_image_url TEXT,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning','active','completed','cancelled')),
  is_public BOOLEAN DEFAULT TRUE,
  share_token TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trip Members
CREATE TABLE trip_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  role TEXT CHECK (role IN ('creator','member','pending')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trip_id, user_id)
);

-- Itinerary Days
CREATE TABLE itinerary_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  date DATE,
  destination TEXT,
  theme TEXT,
  travel_note TEXT,
  estimated_cost INT DEFAULT 0,
  sort_order INT DEFAULT 0
);

-- Activities
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id UUID REFERENCES itinerary_days(id) ON DELETE CASCADE,
  slot TEXT CHECK (slot IN ('morning','afternoon','evening','any')),
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  estimated_cost INT DEFAULT 0,
  category TEXT,
  booking_required BOOLEAN DEFAULT FALSE,
  tips TEXT,
  is_ai_suggested BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0
);

-- Budget Entries
CREATE TABLE budget_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  category TEXT,
  description TEXT,
  amount INT NOT NULL,
  entry_date DATE,
  added_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages (realtime)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id),  -- NULL for DMs
  sender_id UUID REFERENCES profiles(id),
  receiver_id UUID REFERENCES profiles(id),  -- NULL for group
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies (example)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (id = auth.uid());

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own trips" ON trips FOR SELECT USING (creator_id = auth.uid() OR is_public = TRUE);
CREATE POLICY "Only creator can update" ON trips FOR UPDATE USING (creator_id = auth.uid());
CREATE POLICY "Users can insert own trips" ON trips FOR INSERT WITH CHECK (creator_id = auth.uid());
CREATE POLICY "Creator can delete trip" ON trips FOR DELETE USING (creator_id = auth.uid());

ALTER TABLE trip_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members viewable if trip public or user is member" ON trip_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM trips WHERE id = trip_members.trip_id AND (is_public = TRUE OR creator_id = auth.uid()))
  OR user_id = auth.uid()
);
CREATE POLICY "Creator can manage members" ON trip_members FOR ALL USING (
  EXISTS (SELECT 1 FROM trips WHERE id = trip_members.trip_id AND creator_id = auth.uid())
);

ALTER TABLE itinerary_days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Viewable if trip is public or user is member" ON itinerary_days FOR SELECT USING (
  EXISTS (SELECT 1 FROM trips WHERE id = itinerary_days.trip_id AND (is_public = TRUE OR creator_id = auth.uid()))
);
CREATE POLICY "Editable by creator" ON itinerary_days FOR ALL USING (
  EXISTS (SELECT 1 FROM trips WHERE id = itinerary_days.trip_id AND creator_id = auth.uid())
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Viewable if trip is public or user is member" ON activities FOR SELECT USING (
  EXISTS (SELECT 1 FROM itinerary_days JOIN trips ON itinerary_days.trip_id = trips.id WHERE itinerary_days.id = activities.day_id AND (trips.is_public = TRUE OR trips.creator_id = auth.uid()))
);
CREATE POLICY "Editable by creator" ON activities FOR ALL USING (
  EXISTS (SELECT 1 FROM itinerary_days JOIN trips ON itinerary_days.trip_id = trips.id WHERE itinerary_days.id = activities.day_id AND trips.creator_id = auth.uid())
);

ALTER TABLE budget_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Viewable by members" ON budget_entries FOR SELECT USING (
  EXISTS (SELECT 1 FROM trips WHERE id = budget_entries.trip_id AND (creator_id = auth.uid() OR EXISTS (SELECT 1 FROM trip_members WHERE trip_id = budget_entries.trip_id AND user_id = auth.uid())))
);
CREATE POLICY "Editable by members" ON budget_entries FOR ALL USING (
  EXISTS (SELECT 1 FROM trips WHERE id = budget_entries.trip_id AND (creator_id = auth.uid() OR EXISTS (SELECT 1 FROM trip_members WHERE trip_id = budget_entries.trip_id AND user_id = auth.uid())))
);
