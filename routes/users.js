const express = require("express");
const jwt = require("jsonwebtoken");

const env = require("../env");
const UserModel = require("../models/user-model");
const FolderModel = require("../models/folder-model");

const router = express.Router();

router.use("/", (req, res, next) => {
    const {username, password} = req.cookies || {};
    
    res.locals.isAdmin = (username == env.adminData.username && password == env.adminData.password);

    next();
});

router.post("/login", (req, res) => {
    switch (res.locals.isAdmin) {
        case false: 
            UserModel
                .find(req.body)
                .then(users => {
                    switch(users.length) {
                        case 0:
                            res.status(403).json({
                                error: "Username or password not found"
                            });
                            break;

                        default:
                            res.status(202).json({
                                token: jwt.sign({
                                    data: {
                                        username: users[0].username,
                                        id: users[0]._id
                                    },
                                    exp: Math.floor(Date.now() / 1000) + (60 * 60)
                                }, env.tokenScret)
                            });
                            break;
                    }
                })
                .catch(err => {
                    res.status(403).json({
                        error: "Access Not allowed"
                    });
                });
            break;
        
        case true:
            res.status(200).json({
                message: "Access allowed"
            });
            break;
    }
});

router.use("/", (req, res, next) => {
    switch (res.locals.isAdmin) {
        case false:
            res.status(403).json({
                error: "Access Not allowed"
            });
            break;
        
        case true:
            next();
            break;
    }
});

router.get("/list", (req, res) => {
    UserModel
        .find()
        .then(users => {
            res.status(200).json(users);
        })
        .catch((err) => {
            res.status(404).json({
                error: "Data not found"
            });
        });
});

router.post("/create", (req, res) => {
    const {username} = req.body;

    UserModel.find({username: username}).then(users => {
        if (Array.isArray(users) && users.length == 0) {
            UserModel
                .create({
                    ...req.body,
                    createdAt: Date.now()
                })
                .then((user) => {
                    FolderModel
                        .create({
                            userId: user._id,
                            createdAt: Date.now(),
                            messages: []
                        })
                        .then(() => {
                            res.status(201).json({
                                message: "User Created"
                            });
                        })
                        .catch(() => {
                            UserModel.findByIdAndDelete(user.id);
                            res.status(401).json({
                                error: "Failed to create the user"
                            });
                        });
                })
                .catch(err => {
                    res.status(401).json({
                        error: "Failed to create the user"
                    });
                });
        } else {
            res.status(401).json({
                error: "User already exist"
            });
        }
    }).catch(err => {
        res.status(401).json({
            error: "Failed to create the user"
        });
    });
});

router.get("/get/:id", (req, res) => {
    UserModel.findById(req.params.id).then(user => {
        res.status(200).json(user);
    }).catch(err => {
        res.status(404).json({
            error: "User not found"
        });
    });
});

router.put("/update/:id", (req, res) => {
    const data = {};
    
    ["firstname", "lastname", "age"].map(key => {
        if (key in req.body) data[key] = req.body[key];
    });

    UserModel.findByIdAndUpdate(req.params.id, data).then(user => {
        res.status(200).json({
            ...user["_doc"],
            ...data
        });
    }).catch(err => {
        res.status(404).json({
            error: "User not found"
        });
    });
});

router.delete("/delete/:id", (req, res) => {
    FolderModel
        .findOneAndDelete({userId: req.params.id})
        .then(() => {
            UserModel.findByIdAndDelete(req.params.id).then(() => {
                res.status(200).json({
                    message: "User Deleted"
                });
            }).catch(err => {
                res.status(404).json({
                    error: "User not found"
                });
            });
        })
        .catch(err => {
            res.status(401).json({
                error: "Failed to delete the folder"
            });
        });
});


module.exports = router;