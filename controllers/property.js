const imageDownloader = require('image-downloader');
import { nanoid } from "nanoid";
import slugify from "slugify";
const fs = require('fs');
import Property from "../models/property";
const cloudinary = require('../utils/cloudinary');

export const uploadByLink = async (req, res) => {
    const {link} = req.body;
    const newName = 'photo' + Date.now() + '.jpg';
    await imageDownloader.image({
      url: link,
      dest: __dirname + '/uploads/' +newName,
    });
    res.json(newName);
}

export const upload = async (photos, res) => {
  try {
    let imagesBuffer = [];
    
    for (let i =0; i < photos.length;  i++){
      let imageUrl = photos[i].url;
      if (imageUrl.includes("http")) {
        imagesBuffer.push({
          public_id: null,
          url: imageUrl
        })
      } else {
        const result = await cloudinary.uploader.upload(imageUrl, {
          folder: "banners",
          width: 1920,
          crop: "scale"
        });
  
        imagesBuffer.push({
          public_id: result.public_id,
          url: result.secure_url
        })
      }

    }
    return imagesBuffer;

  } catch (error) {
    console.log(error);
    return res.status(400).send("Image upload failed. Try again.");
  }
}

export const create = async (req, res) => {
  try {
    const alreadyExist = await Property.findOne({
        slug: slugify(req.body.title.toLowerCase()),
    });
    if (alreadyExist) return res.status(400).send("Title is taken");
    
    if (req.body.photos = await upload(req.body.photos, res)) {
      req.body.refID = nanoid(6).toUpperCase();
      const property = await new Property({
        slug: slugify(req.body.title),
        partner: req.auth._id,
        ...req.body,
      }).save();

      res.json(property);
    }
  } catch (err) { 
    console.log(err);
    return res.status(400).send("Property create failed. Try again.");
  }
}

export const update = async (req, res) => {
    try {
      const { slug } = req.params;
      // console.log(slug);
      const property = await Property.findOne({ slug }).exec();
      // console.log("PROPERTY FOUND => ", property);
      if (req.auth._id != property.partner) {
        return res.status(400).send("Unauthorized");
      }
  
      const updated = await Property.findOneAndUpdate({ slug }, req.body, {
        new: true,
      }).exec();
  
      res.json(updated);
    } catch (err) {
      console.log(err);
      return res.status(400).send(err.message);
    }
};

export const read = async (req, res) => {
  try {
    const property = await Property.findOne({ slug: req.params.slug })
      .populate("partner", "_id name")
      .exec();
    res.json(property);
  } catch (err) {
    console.log(err);
  }
};

export const properties = async (req, res) => {
  const all = await Property.find({ published: true })
    .populate("partner", "_id name")
    .exec();
  res.json(all);
};
