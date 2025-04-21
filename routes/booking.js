const express = require("express");
const messaging = require("../FirebaseAdmin/firebase");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { Booking, User, Venue } = require("../models");
const { Op } = require("sequelize");
const { route } = require("./auth");
const sendBookingConfirmNotification = require('../NotificationService/BookingConfirmNotificationService')
const sendBookingCancelNotification= require('../NotificationService/BookingCancellationNotificationService')

// First, we need to modify the addnewbooking route to check for overlapping times
// This function checks if two time ranges overlap
function doTimesOverlap(time1Start, time1End, time2Start, time2End) {
  return (time1Start < time2End && time1End > time2Start);
}

// Function to convert time string to minutes for easier comparison
function timeToMinutes(timeStr) {
  // Expecting format like "5-7am", "5:15am-6:15am", "5am-7pm", etc.
  const parts = timeStr.split('-');
  if (parts.length !== 2) return null;
  
  // If the second part doesn't have am/pm, inherit from first part
  if (!parts[1].toLowerCase().includes('am') && !parts[1].toLowerCase().includes('pm')) {
    // Check if first part has am or pm
    if (parts[0].toLowerCase().includes('am')) {
      parts[1] = parts[1] + 'am';
    } else if (parts[0].toLowerCase().includes('pm')) {
      parts[1] = parts[1] + 'pm';
    }
  }
  
  const start = parseTimeToMinutes(parts[0]);
  const end = parseTimeToMinutes(parts[1]);
  
  if (start === null || end === null) return null;
  
  // Handle cases where end time might be the next day
  if (end < start) {
    // If end time is earlier than start time, assume it's the next day (add 24 hours)
    return {
      start,
      end: end + 24 * 60
    };
  }
  
  return { start, end };
}

function parseTimeToMinutes(timeStr) {
  // Handle formats like "5am", "5:15am", "7pm", etc.
  if (!timeStr) return null;
  
  // Extract am/pm indicator
  let isPM = false;
  if (timeStr.toLowerCase().includes('pm')) {
    isPM = true;
  } else if (!timeStr.toLowerCase().includes('am')) {
    // If neither am nor pm is specified, return null
    return null;
  }
  
  // Remove am/pm and trim
  const timeOnly = timeStr.toLowerCase().replace('am', '').replace('pm', '').trim();
  
  let hours, minutes = 0;
  
  if (timeOnly.includes(':')) {
    const [h, m] = timeOnly.split(':');
    hours = parseInt(h, 10);
    minutes = parseInt(m, 10);
  } else {
    hours = parseInt(timeOnly, 10);
  }
  
  // Check for valid numbers
  if (isNaN(hours) || isNaN(minutes)) return null;
  
  // Handle edge cases
  if (hours < 0 || hours > 12 || minutes < 0 || minutes >= 60) return null;
  
  // Convert to 24-hour format
  if (isPM && hours < 12) hours += 12;
  if (!isPM && hours === 12) hours = 0;
  
  return hours * 60 + minutes;
}

