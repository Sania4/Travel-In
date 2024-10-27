const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../Models/listing.js");

main()
    .then ( () => {
        console.log("Connected to DataBase");
    })
    .catch((err) => {
        console.log(err)
    });

async function main() {
    const MONGO_URL = "mongodb://127.0.0.1:27017/Travel-In"
    await mongoose.connect(MONGO_URL)
}

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({...obj, owner: "6713bd3a0ba88cef5cd5b6d8"}))
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
};

initDB();