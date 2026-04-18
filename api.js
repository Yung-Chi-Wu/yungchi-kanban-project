const SUPABASE_URL = 'https://argmcmvtxkiokywnacsd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyZ21jbXZ0eGtpb2t5d25hY3NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5OTM2NTEsImV4cCI6MjA5MDU2OTY1MX0.bMd5_0veGnfCbRyK5fXK59xicFpdmYniu_CYP4zkXjM';

const { createClient } = supabase;
const _db = createClient(SUPABASE_URL, SUPABASE_KEY);

const API = {
    async init() {
        // init anonymous user
        const { data: { session } } = await _db.auth.getSession();

        if (session) {
            // console.log("Welcome back! Existing User ID:", session.user.id);
            return session.user;
        }
        // console.log("No session found. Signing in as new guest...");
        const { data, error } = await _db.auth.signInAnonymously();
        if (error) throw error;

        return data.user;
    },

    async getTasks() {
        const { data, error } = await _db
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false }); // new task in the front

        if (error) throw error;
        return data || [];
    },

    async update(id, updates) {
        const { data, error } = await _db
            .from('tasks')
            .update({
                title: updates.title,
                description: updates.description,
                status: updates.status,
                label: updates.label,
                priority: updates.priority,
                dueDate: updates.dueDate,
                assignee: updates.assignee
            })
            .eq('id', id)
            .select();

        if (error) throw error;
        return data[0];
    },

    async create(title, desc, label, status = 'TODO', priority = 'Medium', dueDate = '', assignee = 'Anonymous') {
        const { data, error } = await _db
            .from('tasks')
            .insert([{
                title,
                description: desc,
                label: label,
                status: status,
                priority: priority,
                dueDate: dueDate,
                assignee: assignee
            }])
            .select();

        if (error) throw error;
        return data[0];
    },

    async delete(id) {
        const { error } = await _db
            .from('tasks')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async updateStatus(id, newStatus) {
        const { error } = await _db
            .from('tasks')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) throw error;
    }
};