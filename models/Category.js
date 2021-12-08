const mongoose = require("mongoose");

const CatogorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    Photo: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", CatogorySchema);
