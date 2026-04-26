import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkUser(email: string) {
  // We can't query auth.users directly with anon key, 
  // but we can query public.profiles if the email is stored there or 
  // if we can at least see if a profile exists for a known email (though profiles usually use UUID).
  
  // Wait, I don't have the UUID. 
  // But searching for profile by full_name or other fields might work if they are unique.
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(10)
  
  console.log('Last 10 profiles:', data)
  if (error) console.error('Error fetching profiles:', error)
}

checkUser('oumarghadi95@gmail.com')