// Modify the addnewbooking route to include this validation
router.post(
  "/addnewbooking",
  [
    // Existing validations...
  ],
  async (req, res) => {
    try {
      const user = await User.findOne({ where: { email: req.body.userEmail } });
      if (!user) {
        return res.status(400).json({ error: "User not found" });
      }
      
      const venue = await Venue.findOne({ where: { name: req.body.venueName } });
      if (!venue) {
        return res.status(400).json({ error: "Venue not found" });
      }
      
      const formattedBookingDate = new Date(req.body.bookingDate).toISOString();
      
      // Get the requested time window
      const requestedTime = timeToMinutes(req.body.bookingTime);
      if (!requestedTime) {
        return res.status(400).json({ error: "Invalid booking time format. Please use format like '5am-7am', '5:15am-6:15pm', etc." });
      }
      
      // Find all confirmed bookings for the same venue and date
      const existingBookings = await Booking.findAll({
        where: {
          venueName: req.body.venueName,
          bookingDate: formattedBookingDate,
          status: "Confirmed"
        }
      });
      
      // Check for time overlaps with existing confirmed bookings
      for (const booking of existingBookings) {
        const existingTime = timeToMinutes(booking.bookingTime);
        if (existingTime && doTimesOverlap(
          requestedTime.start, requestedTime.end,
          existingTime.start, existingTime.end
        )) {
          return res.status(400).json({ 
            error: "This venue already has a confirmed booking that overlaps with your requested time" 
          });
        }
      }
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const NewBooking = await Booking.create({
        userEmail: req.body.userEmail,
        fullName: req.body.fullName,
        contactNo: req.body.contactNo,
        sportType: req.body.sportType,
        date: new Date(),
        bookingDate: req.body.bookingDate,
        bookingTime: req.body.bookingTime,
        venueName: req.body.venueName,
        venueId: venue.uuid,
        totalAmount: req.body.totalAmount,
        status: "Pending"
      });
      
      NewBooking.save();
      return res.status(200).json({ message: NewBooking, userDetails: user });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Now modify the confirmbooking route to also check for time overlaps
router.put('/confirmbooking/:uuid', async(req, res) => {
  try {
    const { status } = req.body;
    if (status !== "Confirmed" && status !== "Rejected") {
      return res.status(400).json({ error: "Invalid Status" });
    }
    
    const bookingid = req.params.uuid;
    const booking = await Booking.findOne({ where: { uuid: bookingid } });
    if (!booking) {
      return res.status(400).json({ error: "No booking found" });
    }
    
    const venue = await Venue.findOne({ where: { uuid: booking.venueId } });
    if (!venue) {
      return res.status(400).json({ error: "No Venue found" });
    }
    
    if (status === "Confirmed") {
      // Before confirming, check for time overlaps with existing confirmed bookings
      const requestedTime = timeToMinutes(booking.bookingTime);
      if (!requestedTime) {
        return res.status(400).json({ 
          error: "Invalid booking time format in the existing booking. Please ensure format is like '5am-7am' or '5:15am-6:15pm'" 
        });
      }
      
      // Find all other confirmed bookings for the same venue and date
      const existingBookings = await Booking.findAll({
        where: {
          venueName: booking.venueName,
          bookingDate: booking.bookingDate,
          status: "Confirmed",
          uuid: { [Op.ne]: bookingid } // Exclude the current booking
        }
      });
      
      // Check for time overlaps
      for (const existingBooking of existingBookings) {
        const existingTime = timeToMinutes(existingBooking.bookingTime);
        if (existingTime && doTimesOverlap(
          requestedTime.start, requestedTime.end,
          existingTime.start, existingTime.end
        )) {
          return res.status(400).json({ 
            error: "Cannot confirm this booking as it overlaps with an existing confirmed booking" 
          });
        }
      }
      
      await Booking.update({ status: "Confirmed" }, { where: { uuid: bookingid } });
      await Venue.update({ status: "Booked" }, { where: { uuid: venue.uuid } });
      await sendBookingConfirmNotification(booking.userEmail, booking.bookingDate, booking.bookingTime, booking.venueName);
      return res.status(200).json({ message: "Booking confirmed" });
    }
    
    if (status === "Rejected") {
      await Booking.update({ status: "Rejected" }, { where: { uuid: bookingid } });

      // Check other bookings for same venue with confirmed status
      const otherConfirmBookings = await Booking.findOne({
        where: {
          venueId: booking.venueId,
          status: "Confirmed",
        }
      });

      if (!otherConfirmBookings) {
        await Venue.update({ status: "Available" }, { where: { uuid: venue.uuid } });
      }
      return res.status(200).json({ message: "Booking rejected" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/getallbookings", async (req, res) => {
  try {
    const bookings = await Booking.findAll();
    if (!bookings) {
      return res.status(400).json({ error: "No bookings found" });
    }
    return res.status(200).json({ Bookings: bookings });
  } catch (err) {
    console.error(err);
  }
});

router.get("/getbooking/:uuid", async (req, res) => {
  try {
    const bookingid = req.params.uuid;
    const booking = await Booking.findOne({ where: { uuid: bookingid } });
    if (!booking) {
      return res.status(400).json({ error: "No booking found" });
    }
    return res.status(200).json({ Booking: booking });
  } catch (err) {
    console.error(err);
  }
});

router.get("/getuserbookings/:email", async (req, res) => {
  try {
    const userEmail = req.params.email;
    const user = await User.findOne({ where: { email: userEmail } });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    const bookings = await Booking.findAll({ where: { userEmail: userEmail } });
    if (!bookings) {
      return res.status(400).json({ error: "No bookings found" });
    }
    return res.status(200).json({ Bookings: bookings });
  } catch (err) {
    console.error(err);
  }
});

router.get('/getadminbookings/:email', async(req,res)=>{
  try{
    const adminemail = req.params.email
    const admin = await User.findOne({where:{email:adminemail}})
    if(!admin)
    {
      return res.status(400).json({error:"Admin not found"})
    }
    const venue = await Venue.findOne({where:{ownerId:admin.uuid}})
    if(!venue)
    {
      return res.status(400).json({error:"No venue found associated with this admin"})
    }
    const bookings = await Booking.findAll({where:{venueId:venue.uuid}})
    if(!bookings)
    {
      return res.status(400).json({error:"No bookings found"})
    }
    return res.status(200).json({ Bookings: bookings });
  }catch(error)
  {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
})

router.get("/getbookingcount/:email", async (req, res) => {
  try {
    const adminemail = req.params.email;
    const admin = await User.findOne({ where: { email: adminemail } });
    if (!admin) {
      return res.status(400).json({ error: "Admin not found" });
    }
    const venue = await Venue.findOne({ where: { ownerId: admin.uuid } });
    if (!venue) {
      return res.status(400).json({ error: "No venue found associated with this admin" });
    }
    const bookingsTotal = await Booking.findAll({where: { venueId: venue.uuid }});
    if (bookingsTotal.length === 0) {
      return res.status(400).json({ error: "No bookings found" });
    }
    const bookingCountTotal = bookingsTotal.length
    const bookingCountPending = bookingsTotal.filter(booking => booking.status === "Pending").length;
    return res.status(200).json({
      BookingCountTotal: bookingCountTotal,
      bookingCountPending: bookingCountPending,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/getbookingbystatus/:email", async (req, res) => {
  try {
    const status = req.query.status;
    if (
      status !== "Pending" &&
      status !== "Confirmed" &&
      status !== "Rejected"
    ) {
      return res.status(400).json({ error: "Invalid Status" });
    }
    const adminemail = req.params.email;
    const admin = await User.findOne({ where: { email: adminemail } });
    if (!admin) {
      return res.status(400).json({ error: "Admin not found" });
    }
    const venue = await Venue.findOne({ where: { ownerId: admin.uuid } });
    if (!venue) {
      return res.status(400).json({ error: "No venue found associated with this admin" });
    }
    const bookings = await Booking.findAll({ where: { status: status, venueId : venue.uuid } });
    if (!bookings) {
      return res.status(400).json({ error: "No bookings found" });
    }
    return res.status(200).json({ Bookings: bookings });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put("/cancelbookinguser/:uuid", async (req, res) => {
  try {
    const bookingId = req.params.uuid
    const {userEmail} = req.body
    const booking = await Booking.findOne({ where: { uuid: bookingId } });
    if (!booking) {
      return res.status(404).json({ error: "No booking found" });
    }
    if (booking.userEmail !== userEmail)
    {
      return res.status(403).json({ error: "You can only cancel your own bookings" });
    }
    if (booking.status === 'Rejected')
    {
      return res.status(400).json({ error: "This booking is already cancelled" });
    }
    await Booking.update({
      status :'Rejected'
    }, {where : {uuid : bookingId}})

    if (booking.status === "Confirmed") {
      const venue = await Venue.findOne({ where: { uuid: booking.venueId } });
      if (venue) {
        // Check if there are other confirmed bookings for this venue
        const otherConfirmedBookings = await Booking.findOne({
          where: {
            venueId: booking.venueId,
            status: "Confirmed",
            uuid: { [Op.ne]: bookingId } // Exclude the current booking
          }
        });
        
        if (!otherConfirmedBookings) {
          // If no other confirmed bookings, set venue to Available
          await Venue.update({ status: "Available" }, { where: { uuid: venue.uuid } });
        }
      }
    }
    sendBookingCancelNotification(booking.userEmail, booking.bookingDate, booking.bookingTime, booking.venueName)
    return res.status(200).json({ message: "Booking cancelled successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put('/cancelbookingadmin/:uuid',async(req,res)=>{
  try {
    const bookingId = req.params.uuid;
    const { adminEmail } = req.body;
    
    // Verify admin
    const admin = await User.findOne({ where: { email: adminEmail } });
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }
    
    // Find the booking
    const booking = await Booking.findOne({ where: { uuid: bookingId } });
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    
    // Find venue associated with admin
    const venue = await Venue.findOne({ where: { ownerId: admin.uuid } });
    if (!venue) {
      return res.status(403).json({ error: "No venue associated with this admin" });
    }
    
    // Check if booking belongs to admin's venue
    if (booking.venueId !== venue.uuid) {
      return res.status(403).json({ error: "You can only cancel bookings for your own venues" });
    }
    
    // Check if booking is already rejected
    if (booking.status === "Rejected") {
      return res.status(400).json({ error: "Booking is already cancelled" });
    }
    
    // Update booking status to Rejected and add cancellation reason if provided
    const updateData = { 
      status: "Rejected"
    };
    
   
    
    await Booking.update(updateData, { where: { uuid: bookingId } });
    
    // Update venue status if needed
    if (booking.status === "Confirmed") {
      // Check if there are other confirmed bookings for this venue
      const otherConfirmedBookings = await Booking.findOne({
        where: {
          venueId: booking.venueId,
          status: "Confirmed",
          uuid: { [Op.ne]: bookingId } // Exclude the current booking
        }
      });
      
      if (!otherConfirmedBookings) {
        // If no other confirmed bookings, set venue to Available
        await Venue.update({ status: "Available" }, { where: { uuid: venue.uuid } });
      }
    }
    
    // You could notify the user about the cancellation
      sendBookingCancelNotification(booking.userEmail, booking.bookingDate, booking.bookingTime, booking.venueName);
    
    return res.status(200).json({ 
      message: "Booking cancelled successfully",
      booking: booking
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
})
module.exports = router;
