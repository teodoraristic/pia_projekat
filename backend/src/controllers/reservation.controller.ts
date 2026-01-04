import * as express from "express";
import ReservationModel from "../models/reservation";
import CabinModel from "../models/cabin";
import mongoose from "mongoose";

export class ReservationController {

  createReservation = (req: express.Request, res: express.Response) => {
    let reservationData = req.body;

    const startDate = new Date(reservationData.startDate);
    const endDate = new Date(reservationData.endDate);
    
    startDate.setHours(14, 0, 0, 0);
    reservationData.startDate = startDate;
    
    endDate.setHours(10, 0, 0, 0);
    reservationData.endDate = endDate;

    ReservationModel.find({
      cabinId: reservationData.cabinId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          startDate: { $lte: reservationData.endDate },
          endDate: { $gte: reservationData.startDate }
        }
      ]
    })
    .then((existingReservations) => {
      if (existingReservations.length > 0) {
        res.status(400).json({ 
          message: "Vikendica nije dostupna u odabranom periodu" 
        });
        return;
      }

      const newReservation = new ReservationModel(reservationData);
      
      newReservation.save()
        .then((savedReservation) => {
          res.json({ 
            message: "Rezervacija je uspešno kreirana",
            reservation: savedReservation 
          });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ message: "Greška pri kreiranju rezervacije" });
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Greška pri proveri dostupnosti" });
    });
  };

