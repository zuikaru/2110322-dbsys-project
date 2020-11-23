const mongoose = require("mongoose");

const toObjectOption = {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    // eslint-disable-next-line no-underscore-dangle
    delete ret._id;
  }
};

const userSchema = new mongoose.Schema(
  {
    user_id: Number,
    username: String,
    name: String,
    citizen_id: String,
    email: [String],
    address: [String],
    phone_number: [String]
  },
  {
    timestamps: true,
    toObject: toObjectOption,
    toJSON: toObjectOption,
    collation: { locale: "th" }
  }
);

module.exports = mongoose.model("User", userSchema);
