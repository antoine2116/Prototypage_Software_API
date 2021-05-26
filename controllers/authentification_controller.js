exports.login = (req, res) => {
    let db = req.db;
    let collection = db.collection('utilisateurs');

    let email = req.query.email;

    let data = {
        status: false
    }

    collection.findOne({email: email}, (err, user) => {
       if (user != null) {
           data.user = user;
       }
       res.send(data);
    });
}