const { MongoClient } = require("mongodb");
const uri = require("./atlas_uri");

const client = new MongoClient(uri);
const dbname = `bank`;
const connectToDatabase = async() => {
    try {
        await client.connect();
        console.log(`Connected to the ${dbname}`);
        console.log(client.db())
    } catch (err) {
        console.log(`Error connecting to the database ${err}`)
    }
}
const main = async() => {
    try {
        await connectToDatabase();
    } catch (err) {
        console.log(`Error connecting to the database: ${err}`);
    } finally {
        await client.close();
    }
}

main();