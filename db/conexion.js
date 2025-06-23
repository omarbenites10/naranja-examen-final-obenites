const sqlite3 = require("sqlite3").verbose();


const db = new sqlite3.Database(
    "db/database.sqlite",
    sqlite3.OPEN_READWRITE,
    (error) => {
        if (error) console.error("Ocurrio un error: ", error);
        else {
            console.log("conexion existosa a la DB");
        }
    }
);


module.exports = db; //exporta db
