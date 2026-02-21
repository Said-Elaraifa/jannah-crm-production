import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nyajfqdhybsmhlvwvguk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55YWpmcWRoeWJzbWhsdnd2Z3VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNjEzNzcsImV4cCI6MjA4NjkzNzM3N30.jz54grOktRoDiu2vkMf4LkMeZiyDPs-2EAKjkUx7DpY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
    const { data, error } = await supabase.from('team_members').insert([
        {
            name: "Jessy",
            role: "COO / Directeur Adjoint",
            initial: "J",
            color: "bg-purple-500",
            text_color: "text-white",
            access_level: "Admin",
            email: "jessy@jannah.co",
            status: "Active"
        }
    ]);
    if (error) console.error("Error:", error);
    else console.log("Success", data);
}
run();
