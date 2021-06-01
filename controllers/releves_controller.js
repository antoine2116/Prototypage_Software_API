const util = require('util');

// Récupère le dernier relevé
exports.getLastReleve = (req, res) => {
    let db = req.db;
    let collection = db.collection('releves');

    collection.find().sort({"date": -1}).limit(1).toArray(function(err, result) {
        if (err) {
            console.log(err.message);
            res.status(500).send({message: err.message});
        }

        if (result.length) {
            const lastReleve = result[0];
            const query = {'movement.value' : {$eq: 1}};
            collection.find(query).sort({date: -1}).limit(1).toArray(function(err, lastMovement) {
                if (err) {
                    res.status(500).send({message: err.message});
                }
                console.log(lastMovement)
                if (lastMovement.length) {
                    lastReleve.lastMovement = lastMovement[0].date
                } else {
                    lastReleve.lastMovement = ''
                }

                res.json(lastReleve);

            });
        } else {
            res.status(500).send({message: 'Aucun relevé trouvé'});
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
        movement: releve.movement,
        date: new Date()
    }, function(err, result) {
        if (err) {
            console.log(err.message);
        } else {
            console.log('Payload inserted : ' + util.inspect(releve) + '\n');
        }
    });
}