const express = require("express");
const jwt = require("jsonwebtoken");

const env = require("../env");
const FolderModel = require("../models/folder-model");

const router = express.Router();

router.use("/", (req, res, next) => {
    const {username, password} = req.cookies || {};
    
    res.locals.isAdmin = (username == env.adminData.username && password == env.adminData.password);

    next();
});

router.use("/", (req, res, next) => {
    const {token} = req.cookies || {};
    
    switch (token) {
        case undefined: 
            if (res.locals.isAdmin) {
                next();
            } else {
                res.status(403).json({
                    error: "Access Not allowed"
                });
            }
            break;
        
        default:
            jwt.verify(token, env.tokenScret, (err, decoded) => {
                if (err != undefined) {
                    if (res.locals.isAdmin) next();
                    else 
                        res.status(403).json({
                            error: "Token not valid yet"
                        });
                } else {
                    res.locals.user = decoded.data;
                    next();
                }
            });
            break;
    }
});

router.get("/folder", (req, res) => {
    if (!res.locals.user)
        return res.status(403).json({
            error: "Access Not allowed"
        });

    FolderModel
        .findOne({userId: res.locals.user.id})
        .then((folders) => {
            if (Array.isArray(folders)) {
                switch (folders.length) {
                    case 1:
                        res.status(200).json(folders[0]);
                        break;
    
                    default:
                        res.status(404).json({
                            error: "Data not found"
                        });
                        break;
                }
            } else {
                res.status(200).json(folders);
            }
        })
        .catch((err) => {
            res.status(401).json({
                error: "Failed to research data"
            });
        })
});

router.post("/message", (req, res) => {
    if (!res.locals.user)
        return res.status(403).json({
            error: "Access Not allowed"
        });

    FolderModel
        .findOne({userId: res.locals.user.id})
        .then((folder) => {
            FolderModel
                .findOneAndUpdate(folder._id, {
                    messages: [
                        ...folder.messages, {
                            sendBy: "me",
                            sendAt: Date.now(),
                            body: req.body.data
                        }
                    ]
                })
                .then(() => {
                    res.status(200).json({
                        message: "Messange sent"
                    });
                })
                .catch((err) => {
                    res.status(401).json({
                        error: "Failed to send the message"
                    });
                });
        })
        .catch((err) => {
            res.status(401).json({
                error: "Failed to research data"
            });
        })
});

router.get("/messages", (req, res) => {
    if (!res.locals.user)
        return res.status(403).json({
            error: "Access Not allowed"
        });

    FolderModel
        .findOne({userId: res.locals.user.id})
        .then((folder) => {
            res.status(200).json(folder.messages);
        })
        .catch((err) => {
            res.status(401).json({
                error: "Failed to research data"
            });
        })
});

router.post("/record", (req, res) => {
    if (!res.locals.user)
        return res.status(403).json({
            error: "Access Not allowed"
        });

    FolderModel
        .findOne({userId: res.locals.user.id})
        .then((folder) => {
            FolderModel
                .findOneAndUpdate(folder._id, {
                    record: req.body.data,
                    recordedAt: Date.now(),
                    comment: req.body.comment
                })
                .then(() => {
                    res.status(200).json({
                        message: "Record Saved"
                    });
                })
                .catch((err) => {
                    res.status(401).json({
                        error: "Failed to save the record"
                    });
                });
        })
        .catch((err) => {
            res.status(401).json({
                error: "Failed to research data"
            });
        })
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
    FolderModel
        .find()
        .then(folders => {
            res.status(200).json(folders);
        })
        .catch((err) => {
            res.status(404).json({
                error: "Data not found"
            });
        });
});

router.post("/message/:id", (req, res) => {
    FolderModel
        .findOne({userId: req.params.id})
        .then((folder) => {
            FolderModel
                .findOneAndUpdate(folder._id, {
                    messages: [
                        ...folder.messages, {
                            sendBy: "admin",
                            sendAt: Date.now(),
                            body: req.body.data
                        }
                    ]
                })
                .then(() => {
                    res.status(200).json({
                        message: "Messange sent"
                    });
                })
                .catch((err) => {
                    res.status(401).json({
                        error: "Failed to send the message"
                    });
                });
        })
        .catch((err) => {
            res.status(401).json({
                error: "Failed to research data"
            });
        })
});

router.get("/messages/:id", (req, res) => {
    FolderModel
        .findOne({userId: req.params.id})
        .then((folder) => {
            res.status(200).json(folder.messages);
        })
        .catch((err) => {
            res.status(401).json({
                error: "Failed to research data"
            });
        })
});

router.get("/folder/:id", (req, res) => {
    FolderModel
        .findOne({userId: req.params.id})
        .then((folder) => {
            res.status(200).json(folder);
        })
        .catch((err) => {
            res.status(401).json({
                error: "Failed to research data"
            });
        })
});

router.post("/video/:id", (req, res) => {
    FolderModel
        .findOne({userId: req.params.id})
        .then((folder) => {
            FolderModel
                .findOneAndUpdate(folder._id, {
                    video: req.body.data,
                    videoCreationTime: Date.now()
                })
                .then(() => {
                    res.status(200).json({
                        message: "Video saved"
                    });
                })
                .catch((err) => {
                    res.status(401).json({
                        error: "Failed to save the video"
                    });
                });
        })
        .catch((err) => {
            res.status(401).json({
                error: "Failed to research data"
            });
        })
});

module.exports = router;