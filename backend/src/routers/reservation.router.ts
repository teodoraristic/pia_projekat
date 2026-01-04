import express from "express";
import { ReservationController } from "../controllers/reservation.controller";

const reservationRouter = express.Router();

reservationRouter.route("/")
  .post((req, res) => new ReservationController().createReservation(req, res));

reservationRouter.route("/user/:touristId")
  .get((req, res) => new ReservationController().getUserReservations(req, res));

reservationRouter.route("/owner/:ownerId")
  .get((req, res) => new ReservationController().getOwnerReservations(req, res));

reservationRouter.route("/:id/cancel")
  .put((req, res) => new ReservationController().cancelReservation(req, res));

reservationRouter.route("/:id/rating")
  .put((req, res) => new ReservationController().addRatingAndComment(req, res));

reservationRouter.route("/:id/status")
  .put((req, res) => new ReservationController().updateReservationStatus(req, res));

reservationRouter.route('/cabin/:cabinId')
  .get((req, res) => new ReservationController().getReservationsByCabin(req,res));

export default reservationRouter;