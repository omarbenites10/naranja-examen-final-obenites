const db = require("./conexion"); // importa db

const dbGetAll = function (query, parms = []) {
    return new Promise((resolve, reject) => {
        db.all(query, parms, (error, records) => {
            if (error) return reject(error);
            resolve(records);
        });
    });
};

const dbRun = async function (query, parms = []) {
    return new Promise((resolve, reject) => {
        db.run(query, parms, function (error) {
            if (error) return reject(error);
            resolve({ id: this.lastID });
        });
    });
};

const dbGetOne = function (query, parms = []) {
    return new Promise((resolve, reject) => {
        db.get(query, parms, (error, record) => {
            if (error) return reject(error);
            resolve(record);
        });
    });
};

module.exports = {
    dbGetAll,
    dbRun,
    dbGetOne,
};
