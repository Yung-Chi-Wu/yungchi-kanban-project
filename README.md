# NEXT PLAY GAMES - KANBAN SYSTEM
### A high-performance, visual task management solution for agile teams.

---

## 🚀 CORE FEATURES

### 📡 Real-time Collaboration
Powered by **Supabase (PostgreSQL)**, ensuring all task transitions and updates are synchronized instantly across sessions with zero data lag.

### 👥 Advanced User Management
A dedicated team module to create profiles with specific roles. Supports **Multi-Assignee** logic with an elegant **Stacked Avatar** layout on every task card.

### ⚡ Ghost-Card Preview
Industry-standard visual feedback. As you type in the panel, a **Ghost Card** appears in real-time within the Kanban columns, showing exactly how the task will look before you save it.

### 📊 Dynamic Column Statistics
Real-time task counters for each status column, providing an immediate overview of workload distribution and project velocity.

---

## 🛠️ TECHNICAL IMPLEMENTATION

### ⚛️ Vanilla Architecture
Built with **Pure JavaScript (ES6+)**. No heavy frameworks, resulting in a near-instant load time and smooth 60fps animations using custom CSS3 transitions and hardware-accelerated blurring.

### 💾 Hybrid Persistence
* **Global State**: Tasks and statuses are stored in Supabase with **Row Level Security (RLS)** for secure data isolation.
* **Local State**: Team configurations are persisted via `localStorage`, ensuring your custom team pool remains intact across sessions.

### 🧮 Smart Logic Patterns
* **Dirty Check Algorithm**: Intelligently detects unsaved changes by normalizing and sanitizing data strings, preventing accidental loss of work.
* **O(1) Search**: Client-side caching allows for instantaneous task filtering across the entire board without redundant API overhead.

---

## 📥 GETTING STARTED

### 1. Installation
Clone the repository to your local environment:
```bash
git clone [https://github.com/Yung-Chi-Wu/yungchi-kanban-project.git](https://github.com/Yung-Chi-Wu/yungchi-kanban-project.git)
```

### 2. Quick Start
Simply launch index.html via a local server (e.g., VS Code Live Server). The project is pre-configured with a Public Anon Key for immediate access.

---

## 📄 PROJECT GOVERNANCE
This system is designed for high-growth teams requiring a lightweight yet powerful tool to manage complex development workflows. Built with a focus on UI Responsiveness and Data Integrity.

Developed by Yung-Chi (Boston).