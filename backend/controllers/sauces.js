const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.createSauce = (res, req, next) => {
    req = req.req;res = res.res;
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        likes: 0,
        dislikes: 0,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
        .then(() => {
            res.status(201).json({message: sauce })
        })
        .catch(error => res.status(400).json( error ));
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id})
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id})
                    .then(() => res.status(200).json({ message: 'Sauce supprimé !' }))
                    .catch(error => res.status(400).json(error));
            });
        })
        .catch(error => res.status(500).json({ error }));
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ?
        { 
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body};
    Sauce.updateOne({_id: req.params.id}, { ...sauceObject, _id: req.params.id})
        .then(() => res.status(200).json({ message: {sauce: sauceObject,message: "Sauce Modifié"}}))
        .catch(error => res.status(400).json(error));
};

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json(error));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id})
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(400).json({error, message: "Sauce ID inconnu"}));
};

// Ajoute et supprime les Likes et Dislikes sur l'ID de la sauce selectionné
exports.addLike = (req, res, next) => {
    const likeStatus = req.body.like;
    Sauce.findOne({ _id: req.params.id})
        .then(sauce => {

            if (likeStatus == "1"){ // Ajoute un Like
                updateLikes(sauce.usersLiked, req, res, "like", false);
            }else if (likeStatus == "-1"){ // Ajoute un Dislike
                updateLikes(sauce.usersDisliked, req, res, "dislike", false);
            }else if (likeStatus == "0"){ // Supprime un Like ou Dislike

                // Met à jour le tableau des Likes et Dislike en retirant le userId des deux tableaux
                let updateUsersLiked = arrayRemove(sauce.usersLiked, req.body.userId);
                let updateUsersDisliked = arrayRemove(sauce.usersDisliked, req.body.userId);

                // Compare la longueur du nouveau tableau créé et celle du tableau stocké dans la DB
                if (updateUsersLiked.length != sauce.usersLiked.length){
                    updateLikes(updateUsersLiked, req, res, "like", true);
                }else if (updateUsersDisliked.length != sauce.usersDisliked.length){
                    updateLikes(updateUsersDisliked, req, res, "dislike", true);
                }
            }
        })
        .catch(error => res.status(500).json({ error }));
};

function updateLikes(userList, req, res, status, remove){
    let likesContent, textMessage;

    if (remove == false){
        userList.push(req.body.userId);
        textMessage = status + " add";
    }else if (remove == true){
        textMessage = status + " removed";
    }

    // Met à jour le nouveau nombre de like/dislike et le tableau des userId dans les likes ou dislikes
    if (status === "like"){
        likesContent = { likes: userList.length, usersLiked: userList };
    }else if(status === "dislike"){
        likesContent = { dislikes: userList.length, usersDisliked: userList };
    }

    Sauce.updateOne( { _id: req.params.id }, likesContent)
        .then(() => res.status(200).json({ message: textMessage }))
        .catch(error => res.status(400).json({ error, message: "Erreur update Likes/Dislikes" }));
};

function arrayRemove(arr, value) { 
    return arr.filter(function(elem){
        return elem != value; 
    });
};

