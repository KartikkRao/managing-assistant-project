import express from "express";
import bodyParser from "body-parser";
import rateLimit from "express-rate-limit";
import pg from "pg";
import env from "dotenv";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = 3000;

env.config();

const limiter=rateLimit({
    windowMs:10*60*1000,  //10min
    max: 100              //100 request per 10min per IP
});
app.use(limiter);

// PostgreSQL database connection setup
const db = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

db.connect();

app.get("/",(req,res)=>{

});

app.get("/getdata", async (req, res) => {
    try {
        const result = await db.query("select * from assistants");
        console.log(result.rows);
        res.status(200).json(result.rows); 
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
});

app.get("/databyid",async(req,res)=>{
    try{
    const id=req.query.id;
    const result=await db.query("select * from assistants where id=($1)",[id]);
    console.log(result.rows);
    res.status(200).json(result.rows); 
} catch (err) {
    console.error(err);
    res.status(500).json(err);
}
});

app.post("/postdata",async (req,res)=>{
    console.log(process.env.KEY);
    console.log(req.query.key);
    if(process.env.KEY==req.query.key){

    try{
       const result= await db.query("insert into assistants values ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *",
    [req.body.id,req.body.name,req.body.mobile_number,req.body.email,req.body.city,req.body.country,req.body.department,req.body.Role,req.body.salary]);
    console.log(result.rows);
    res.status(200).json(result.rows); 
    }
    catch(err){
        console.error(err);
    res.status(500).json(err);
    }
}
else{
    res.status(500).json({err:"Authorization Key incorrect or not present"});
}
});

app.put("/updatedata",async(req,res)=>{
    if(process.env.KEY==req.query.key)
    {
    try{
        const id=req.query.id;
        const result = await db.query("UPDATE assistants SET name = $2, mobile_number = $3, email = $4, city = $5, country = $6, department = $7, role = $8, salary = $9 WHERE id = $1 RETURNING *",
    [id, req.body.name, req.body.mobile_number, req.body.email, req.body.city, req.body.country, req.body.department, req.body.Role, req.body.salary]);
    
    console.log(result.rows);
    res.status(200).json(result.rows);
    }
    catch(err){
        console.error(err);
    res.status(500).json(err);
    }
}
else{
    res.status(500).json({err: "Authorization Key incorrect or not present"});
}
});

app.delete("/deletedata",async(req,res)=>{
    console.log(process.env.KEY);
    console.log(req.query.key);
    if(process.env.KEY==req.query.key)
    {
    try{
        const id=req.query.id;
        const result=await db.query("delete from assistants where id=($1) returning *" ,[id]);
        console.log(result.rows);
        res.status(200).json(result.rows);
    }
    catch(err){
        console.error(err);
        res.status(500).json(err);
    }
    }
    else{
        res.status(500).json({err: "Authorization Key incorrect or not present"});
    }
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
  