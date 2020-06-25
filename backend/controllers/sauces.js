const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.createSauce = (res, req, next) => {
    const sauceObject = JSON.parse(req.req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        likes: 0,
        dislikes: 0,
        imageUrl: `${req.req.protocol}://${req.req.get('host')}/images/${req.req.file.filename}`
    });
    sauce.save()
        .then(() => res.status(201).json({ message: sauce }))
        .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id})
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id})
                    .then(() => res.status(200).json({ message: 'Object supprimé !' }))
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
        .then(() => res.status(200).json({message: 'Object modifié'}))
        .catch(error => res.status(400).json(error));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id})
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(400).json(error));
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
        if (likeStatus.like == "1"){
                const likeUserList = sauce.usersLiked;
                likeUserList.push(req.body.userId);
                Sauce.updateOne({_id: req.params.id}, 
                                {likes: likeUserList.length, usersLiked: likeUserList, _id: req.params.id})
                    .then(() => res.status(200).json({message: "Like add"}))
                    .catch(error => res.status(400).json(error));
            }else if (likeStatus.like == "-1"){
                const dislikeUserList = sauce.usersDisliked;
                dislikeUserList.push(req.body.userId);
                Sauce.updateOne({_id: req.params.id}, 
                                {dislikes: dislikeUserList.length, usersDisliked: dislikeUserList, _id: req.params.id})
                    .then(() => res.status(200).json({message: "Dislike add"}))
                    .catch(error => res.status(400).json(error));
            }else if (likeStatus.like == "0"){
                const dislikeUserList = sauce.usersDisliked;
                const likeUserList = sauce.usersLiked;
                let updateUsersLiked = arrayRemove(sauce.usersLiked, req.body.userId);
                let updateUsersDisliked = arrayRemove(sauce.usersDisliked, req.body.userId);
                if (updateUsersLiked.length != likeUserList.length){
                    let likesCount = likeUserList.length - 1;
                    Sauce.updateOne({   _id: req.params.id }, 
                                    {   likes: likesCount,
                                        usersLiked: updateUsersLiked,
                                        _id: req.params.id })
                        .then(() => res.status(200).json({message: "Like removed"}))
                        .catch(error => res.status(400).json(error));
                }else if (updateUsersDisliked.length != dislikeUserList.length){
                    let dislikesCount = dislikeUserList.length - 1;
                    Sauce.updateOne({   _id: req.params.id }, 
                                    {   dislikes: dislikesCount,
                                        usersDisliked: updateUsersDisliked,
                                        _id: req.params.id })
            .then(() => res.status(200).json({message: "Dislike removed"}))
            .catch(error => res.status(400).json(error)); 
                }
            }
        })
        .catch(error => res.status(500).json({ error }));
};

function updateLikes(likesNumber, usersLikes){
    const userList = sauce.usersLikes;
    userList.push(req.body.userId);
    Sauce.updateOne({_id: req.params.id}, {like: likesNumber.length, usersLikes: userList, _id: req.params.id})
                    .then(() => res.status(200).json({message: "Dislike add"}))
                    .catch(error => res.status(400).json(error));
};

function arrayRemove(arr, value) { 
    return arr.filter(function(elem){
        return elem != value; 
    });
};