getUserReservations = (req: express.Request, res: express.Response) => {
  let touristId = req.params.touristId;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  ReservationModel.updateMany(
    {
      touristId: touristId,
      status: 'confirmed',
      endDate: { $lt: today }
    },
    {
      $set: { 
        status: 'completed',
        updatedAt: new Date()
      }
    }
  )
  .then(() => {
    return ReservationModel.find({ touristId: touristId })
      .populate('cabinId', 'name location images')
      .sort({ createdAt: -1 })
      .lean();
  })
  .then((reservations) => {
    const transformedReservations = reservations.map(reservation => {
      const cabin = reservation.cabinId as any;
      
      return {
        ...reservation,
        cabinName: cabin ? cabin.name : 'Nepoznata vikendica',
        cabinLocation: cabin ? cabin.location : 'Nepoznata lokacija'
      };
    });
    
    res.json(transformedReservations);
  })
  .catch((err) => {
    console.log(err);
    res.status(500).json({ message: "Greška pri dohvatanju rezervacija" });
  });
};

  cancelReservation = (req: express.Request, res: express.Response) => {
    let reservationId = req.params.id;

    ReservationModel.findById(reservationId)
      .then((reservation) => {
        if (!reservation) {
          res.status(404).json({ message: "Rezervacija nije pronađena" });
          return null;
        }

        const startDate = new Date(reservation.startDate);
        const today = new Date();
        const differenceInDays = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (differenceInDays < 1) {
          res.status(400).json({ 
            message: "Ne možete otkazati rezervaciju manje od 1 dan pre početka" 
          });
          return null;
        }

        reservation.status = 'cancelled';
        return reservation.save();
      })
      .then((updatedReservation) => {
        if (!updatedReservation) {
          return;
        }
        res.json({ message: "Rezervacija je uspešno otkazana" });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "Greška pri otkazivanju rezervacije" });
      });
  };


  addRatingAndComment = (req: express.Request, res: express.Response) => {
    let reservationId = req.params.id;
    let { rating, comment } = req.body;

    ReservationModel.findById(reservationId)
      .populate('cabinId')
      .then((reservation) => {
        if (!reservation) {
          res.status(404).json({ message: "Rezervacija nije pronađena" });
          return null;
        }

        const endDate = new Date(reservation.endDate);
        const today = new Date();
        if (endDate > today || reservation.status !== 'completed') {
          res.status(400).json({ 
            message: "Možete ostaviti komentar i ocenu samo za ostvarene rezervacije" 
          });
          return null;
        }

        reservation.rating = rating;
        reservation.comment = comment;
        
        return reservation.save();
      })
      .then((updatedReservation) => {
        if (!updatedReservation) {
          return null;
        }

        // Dohvati SVE ocene za ovu vikendicu
        return ReservationModel.find({ 
          cabinId: updatedReservation.cabinId, 
          rating: { $ne: null } 
        })
        .sort({ updatedAt: -1 })
        .then((allReservations) => {
          // Izračunaj prosečnu ocenu
          const ratings = allReservations
            .map(r => r.rating)
            .filter((r): r is number => r !== null && r !== undefined);

          let averageRating = 0;
          let totalReviews = 0;

          if (ratings.length > 0) {
            averageRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
            totalReviews = ratings.length;
          }

          // Pripremi poslednje 3 ocene
          const lastThreeData = allReservations.slice(0, 3).map(r => ({
            rating: r.rating,
            reservationId: r._id,
            date: r.updatedAt || new Date()
          }));

          // ✅ KORISTI findByIdAndUpdate sa $set - zaobiđe TypeScript problem
          return CabinModel.findByIdAndUpdate(
            updatedReservation.cabinId,
            {
              $set: {
                averageRating: averageRating,
                totalReviews: totalReviews,
                lastThreeRatings: lastThreeData
              }
            },
            { new: true }
          );
        })
        .then(() => updatedReservation);
      })
      .then((updatedReservation) => {
        if (!updatedReservation) {
          return;
        }
        res.json({ 
          message: "Komentar i ocena su uspešno sačuvani",
          reservation: updatedReservation 
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "Greška pri čuvanju komentara i ocene" });
      });
  };

  getOwnerReservations = (req: express.Request, res: express.Response) => {
    let ownerId = req.params.ownerId;

    CabinModel.find({ ownerId: ownerId })
      .then((cabins) => {
        const cabinIds = cabins.map(cabin => cabin._id);
        
        return ReservationModel.find({ cabinId: { $in: cabinIds } })
          .populate('cabinId', 'name location')
          .populate('touristId', 'firstName lastName')
          .sort({ createdAt: -1 })
          .lean();
      })
      .then((reservations) => {
        const transformedReservations = reservations.map(reservation => {
          const cabin = reservation.cabinId as any;
          const tourist = reservation.touristId as any;
          
          return {
            ...reservation,
            cabinName: cabin ? cabin.name : 'Nepoznata vikendica',
            cabinLocation: cabin ? cabin.location : 'Nepoznata lokacija',
            touristName: tourist ? `${tourist.firstName} ${tourist.lastName}` : 'Nepoznat turista'
          };
        });
        
        res.json(transformedReservations);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "Greška pri dohvatanju rezervacija" });
      });
  };

  updateReservationStatus = (req: express.Request, res: express.Response) => {
    let reservationId = req.params.id;
    let { status, ownerComment } = req.body;

    if (status == 'rejected' && (!ownerComment || ownerComment.trim() == '')) {
      res.status(400).json({ message: "Komentar je obavezan kod odbijanja rezervacije" });
      return;
    }

    ReservationModel.findByIdAndUpdate(
      reservationId,
      { 
        status: status,
        ...(ownerComment && { ownerComment: ownerComment })
      },
      { new: true }
    )
    .then((updatedReservation) => {
      if (!updatedReservation) {
        res.status(404).json({ message: "Rezervacija nije pronađena" });
        return;
      }
      res.json({ 
        message: "Status rezervacije je uspešno ažuriran",
        reservation: updatedReservation 
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Greška pri ažuriranju statusa rezervacije" });
    });
  };

getReservationsByCabin = (req: express.Request, res: express.Response) => {
  let cabinId = req.params.cabinId;

  if (!mongoose.Types.ObjectId.isValid(cabinId)) {
    res.status(400).json({ message: "Nevalidan ID vikendice" });
    return;
  }

  ReservationModel.find({ cabinId: cabinId })
    .populate('touristId', 'firstName lastName') // Popuni podatke o turisti
    .sort({ createdAt: -1 })
    .then((reservations) => {
      console.log(`Pronađeno ${reservations.length} rezervacija za vikendicu ${cabinId}`);
      
      const transformedReservations = reservations.map(reservation => {
        const tourist = reservation.touristId as any;
        
        return {
          _id: reservation._id,
          cabinId: reservation.cabinId,
          touristId: reservation.touristId,
          touristName: tourist ? `${tourist.firstName} ${tourist.lastName}` : 'Nepoznat turista',
          startDate: reservation.startDate,
          endDate: reservation.endDate,
          adults: reservation.adults,
          children: reservation.children,
          totalPrice: reservation.totalPrice,
          status: reservation.status,
          rating: reservation.rating,
          comment: reservation.comment,
          additionalRequests: reservation.additionalRequests,
          ownerComment: reservation.ownerComment,
          createdAt: reservation.createdAt,
          updatedAt: reservation.updatedAt
        };
      });
      
      res.json(transformedReservations);
    })
    .catch((err) => {
      console.error('Greška pri dohvatanju rezervacija za vikendicu:', err);
      res.status(500).json({ message: "Greška pri dohvatanju rezervacija" });
    });
};

}