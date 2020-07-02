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
    console.log(req);
    const sauceObject = req.file ?
        { 
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body};
    Sauce.updateOne({_id: req.params.id}, { ...sauceObject, _id: req.params.id})
        .then(() => res.status(200).json({message: 'Sauce modifié'}))
        .catch(error => res.status(400).json(error));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id})
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(400).json({error, message: "Sauce ID inconnu"}));
};

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json(error));
};

exports.addLike = (req, res, next) => {
    const likeStatus = req.body;
    Sauce.findOne({ _id: req.params.id})
    .then(sauce => {
        const likeUserList = sauce.usersLiked;
        const dislikeUserList = sauce.usersDisliked;
        if (likeStatus.like == "1"){
            updateLikes(likeUserList, req, res, "like", false, null);
        }else if (likeStatus.like == "-1"){
            updateLikes(dislikeUserList, req, res, "dislike", false, null);
        }else if (likeStatus.like == "0"){
            let updateUsersLiked = arrayRemove(sauce.usersLiked, req.body.userId);
            let updateUsersDisliked = arrayRemove(sauce.usersDisliked, req.body.userId);
            if (updateUsersLiked.length != likeUserList.length){
                updateLikes(likeUserList, req, res, "like", true, updateUsersLiked);
            }else if (updateUsersDisliked.length != dislikeUserList.length){
                updateLikes(dislikeUserList, req, res, "dislike", true, updateUsersDisliked);
            }
        }
    })
    .catch(error => res.status(500).json({ error }));
};

function updateLikes(userList, req, res, status, remove, usersListUpdate){
    let likesContent, textMessage;
    let likesOrDislikeRemoveCount = userList.length - 1;
    userList.push(req.body.userId);
    let likeOrDislikeCount = userList.length;
    let usersList = userList;
    if (remove == true){
        likeOrDislikeCount = likesOrDislikeRemoveCount;
        usersList = usersListUpdate;
        textMessage = status + " removed";
    }else{
        textMessage = status + " add";
    }
    if (status === "like"){
        likesContent = { likes: likeOrDislikeCount, usersLiked: usersList, _id: req.params.id };
    }else if(status === "dislike"){
        likesContent = { dislikes: likeOrDislikeCount, usersDisliked: usersList, _id: req.params.id };
    }
    Sauce.updateOne(
        { _id: req.params.id },
        likesContent)
        .then(() => res.status(200).json({ message: textMessage }))
        .catch(error => res.status(400).json({ error, message: "Erreur update Likes/Dislikes" }));
};

function arrayRemove(arr, value) { 
    return arr.filter(function(elem){
        return elem != value; 
    });
};

