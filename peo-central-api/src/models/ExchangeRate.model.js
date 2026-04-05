const mongoose = require("mongoose");
const { paginate } = require("./plugins");

const exchangeRateSchema = new mongoose.Schema(
  {
    base: {
      type: String,
      default: "AED", // base currency
      required: true,
    },
    rates: {
      USD: { type: Number, required: true },
      EUR: { type: Number, required: true },
      AED: { type: Number, required: true },
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    
    is_deleted: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

exchangeRateSchema.plugin(paginate);
exchangeRateSchema.index({ base: 1, date: 1 }, { unique: true });

const ExchangeRate = mongoose.model("ExchangeRate", exchangeRateSchema);

module.exports = ExchangeRate;
