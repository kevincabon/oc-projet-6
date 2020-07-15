const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const { Error } = require('mongoose');

exports.signup = (req, res, next) => {
    validatePassword(req.body.password, res);
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
                .then(() => res.status(201).json({message: 'Utilisateur créé !'}))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user){
                return res.status(401).json({ error: "Utilisateur non trouvé !"});
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid){
                        return res.status(401).json({ error: 'Mot de passe incorrect !'});
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            '96qrenxT_kB6jFPYTB4Z.JHqGoc*hz2Awba8grEge_gHkzLcdghG9H4ssVaiPhFn',
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }))
        })
        .catch(error => {
            res.status(500).json({ error })
        })
};

function validatePassword(p, res) {
    var errors = [];
    if (p.length < 8) {
        errors.push("Votre mot de passe doit contenir au moins 8 caractères."); 
    }
    if (p.search(/[a-z]/i) < 0) {
        errors.push("Votre mot de passe doit contenir au moins une lettre.");
    }
    if (p.search(/[A-Z]/) < 0) {
        errors.push("Votre mot de passe doit contenir au moins une majuscule.");
    }
    if (p.search(/[0-9]/) < 0) {
        errors.push("Votre mot de passe doit contenir au moins un chiffre."); 
    }
    if (p.search(/[&#(_)$!]/) < 0) {
        errors.push("Votre mot de passe doit contenir au moins un des caractères spéciaux suivant : &#(_)$!"); 
    }
    if (p.search(/[<>':%?;=+]/) > 0) {
        errors.push("Votre mot de passe doit contenir seulement un des ces caractères spéciaux suivant : &#(_)$!"); 
    }
    if (errors.length > 0) {
        return res.status(400).json({ error: errors });
    }
    return true;
}