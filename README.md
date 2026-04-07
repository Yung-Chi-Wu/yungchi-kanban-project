🎮 Next Play Kanban Board
A lightweight, high-performance Kanban board built for the Next Play assessment. No frameworks, just pure Vanilla JavaScript and Supabase.

🚀 Key Features
Real-time Persistence: Uses Supabase (PostgreSQL) to sync tasks instantly. Your data stays put even after a page refresh.

Zero-Latency Search: Built a custom client-side filter to search through tasks instantly without extra API calls.

Custom Task Labels: Added a labeling system (Feature, Bug, Design, Urgent) with color-coding for better visual priority.

Interactive Drag-and-Drop: Integrated SortableJS for smooth task transitions between columns.

Input Validation: Prevented duplicate titles and empty inputs to keep the database clean.

🛠️ Tech Stack
Frontend: HTML5, CSS3, TailwindCSS

Backend: Supabase (Auth & Database)

Library: SortableJS

🧠 The "How" & "Why" (My Challenges)
1. The Session Bug
One of the biggest hurdles was realizing that a fresh page load would reset the anonymous session, making the previous tasks "disappear" because the User ID changed. I fixed this by implementing a check for existing sessions using supabase.auth.getSession() before triggering a new login. This ensures the user is always reconnected to their data.

2. Security with RLS
Even though this is an anonymous demo, I enabled Row Level Security (RLS) on Supabase. I wrote a policy (auth.uid() = user_id) so that users can only see and edit their own tasks. This keeps the data isolated and secure.

3. Performance over Laziness
Instead of calling the database every time the user types in the search bar, I cached the tasks in a local allTasks array. This makes the search feel "instant" and reduces unnecessary load on the backend.

📥 Getting Started
Clone the repo: git clone https://github.com/Yung-Chi-Wu/yungchi-kanban-project.git

Open index.html with Live Server.

Everything is pre-configured with a Public Anon Key for this demo.