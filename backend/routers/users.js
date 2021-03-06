const express = require("express");
//permette di creare percorsi di route modulari
var router = express.Router();
const { protect } = require("../middleware/auth");
const Users = require("../models/Users");
const Rents = require("../models/Rents");
const mongoose = require("mongoose");
const ErrorResponse = require("../utils/errorResponse");
const sendEmail = require("../utils/sendEmail");

//CRUD

//create non serve perche' c'e' register

//read all
router.route("/").get(protect, async (req, res, next) => {
    if (req.userInfo.role === "admin" || req.userInfo.role === "manager") {
        try {
            //ritorna l'user updato
            let user = await Users.find({ disabled: false }).select(
                "+comments"
            );
            res.status(200).json({
                success: true,
                data: user,
            });
        } catch (error) {
            next(error);
        }
    }
}); //da proteggere

//read by id
router.route("/:id").get(protect, async (req, res, next) => {
    if (req.userInfo.role === "admin" || req.userInfo.role === "manager") {
        try {
            let user = await Users.findById(req.params.id).select("+comments");
            res.status(200).json({
                success: true,
                data: {
                    userInfo: user._doc,
                },
            });
        } catch (error) {
            next(error);
        }
    }
}); //da proteggere

//read by username
router.route("/username/:username").get(protect, async (req, res, next) => {
    if (req.userInfo.role === "admin" || req.userInfo.role === "manager") {
        try {
            let user = await Users.findOne({
                username: req.params.username,
            }).select("+comments");
            res.status(200).json({
                success: true,
                data: {
                    userInfo: user._doc,
                },
            });
        } catch (error) {
            next(error);
        }
    }
}); //da proteggere

//update
router.route("/:id").put(protect, async (req, res, next) => {
    if (
        req.userInfo._id == req.params.id ||
        req.userInfo.role === "admin" ||
        req.userInfo.role === "manager"
    ) {
        try {
            if (req.query.password) {
                //se stiamo modificando la password vediamo se fa match quella vecchia
                try {
                    const user = await Users.findById(req.userInfo._id).select(
                        "+password"
                    );

                    //compariamo la password passata a quella salvata nel database
                    const isMatch = await user.matchPasswords(
                        req.body.passwordOld
                    );

                    if (!isMatch) {
                        return next(
                            new ErrorResponse("Credenziali non correntte", 404)
                        );
                    }

                    req.body = { password: req.body.passwordNew };
                } catch (error) {
                    return next(error);
                }
            }
            //ritorna l'user updato
            let updatedUser = await Users.findOneAndUpdate(
                { _id: req.params.id },
                { $set: req.body },
                { new: true, runValidators: true, useFindAndModify: false }
            );
            res.status(200).json({
                success: true,
                data: {
                    userInfo: updatedUser._doc,
                },
            });
        } catch (error) {
            next(error);
        }
    } else {
        return next(
            new ErrorResponse("Puoi modificare solo il tuo account", 403)
        );
    }
});

//delete
router.route("/:id").delete(protect, async (req, res, next) => {
    if (
        req.userInfo._id == req.params.id ||
        req.userInfo.role === "admin" ||
        req.userInfo.role === "manager"
    ) {
        try {
            //cerchiamo tutti i rent relativi a tale utente
            const history = await Rents.find({
                customer: mongoose.Types.ObjectId(req.params.id),
            });
            if (history.length === 0) {
                //elimina solo se non ha rent effettuati, altrimenti si disattiva l'account
                await Users.findByIdAndDelete(req.params.id);
            } else {
                await Users.findByIdAndUpdate(req.params.id, {
                    $set: {
                        disabled: true,
                        email: "disabled",
                        username: "disabled",
                    },
                });
            }

            res.status(200).json({
                success: true,
                data: "Utente eliminato con successo",
            });
        } catch (error) {
            next(error);
        }
    } else {
        return next(
            new ErrorResponse("Puoi modificare solo il tuo account", 403)
        );
    }
}); //da proteggere

//others

//send mail
router.route("/contacts/:id").post(protect, async (req, res, next) => {
    if (req.userInfo.role === "admin" || req.userInfo.role === "manager") {
        try {
            const user = await Users.findById(req.params.id);
            if (!user) {
                return next(new ErrorResponse("Utente non trovato", 404));
            }

            try {
                //mandiamo la mail
                await sendEmail({
                    to: user.email,
                    subject: req.body.subject,
                    text: req.body.message,
                });

                res.status(200).json({ success: true, data: "Email inviata" });
            } catch (error) {
                return next(
                    new ErrorResponse("L'email non e' stata inviata", 500)
                );
            }
        } catch (error) {
            next(error);
        }
    } else {
        return next(new ErrorResponse("Non autorizzato", 403));
    }
});

//statistiche
module.exports = router;
