const express = require("express");
//permette di creare percorsi di route modulari
var router = express.Router();
const { protect } = require("../middleware/auth");
const Pickups = require("../models/Pickups");
const ErrorResponse = require("../utils/errorResponse");

//CRUD

//create
router.route("/").post(protect, async (req, res, next) => {
    if (req.userInfo.role === "admin" || req.userInfo.role === "manager") {
        try {
            const point = new Pickups({ ...req.body });

            await point.save();

            res.status(201).json({ success: true });
        } catch (error) {
            next(error);
        }
    } else {
        return next(new ErrorResponse("Non autorizzato", 403));
    }
});

//read all
router.route("/").get(async (req, res, next) => {
    try {
        const data = await Pickups.find({});
        res.status(200).json({ success: true, data: data });
    } catch (error) {
        next(error);
    }
});

//read
router.route("/:id").get(async (req, res, next) => {
    try {
        const point = await Pickups.findById(req.params.id);

        if (!point) {
            return next(new ErrorResponse("Punto di ritiro non trovato", 404));
        }

        res.status(201).json({ success: true, data: point });
    } catch (error) {
        next(error);
    }
});

//update
router.route("/:id").put(protect, async (req, res, next) => {
    if (req.userInfo.role === "admin" || req.userInfo.role === "manager") {
        try {
            const pointUpdated = await Pickups.findByIdAndUpdate(
                req.params.id,
                req.body
            );

            if (!pointUpdated) {
                return next(
                    new ErrorResponse("Punto di ritiro non trovato", 404)
                );
            }

            res.status(201).json({ success: true, data: pointUpdated });
        } catch (error) {
            next(error);
        }
    } else {
        return next(new ErrorResponse("Non autorizzato", 403));
    }
});

//delete
router.route("/:id").delete(protect, async (req, res, next) => {
    if (req.userInfo.role === "admin" || req.userInfo.role === "manager") {
        try {
            const deleted = await Pickups.findByIdAndDelete(req.params.id);

            if (!deleted) {
                return next(
                    new ErrorResponse("Punto di ritiro non trovato", 404)
                );
            }

            res.status(200).json({ success: true });
        } catch (error) {
            next(error);
        }
    } else {
        return next(new ErrorResponse("Non autorizzato", 403));
    }
});

module.exports = router;
