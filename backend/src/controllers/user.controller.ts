import * as express from "express";
import UserModel from "../models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fileUpload from 'express-fileupload';
import path from "path";
import * as fs from "fs";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export class UserController {

  login = (req: express.Request, res: express.Response) => {
    let username = req.body.username;
    let password = req.body.password;
    let role = req.body.role;

    UserModel.findOne({ username: username, role: role })
      .then(async (user) => {
        if (!user) {
          res.status(404).json({ message: "Korisnik nije pronađen" });
          return;
        }

        if (user.registrationStatus !== 'approved') {
          res.status(403).json({ message: "Vaš nalog još uvek nije odobren" });
          return;
        }

        if (!user.isActive) {
          res.status(403).json({ message: "Vaš nalog je deaktiviran" });
          return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          res.status(401).json({ message: "Pogrešna lozinka" });
          return;
        }

        const token = jwt.sign(
          { 
            userId: user._id, 
            username: user.username, 
            role: user.role 
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.json({
          token,
          user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            gender: user.gender,
            address: user.address,
            phone: user.phone,
            profileImage: user.profileImage,
            creditCard: user.creditCard,
            role: user.role
          }
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "Greška pri prijavi" });
      });
  };

  register = (req: express.Request, res: express.Response) => {
    const userData = JSON.parse(req.body.userData);

    UserModel.findOne({ 
      $or: [
        { username: userData.username },
        { email: userData.email }
      ]
    })
      .then(async (existingUser) => {
        if (existingUser) {
          res.status(400).json({ 
            message: "Korisničko ime ili email već postoje" 
          });
          return;
        }

        if (!this.validatePassword(userData.password)) {
          res.status(400).json({ message: "Lozinka ne ispunjava uslove" });
          return;
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);

        let profileImagePath = '/images/profiles/default-profile.png';

        if (req.files && req.files.profileImage) {
          const picture = req.files.profileImage as fileUpload.UploadedFile;
          const fileName = `${userData.username}_${Date.now()}.jpg`;
          const filePath = path.join(__dirname, '..', '..', 'images', 'profiles', fileName);

          const dir = path.join(__dirname, '..', '..', 'images', 'profiles');
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }

          picture.mv(filePath);
          profileImagePath = `/images/profiles/${fileName}`;
        }

        const newUser = new UserModel({
          username: userData.username,
          password: hashedPassword,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          gender: userData.gender,
          address: userData.address,
          phone: userData.phone,
          profileImage: profileImagePath,
          creditCard: userData.creditCard,
          role: userData.role,
          isActive: false,
          registrationStatus: 'pending'
        });

        newUser.save()
          .then((savedUser) => {
            res.json({ 
              message: "Uspešno ste poslali zahtev za registraciju.",
              user: savedUser 
            });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({ message: "Greška pri registraciji" });
          });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "Greška pri registraciji" });
      });
  };

  changePassword = (req: express.Request, res: express.Response) => {
    let username = req.body.username;
    let oldPassword = req.body.oldPassword;
    let newPassword = req.body.newPassword;

    UserModel.findOne({username:username})
      .then(async (user) => {
        if (!user) {
          res.status(404).json({ message: "Korisnik nije pronađen" });
          return null;
        }

        const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isOldPasswordValid) {
          res.status(401).json({ message: "Stara lozinka nije ispravna" });
          return null;
        }

        if (oldPassword == newPassword) {
        res.status(400).json({ message: "Nova lozinka ne sme biti ista kao stara" });
        return null;
      }

        if (!this.validatePassword(newPassword)) {
          res.status(400).json({ message: "Lozinka ne ispunjava uslove" });
          return;
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        
        user.password = hashedNewPassword;
        return user.save();
      })
      .then((updatedUser) => {
        if (!updatedUser) {
          return;
        }
        res.json({ message: "Lozinka je uspešno promenjena" });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "Greška pri promeni lozinke" });
      });
  };

  updateProfile = (req: express.Request, res: express.Response) => {
    const userId = req.body.userId;
    const updateData = JSON.parse(req.body.updateData);

    delete updateData.password;
    delete updateData.role;
    delete updateData.registrationStatus;

    if (updateData.profileImage == "" || updateData.profileImage == null) {
      updateData.profileImage = '/images/profiles/default-profile.png';
    }

    if (req.files && req.files.profilePicture) {
      const picture = req.files.profilePicture as fileUpload.UploadedFile;
      const fileName = `${userId}_${Date.now()}.jpg`;

      const filePath = path.join(__dirname, '..', '..', 'images', 'profiles', fileName);

      const dir = path.join(__dirname, '..', '..', 'images', 'profiles');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      picture.mv(filePath, (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "Greška pri čuvanju slike" });
        }

        updateData.profileImage = `/images/profiles/${fileName}`;

        UserModel.findByIdAndUpdate(userId, updateData, { new: true })
          .select('-password')
          .then((updatedUser) => {
            if (!updatedUser) {
              return res.status(404).json({ message: "Korisnik nije pronađen" });
            }
            res.json({ message: "Profil je uspešno ažuriran", user: updatedUser });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({ message: "Greška pri ažuriranju profila" });
          });
      });
    } else {
      if (updateData.profileImage == "" || updateData.profileImage == null) {
        updateData.profileImage = '/images/profiles/default-profile.png';
      }

      UserModel.findByIdAndUpdate(userId, updateData, { new: true })
        .select('-password')
        .then((updatedUser) => {
          if (!updatedUser) {
            return res.status(404).json({ message: "Korisnik nije pronađen" });
          }
          res.json({ message: "Profil je uspešno ažuriran", user: updatedUser });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ message: "Greška pri ažuriranju profila" });
        });
    }
  };

  getUserById = (req: express.Request, res: express.Response) => {
    let userId = req.params.id;

    UserModel.findById(userId)
      .select('-password')
      .then((user) => {
        if (!user) {
          res.status(404).json({ message: "Korisnik nije pronađen" });
          return;
        }
        res.json(user);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "Greška pri dohvatanju korisnika" });
      });
  }

  getAllUsers = (req: express.Request, res: express.Response) => {
    UserModel.find({ role: { $in: ['tourist', 'owner'] } })
      .select('-password')
      .then((users) => {
        res.json(users);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "Greška pri dohvatanju korisnika" });
      });
  };

  updateRegistrationStatus = (req: express.Request, res: express.Response) => {
    let userId = req.params.id;
    let { registrationStatus } = req.body;

    UserModel.findByIdAndUpdate(
      userId,
      { 
        registrationStatus: registrationStatus,
        isActive: registrationStatus == 'approved'
      },
      { new: true }
    )
    .select('-password')
    .then((updatedUser) => {
      if (!updatedUser) {
        res.status(404).json({ message: "Korisnik nije pronađen" });
        return;
      }
      res.json({ 
        message: "Status registracije je uspešno ažuriran",
        user: updatedUser 
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Greška pri ažuriranju statusa" });
    });
  };

  deactivateUser = (req: express.Request, res: express.Response) => {
    let userId = req.params.id;

    UserModel.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    )
    .select('-password')
    .then((updatedUser) => {
      if (!updatedUser) {
        res.status(404).json({ message: "Korisnik nije pronađen" });
        return;
      }
      res.json({ 
        message: "Korisnik je uspešno deaktiviran",
        user: updatedUser 
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Greška pri deaktiviranju korisnika" });
    });
  };

  activateUser = (req: express.Request, res: express.Response) => {
    let userId = req.params.id;

    UserModel.findByIdAndUpdate(
      userId,
      { isActive: true },
      { new: true }
    )
    .select('-password')
    .then((updatedUser) => {
      if (!updatedUser) {
        res.status(404).json({ message: "Korisnik nije pronađen" });
        return;
      }
      res.json({ 
        message: "Korisnik je uspešno aktiviran",
        user: updatedUser 
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Greška pri aktiviranju korisnika" });
    });
  };

  getPendingUsers = (req: express.Request, res: express.Response) => {
    UserModel.find({ registrationStatus: 'pending' })
      .select('-password')
      .then((users) => {
        res.json(users);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "Greška pri dohvatanju korisnika na čekanju" });
      });
  };

  validatePassword(password: string): boolean {

    if (password.length < 6 || password.length > 10) {
      console.log('Invalid length:', password.length);
      return false;
    }

    if (!/^[a-zA-Z]/.test(password)) {
      console.log('Must start with letter');
      return false;
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const lowerCaseLetters = (password.match(/[a-z]/g) || []).length;
    const hasThreeLowerCase = lowerCaseLetters >= 3;
    const hasDigit = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    console.log('Password validation:', {
      password,
      length: password.length,
      startsWithLetter: /^[a-zA-Z]/.test(password),
      hasUpperCase,
      lowerCaseCount: lowerCaseLetters,
      hasThreeLowerCase,
      hasDigit,
      hasSpecialChar
    });

    return hasUpperCase && hasThreeLowerCase && hasDigit && hasSpecialChar;
  }
}