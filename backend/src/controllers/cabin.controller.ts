import * as express from "express";
import CabinModel from "../models/cabin";
import ReservationModel from "../models/reservation";
import UserModel from "../models/user";
import path from "path";
import * as fs from "fs";
import fileUpload from 'express-fileupload';

export class CabinController {

  getAllCabins = (req: express.Request, res: express.Response) => {
    const now = new Date();

    CabinModel.updateMany(
      {
        isBlocked: true,
        blockedUntil: { $lt: now }
      },
      {
        $set: {
          isBlocked: false,
          blockedUntil: null
        }
      }
    )
    .then(() => {
      return CabinModel.find({ isActive: true })
        .populate('ownerId', 'firstName lastName phone email');
    })
    .then((cabins) => {
      res.json(cabins);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Greška pri dohvatanju vikendica" });
    });
  };

  getCabinById = (req: express.Request, res: express.Response) => {
    let cabinId = req.params.id;

    CabinModel.findById(cabinId)
      .populate('ownerId', 'firstName lastName phone email')
      .then((cabin) => {
        if (!cabin) {
          res.status(404).json({ message: "Vikendica nije pronađena" });
          return;
        }
        res.json(cabin);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "Greška pri dohvatanju vikendice" });
      });
  };

  createCabin = (req: express.Request, res: express.Response): void => {
    try {
      const cabinData = JSON.parse(req.body.cabinData);

      delete cabinData._id;
      delete cabinData.id;

      if (!cabinData.ownerId) {
        res.status(400).json({ message: "ID vlasnika je obavezan" });
        return;
      }

      if (!cabinData.name || !cabinData.location) {
        res.status(400).json({ message: "Naziv i lokacija su obavezni" });
        return;
      }

      const imagePaths: string[] = [];
      
      if (req.files && req.files.cabinImages) {
        const images = Array.isArray(req.files.cabinImages) 
          ? req.files.cabinImages 
          : [req.files.cabinImages];
        
        const dir = path.join(__dirname, '..', '..', 'images', 'cabins');
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        images.forEach((image: fileUpload.UploadedFile, index: number) => {
          const fileName = `${cabinData.ownerId}_${Date.now()}_${index}.jpg`;
          const filePath = path.join(dir, fileName);
          image.mv(filePath);
          imagePaths.push(`/images/cabins/${fileName}`);
        });
      }

      const newCabin = new CabinModel({
        ...cabinData,
        images: imagePaths
      });
      
      newCabin.save()
        .then((savedCabin) => {
          res.json({ 
            message: "Vikendica je uspešno kreirana",
            cabin: savedCabin 
          });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ message: "Greška pri kreiranju vikendice" });
        });

    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Greška pri obradi zahteva" });
    }
  };

  updateCabin = (req: express.Request, res: express.Response) => {
    let cabinId = req.params.id;
    let updateData = req.body;

    CabinModel.findByIdAndUpdate(cabinId, updateData, { new: true })
      .then((updatedCabin) => {
        if (!updatedCabin) {
          res.status(404).json({ message: "Vikendica nije pronađena" });
          return;
        }
        res.json({ 
          message: "Vikendica je uspešno ažurirana",
          cabin: updatedCabin 
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "Greška pri ažuriranju vikendice" });
      });
  };

  deleteCabin = (req: express.Request, res: express.Response) => {
    let cabinId = req.params.id;

    CabinModel.findByIdAndUpdate(cabinId, { isActive: false }, { new: true })
      .then((deletedCabin) => {
        if (!deletedCabin) {
          res.status(404).json({ message: "Vikendica nije pronađena" });
          return;
        }
        res.json({ message: "Vikendica je uspešno obrisana" });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "Greška pri brisanju vikendice" });
      });
  };

  getStatistics = (req: express.Request, res: express.Response) => {
    Promise.all([
      CabinModel.countDocuments({ isActive: true }),
      UserModel.countDocuments({ role: 'owner', registrationStatus: 'approved', isActive: true }),
      UserModel.countDocuments({ role: 'tourist', registrationStatus: 'approved', isActive: true }),
      ReservationModel.countDocuments({ 
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }),
      ReservationModel.countDocuments({ 
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }),
      ReservationModel.countDocuments({ 
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      })
    ])
    .then(([
      totalCabins,
      totalOwners,
      totalTourists,
      reservations24h,
      reservations7days,
      reservations30days
    ]) => {
      res.json({
        totalCabins: totalCabins,
        totalOwners: totalOwners,
        totalTourists: totalTourists,
        reservations24h: reservations24h,
        reservations7days: reservations7days,
        reservations30days: reservations30days
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Greška pri dohvatanju statistike" });
    });
  };

  getOwnerCabins = (req: express.Request, res: express.Response) => {
    let ownerId = req.params.ownerId;

    CabinModel.find({ ownerId: ownerId, isActive: true })
      .then((cabins) => {
        res.json(cabins);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "Greška pri dohvatanju vikendica" });
      });
  };

  blockCabin = (req: express.Request, res: express.Response) => {
    let cabinId = req.params.id;
    
    const blockedUntil = new Date();
    blockedUntil.setHours(blockedUntil.getHours() + 48);

    CabinModel.findByIdAndUpdate(
      cabinId,
      { 
        isBlocked: true,
        blockedUntil: blockedUntil
      },
      { new: true }
    )
    .then((updatedCabin) => {
      if (!updatedCabin) {
        res.status(404).json({ message: "Vikendica nije pronađena" });
        return;
      }
      res.json({ 
        message: "Vikendica je blokirana na 48 sati",
        cabin: updatedCabin 
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Greška pri blokiranju vikendice" });
    });
  };

checkAvailability = (req: express.Request, res: express.Response) => {
  let { cabinId, startDate, endDate } = req.body;

  CabinModel.findById(cabinId)
    .then((cabin) => {
      if (!cabin) {
        res.status(404).json({ message: "Vikendica nije pronađena" });
        return null;
      }

      if (cabin.isBlocked && cabin.blockedUntil) {
        const now = new Date();
        if (new Date(cabin.blockedUntil) < now) {
          cabin.isBlocked = false;
          cabin.blockedUntil = undefined;
          return cabin.save().then(() => cabin);
        }
      }
      return cabin;
    })
    .then((cabin) => {
      if (!cabin) return;

      if (cabin.isBlocked) {
        res.json({ 
          available: false,
          conflictingReservations: 0,
          blocked: true,
          message: "Vikendica je trenutno blokirana od strane administratora"
        });
        return;
      }

      return ReservationModel.find({
        cabinId: cabinId,
        status: { $in: ['pending', 'confirmed'] },
        $or: [
          {
            startDate: { $lte: new Date(endDate) },
            endDate: { $gte: new Date(startDate) }
          }
        ]
      });
    })
    .then((existingReservations) => {
      if (!existingReservations) return;
      
      const isAvailable = existingReservations.length === 0;
      res.json({ 
        available: isAvailable,
        conflictingReservations: existingReservations.length,
        blocked: false
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Greška pri proveri dostupnosti" });
    });
};

  getLastThreeRatings = (req: express.Request, res: express.Response) => {
    const cabinId = req.params.id;

    CabinModel.findById(cabinId)
      .then((cabin) => {
        if (!cabin) {
          res.status(404).json({ message: "Vikendica nije pronađena" });
          return; 
        }

        const ratings = cabin.lastThreeRatings
          .map(item => item.rating)
          .filter((rating): rating is number => rating != null && rating != undefined);

        const average = ratings.length > 0 
          ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length 
          : 0;

        const shouldBlock = ratings.length == 3 && average < 2;

        res.json({ 
          cabinId: cabin._id,
          cabinName: cabin.name,
          location: cabin.location,
          ratings,
          average: Number(average.toFixed(2)),
          shouldBlock,
          count: ratings.length,
          message: shouldBlock 
            ? `Vikendica ima prosečnu ocenu ${average.toFixed(2)} iz poslednje 3 ocene - potrebna blokada!`
            : `Vikendica je u dobrom stanju (prosek: ${average.toFixed(2)})`
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "Greška pri dohvatanju ocena" });
      });
  };

}