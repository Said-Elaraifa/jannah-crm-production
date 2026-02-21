import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nyajfqdhybsmhlvwvguk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55YWpmcWRoeWJzbWhsdnd2Z3VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNjEzNzcsImV4cCI6MjA4NjkzNzM3N30.jz54grOktRoDiu2vkMf4LkMeZiyDPs-2EAKjkUx7DpY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
    // try to get 1 row
    const { data: team, error: err1 } = await supabase.from('team_members').select('*');
    console.log("Team:", team);
    if (err1) console.log(err1);
}
run();
