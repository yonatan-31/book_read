import express from "express";
import bodyParser from "body-parser";
import pg from "pg";


const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "books",
    password: "yonatan7525",
    port: 5432,
  });
db.connect();
  
const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


app.get("/", async(req,res)=>{
    const sort = req.query.sort;
    let query = "SELECT * FROM books_read";
    if(sort === "title"){
        query += " ORDER BY title ASC"
    }else if(sort === "newest"){
        query += " ORDER BY read_date DESC"
    }else if(sort === "best"){
        query += " ORDER BY rating DESC"  
    }else {
        query += " ORDER BY read_date DESC"; // default sort
    }
      try {
        const result = await db.query(query);
        const data = result.rows;
        
        const books_read = data.map((book) => {
          const formattedDate = new Date(book.read_date).toISOString().split("T")[0];
          return { ...book, read_date: formattedDate };
        });
        res.render("index.ejs", {
          books: books_read
        });
      } catch (err) {
        console.error(err);
        res.status(500).send('Error loading books');
      }
})

app.get("/post", (req,res)=>{
res.render("new.ejs")
})
//post a new book
app.post('/post', async (req, res) => {
    const { title, rating, read_date, short_notes, isbn_number } = req.body;

    try {
      await db.query(
        'INSERT INTO books_read (title, rating, read_date, short_notes, isbn_number) VALUES ($1, $2, $3, $4, $5)',
        [title, rating, read_date, short_notes, isbn_number]
      );
      res.redirect("/");
    } catch (err) {
      console.error(err);
      res.status(500).send('Error inserting book');
    }
});


app.post("/edit", async(req,res)=>{
    const editedBookId = req.body.book;
    const result = await db.query("SELECT * FROM books_read WHERE id = $1",[editedBookId]);
    console.log(result.rows)
    res.render("new.ejs", {
        toEdit: result.rows[0]
    })
})

app.post("/edited", async (req, res) => {
    const { id, title, rating, read_date, short_notes, isbn_number } = req.body;

    try {
        await db.query(`UPDATE books_read SET
                 title = $1,
                 rating = $2,
                 read_date = $3,
                 short_notes = $4,
                 isbn_number = $5
             WHERE id = $6`,
            [title, rating, read_date, short_notes, isbn_number, id]
        );

        res.redirect("/"); // or wherever you want to redirect after editing
    } catch (error) {
        console.error("Error updating book:", error);
        res.status(500).send("An error occurred while updating the book.");
    }
});

app.post("/delete", async(req,res)=>{
    const deleteBookId = req.body.book;
    try{
       await db.query("DELETE FROM books_read WHERE id= $1",[deleteBookId]);
       res.redirect("/")
    }catch (error) {
        console.error("Error deleting book:", error);
        res.status(500).send("An error occurred while deleting the book.");
    }
})


app.get("/note/:id", async (req, res) => {
  const bookId = req.params.id;

  try {
    const bookResult = await db.query("SELECT * FROM books_read WHERE id = $1", [bookId]);
    const book = bookResult.rows[0];

    const noteResult = await db.query("SELECT note FROM notes WHERE id = $1", [bookId]);
    const summary_note = noteResult.rows[0]?.note; // safely get the note if it exists

    res.render("note.ejs", { book, summary_note });
  } catch (error) {
    console.error("Error loading book ", error);
    res.status(500).send("Failed to load note.");
  }
});

app.post("/note/:id", async (req,res)=>{
  const book_id = parseInt(req.body.book_id);

    const summary_note = req.body.summary_note;
    try{
      await db.query(
        "INSERT INTO notes (id, note) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET note = EXCLUDED.note",
        [book_id, summary_note]
      );
            res.redirect(`/note/${book_id}`);
    }catch (error) {
      console.error("Error inserting book ", error);
      res.status(500).send("Failed to insert note.");
    }
})

app.post("/note/edit", async (req, res) => {
  console.log(req.body);
  const summary_note = req.body.summary_note;
  const book_id = parseInt(req.body.book_id); 
  try {
    // update the note for the book
    await db.query("UPDATE notes SET note = $1 WHERE id = $2", [summary_note, book_id]);
    res.redirect(`/note/${book_id}`);
  } catch (error) {
    console.error("Error updating note", error);
    res.status(500).send("Failed to update note.");
  }
});



app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });