// Récupère le dernier relevé
exports.getLastReleve = (req, res) => {
    let db = req.db;
    let collection = db.collection('releves');

    collection.find().sort({"created_on": -1}).limit(1).toArray(function(err, releve) {
        if (releve.length) {
            // TODO min/max brightness
            let data = {
                date: releve[0].created_on,
                temperature: releve[0].temperature,
                humidity: releve[0].humidity
            }
            res.send(data);
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

    let dateMax = new Date();
    dateMax.setHours(dateMax.getHours() - 6);

    collection.find({
        created_on: {
            $gt: dateMax
        }
    }).toArray(function(err, releves) {
        if (err) {
            console.log(err.message);
            res.status(500).send({message: 'Une erreur est survenue lors de la récupération des relevés'});
        } else {
            // TODO min/max brightness
            let data = {
                date_arr: releves.map(r => r.created_on),
                temperature_arr: releves.map(r => r.temperature),
                humidity_arr: releves.map(r => r.humidity)
            };
            res.send(data);
        }
    });
}

// Temporaire (ajoute un releve random)
exports.addReleve = (req, res) => {
    let db = req.db;
    let collection = db.collection('releves');

    collection.insertOne({
        temperature: Math.floor(Math.random() * 20) + 30,
        humidity: Math.floor(Math.random() * 30) + 10,
        brightness: Math.floor(Math.random() * 100) + 200,
        created_on: new Date()
    }, function(error, result) {
        if (error) {
            console.log(err.message);
            res.status(500).send({message: 'Une erreur est survenue lors de la récupération des relevés'});
        } else {
            console.log(result);
            res.status(200).send();
        }
    });
}