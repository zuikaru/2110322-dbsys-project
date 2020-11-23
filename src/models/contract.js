const mongoose = require("mongoose");

const toObjectOption = {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    // eslint-disable-next-line no-underscore-dangle
    delete ret._id;
  }
};

const contractSchema = new mongoose.Schema(
  {
    contract_id: Number,
    contract_information: String,
    contract_price: Number,
    due_date: Date,
    detail: String,
    request: {
      request_id: Number,
      detail: String,
      date: Date,
      customer: {
        general_user_id: Number,
        name: String
      },
      content_creator: {
        general_user_id: Number,
        name: String
      }
    },
    review: {
      review_id: Number,
      comment: String,
      rating: Number
    },
    tasks: [
      {
        task_id: Number,
        description: String,
        date: Date,
        files: [
          {
            file_id: Number,
            type: String,
            date: Date,
            image_url: String
          }
        ]
      }
    ],
    payment_slips: [
      {
        payment_id: Number,
        date: Date,
        amount: Number,
        image_url: String,
        finaicial_admin: {
          admin_id: Number,
          name: String
        }
      }
    ]
  },
  {
    timestamps: true,
    toObject: toObjectOption,
    toJSON: toObjectOption,
    collation: { locale: "th" }
  }
);

module.exports = mongoose.model("Contract", contractSchema);
