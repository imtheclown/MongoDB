const { MongoClient } = require("mongodb");
const { default: mongoose } = require("mongoose");
// Replace the uri string with your connection string.
const uri = "mongodb+srv://jccalugas:Hello-World14@practicecluster.fvlgq6r.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri);


const kittySchema = new mongoose.Schema({
    name: String
})

const Kitten = mongoose.model('Kitten', kittySchema);
main().then(res => {
        console.log(res)
    })
    .catch(err => {
        console.log(err);
    })
async function main() {
    await mongoose.connect(uri);
    const kittens = await Kitten.find({ name: /^fluff/i })
    console.log(kittens)
}