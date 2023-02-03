import User from "../models/user";
import Property from "../models/property";

export const partnerProperties = async (req, res) => {
    try {
      const properties = await Property.find({ partner: req.auth._id })
        .populate("partner", "name")
        .sort({ createdAt: -1 })
        .exec();
      res.json(properties);
    } catch (err) {
      console.log(err);
    }
};