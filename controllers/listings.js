// const Listing = require("../models/listing");
// const mbxGeoCoding = require("@mapbox/mapbox-sdk/services/geocoding");
// const mapToken = process.env.MAP_TOKEN;
// const geocodingClient = mbxGeoCoding({ accessToken: mapToken });

// module.exports.index = async (req, res) => {
//   const allListings = await Listing.find({});
//   res.render("listings/index.ejs", { allListings });
// };

// module.exports.renderNewForm = (req, res) => {
//   res.render("listings/new.ejs");
// };

// module.exports.showListing = async (req, res) => {
//   let { id } = req.params;
//   const listing = await Listing.findById(id)
//     .populate({
//       path: "reviews",
//       populate: {
//         path: "author",
//       },
//     })
//     .populate("owner");
//   if (!listing) {
//     req.flash("error", "Listing you requested for does not exist!");
//     return res.redirect("/listings");
//   }
//   console.log(listing);
//   res.render("listings/show.ejs", { listing });
// };

// module.exports.createListing = async (req, res, next) => {
//   let response= await geocodingClient
//     .forwardGeocode({
//       query: req.body.listing.location,
//       limit: 1,
//     })
//     .send();

//  // let url = req.file.path;
//  // let filename = req.file.filename;

//   const newListing = new Listing(req.body.listing);
//   newListing.owner = req.user._id;
//   newListing.image = {
//     url: url,
//     filename: filename,
//   };
//   newListing.geometry = response.body.features[0].geometry;

//   let savedListing = await newListing.save();
//   console.log(savedListing);

//   req.flash("success", "New Listing Created");
//   return res.redirect("/listings");
// };

// module.exports.renderEditForm = async (req, res) => {
//   let { id } = req.params;
//   const listing = await Listing.findById(id);
//   if (!listing) {
//     req.flash("error", "Listing you requested for does not exist!");
//     return res.redirect("/listings");
//   }

//   let originalImageUrl = listing.image.url;
//   originalImageUrl.replace("./upload", "/upload/h_300,w_250");
//   res.render("listings/edit.ejs", { listing, originalImageUrl });
// };

// module.exports.updateListing = async (req, res) => {
//   let { id } = req.params;

//   let newData = req.body.listing;
//   let oldListing = await Listing.findById(id);

//   if (!newData.description || newData.description.trim() === "") {
//     newData.description = oldListing.description;
//   }

//   if (!newData.image || !newData.image.url || newData.image.url.trim() === "") {
//     newData.image = oldListing.image;
//   }

//   //await Listing.findByIdAndUpdate(id, newData, { runValidators: true });
//   let listing = await Listing.findByIdAndUpdate(id, newData, {
//     ...req.body.listing,
//   });

//   if (typeof req.file !== "undefined") {
//     let url = req.file.path;
//     let filename = req.file.filename;
//     listing.image = {
//       url: url,
//       filename: filename,
//     };
//     await listing.save();
//   }

//   req.flash("success", "Listing Updated!");
//   res.redirect(`/listings/${id}`);
// };

// module.exports.destroyListing = async (req, res) => {
//   let { id } = req.params;
//   await Listing.findByIdAndDelete(id);

//   req.flash("success", "Listing Deleted!");
//   res.redirect("/listings");
// };


const Listing = require("../models/listing");
const mbxGeoCoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeoCoding({ accessToken: mapToken });

// ======================
// INDEX
// ======================
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

// ======================
// NEW FORM
// ======================
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// ======================
// SHOW
// ======================
module.exports.showListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
};

// ======================
// CREATE ✅ FIXED
// ======================
module.exports.createListing = async (req, res) => {
  // 🌍 MAPBOX
  const geoResponse = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  const newListing = new Listing(req.body.listing);

  // 🔥 IMAGE (FIX)
  if (req.file) {
    newListing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  newListing.owner = req.user._id;
  newListing.geometry = geoResponse.body.features[0].geometry;

  await newListing.save();

  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

// ======================
// EDIT FORM
// ======================
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }

  const originalImageUrl = listing.image.url.replace(
    "/upload",
    "/upload/h_300,w_250"
  );

  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

// ======================
// UPDATE
// ======================
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findByIdAndUpdate(
    id,
    { ...req.body.listing },
    { new: true, runValidators: true }
  );

  // 🔥 Update image only if new file uploaded
  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

// ======================
// DELETE
// ======================
module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);

  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
