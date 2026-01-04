import express from "express";
import { CabinController } from "../controllers/cabin.controller";

const cabinRouter = express.Router();

cabinRouter.route("/")
  .get((req, res) => new CabinController().getAllCabins(req, res))
  .post((req, res) => new CabinController().createCabin(req, res));

cabinRouter.route("/statistics")
  .get((req, res) => new CabinController().getStatistics(req, res));

cabinRouter.route("/check-availability")
  .post((req, res) => new CabinController().checkAvailability(req, res));


cabinRouter.route("/owner/:ownerId")
  .get((req, res) => new CabinController().getOwnerCabins(req, res));

cabinRouter.route('/:id/last-three-ratings')
  .get((req, res) => new CabinController().getLastThreeRatings(req, res));

cabinRouter.route("/:id/block")
  .put((req, res) => new CabinController().blockCabin(req, res));

cabinRouter.route("/:id")
  .get((req, res) => new CabinController().getCabinById(req, res))
  .put((req, res) => new CabinController().updateCabin(req, res))
  .delete((req, res) => new CabinController().deleteCabin(req, res));

export default cabinRouter;