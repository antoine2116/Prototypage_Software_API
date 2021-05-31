const util = require('util');

// Récupère le dernier relevé
exports.getLastReleve = (req, res) => {
    let db = req.db;
    let collection = db.collection('releves');

    collection.find().sort({"date": -1}).limit(1).toArray(function(err, result) {
        if (result.length) {
            res.send(result[0]);
        } else {
            console.log(err.message);
            res.status(500).send({message: 'Une erreur est survenue lors de la récupération du relevé'});
        }
    });
}

// Récupère tout les relevés des 6 dernières heures
exports.getAllReleve = (req, res) => {
    let db = req.db;
    let collection = db.collection('releves');

    collection.find().sort({date: -1}).limit(50).toArray(function(err, releves) {
        if (err) {
            console.log(err.message);
            res.status(500).send({message: 'Une erreur est survenue lors de la récupération des relevés'});
        } else {
            let data = {
                date_arr: releves.map(r => r.date),
                temperature_arr: releves.map(r => r.temperature.value),
                humidity_arr: releves.map(r => r.humidity.value),
                brightness_arr: releves.map(r => r.brightness.value)
            };
            res.send(data);
        }
    });
}

// Ajoute un relevé en base
exports.addReleve = (releve, collection) => {
    collection.insertOne({
        temperature: releve.temperature,
        humidity: releve.humidity,
        brightness: releve.brightness,
        date: new Date()
    }, function(err, result) {
        if (err) {
            console.log(err.message);
        } else {
            console.log('Payload inserted : ' + util.inspect(releve) + '\n');
        }
    });
}