# 📚 Book Notes App

A simple web application to track and summarize books you've read. It allows you to add, edit, delete, and view books along with personal notes. Built using **Node.js**, **Express**, **EJS**, and **PostgreSQL**.

## 🚀 Features

- ✅ Add books with title, rating, read date, notes, and ISBN number
- 📝 Write and update summaries (notes) for each book
- 🔍 Sort books by Title, Newest, or Best (highest rating)
- 📷 Automatically fetch book cover images via ISBN
- ✏️ Edit and delete book entries
- 📁 Organized views using EJS templates

## 🧰 Tech Stack

- **Backend:** Node.js, Express
- **Frontend:** HTML/CSS (via EJS templates)
- **Database:** PostgreSQL
- **Templating Engine:** EJS
- **Dependencies:** body-parser, pg

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/book-notes-app.git
cd book-notes-app

2. Install Dependencies
npm install

3.Create a new database:
createdb books

4.Create required tables:
-- Connect to the database
psql books

-- Inside psql, run:
CREATE TABLE books_read (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  rating INTEGER,
  read_date DATE,
  short_notes TEXT,
  isbn_number TEXT
);

CREATE TABLE notes (
  id INTEGER PRIMARY KEY REFERENCES books_read(id),
  note TEXT
);
