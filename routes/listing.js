const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require('multer');

const{storage} = require("../cloudConfig.js");
const upload = multer({storage});

router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single('listing[image]'),
     validateListing,
    wrapAsync(listingController.createListing)
  );
//New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);


// 🔍 SEARCH — MUST BE ON TOP
router.get("/search", wrapAsync(async (req, res) => {
  const { q } = req.query;

  const allListings = await Listing.find({
    title: { $regex: q, $options: "i" }
  });

  return res.render("listings/index.ejs", { allListings });
}));


// router.get("/filter", async (req, res) => {
//   const { category } = req.query;

//   const allListings = await Listing.find({ category });

//   res.render("listings/index", { allListings });
// });


// // 🧾 SHOW SINGLE LISTING
// router.get("/:id", async (req, res) => {
//   const listing = await Listing.findById(req.params.id);
//   res.render("listings/show", { listing });
// });



router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

//Edit Route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;
