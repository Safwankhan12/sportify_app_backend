const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { Venue } = require("../models");
const geolib = require("geolib");
const { route } = require("./auth");

router.post(
  "/addnewvenue",
  [
    body("name")
      .isLength({ min: 3 })
      .withMessage("Name should be atleast 3 characters"),
    body("latitude")
      .isFloat()
      .withMessage("Latitude should be a Floating number"),
    body("longitude")
      .isFloat()
      .withMessage("Longitude should be a Floating number"),
    body("address")
      .isLength({ min: 3 })
      .withMessage("Address should be atleast 3 characters"),
    body("sports").isObject().withMessage("Sports should be a object"),
    body("availability")
      .isObject()
      .withMessage("Availability should be a object"),
    body("price").isNumeric().withMessage("Price should be a number"),
  ],
  async (req, res) => {
    const venue = await Venue.findOne({
      where: {
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        address: req.body.address,
        name: req.body.name,
      },
    });
    if (venue) {
      return res.status(400).json({ error: "Venue already exists" });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const NewVenue = await Venue.create({
      name: req.body.name,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      address: req.body.address,
      sports: req.body.sports,
      availability: req.body.availability,
      price: req.body.price,
    });
    NewVenue.save();
    return res.status(200).json({ message: "Venue added successfully" });
  }
);

router.get("/getnearbyvenues", async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (lat && lng) {
      console.log(`Latitude: ${lat}, Longitude: ${lng}`);
      const userLocation = {latitude : parseFloat(lat), longitude : parseFloat(lng)};
      const allVenues = await Venue.findAll();
      if (!allVenues) {
        return res.status(400).json({ error: "No venues found" });
      }
      else{
        const nearbyVenues = allVenues.filter( venue =>
            geolib.getDistance(userLocation, {
                latitude : venue.latitude,
                longitude : venue.longitude
            }) <= 1500  // distance is in meters
        )
        return res.status(200).json({ nearbyVenues: nearbyVenues });
      }
    } else {
      return res
        .status(400)
        .json({ error: "Please provide latitude and longitude" });
    }
  } catch (err) {
    console.error(err);
  }
});

router.get('/getallvenues', async(req,res)=>{
    try{
        const allVenues = await Venue.findAll()
        if (!allVenues){
            return res.status(400).json({error : "No venues found"})
        }
        return res.status(200).json({allVenues : allVenues})
    }catch(err)
    {
        console.error(err)
    }
})

router.get('/getvenue/:uuid', async(req,res)=>{
    const uuid = req.params.uuid
    try{
        const venue = await Venue.findOne({where : {uuid : uuid}})
        if (!venue)
        {
            return res.status(400).json({error : "Venue not found"})
        }
        return res.status(200).json({Venue : venue})
    }catch(err)
    {
        console.error(err)
    }
})



module.exports = router;
