/*
Notes:
    Provinces and municipalities saved in the database are based on the returned value of the second stretch
    Meaning if a parentOption and childOption combination returns an error(e.g. no barangay is returned), the municipality will not be saved
*/
// connection string
const uri = "mongodb+srv://jccalugas:Hello-World14@practicecluster.fvlgq6r.mongodb.net/test?retryWrites=true&w=majority";
// necessarry modules
const { default: mongoose, Mongoose } = require("mongoose");
// custom module
const { SecondStretch } = require("./SecondStretch")
    // models
const { ProvinceModel, BarangayModel, MunicipalityModel } = require("./SchemaModel");
const { response } = require("express");

// creates id based on specified format
function createID(province_id = null, municipality_id = null, barangay_id = null) {
    let final_ID = ""
        // province id format: xxxx
    if (province_id !== null) {
        final_ID += idCorrector(province_id);
    }
    // municipality id format: xxxx-yyyy
    if (municipality_id !== null) {
        final_ID = `${final_ID}-${idCorrector(municipality_id)}`
    }
    // barangay id format: xxxx-yyyy-zzzz
    if (barangay_id !== null) {
        final_ID = `${final_ID}-${idCorrector(barangay_id)}`
    }
    return final_ID;
}
// creates a formatted id
function idCorrector(id) {
    return `${("0").repeat(4-id.toString().length)}${id}`
}
// if barangay does not exists, creates and insert a document of the barangay
// if province does not exists then creates a document for the province
// if municipality does not exists then creates a document for the municipality
async function insertBarangayToDB(barangayList) {
    // keeps track of province id and municipality id in the loop
    let province_id;
    let municipality_id;
    let barangay_id;
    // iterates through all the queried barangays
    for (const index in barangayList) {
        // for convenience
        const barangay = barangayList[index]
            // list of barangays introduces a new province
        if (province_id !== barangay["province_index"]) {
            // update the current province_id
            province_id = barangay["province_index"]
                // create a new for character id for province
            const newProvID = createID(province_id)
                // creates and insert a new province document
            await findAndInserDocument(ProvinceModel, newProvID, barangay, 0).then(response => {
                // successful insertion
                console.log(response)
            }).catch(error => {
                // failed insertion
                console.log(error)
            })
        }
        // there is a new municipality
        if (municipality_id !== barangay["municipality_index"]) {
            // for convenience
            municipality_id = barangay["municipality_index"]
                // create a 9 character long id for the municipality
            const newMunicipalityID = createID(province_id, municipality_id)
                // create and insert a new municipality document
            await findAndInserDocument(MunicipalityModel, newMunicipalityID, barangay, 1).then(response => {
                // successful insertion
                console.log(response)
            }).catch(error => {
                // failed insertion
                console.log(error)
            })

        }
        // for convenience
        barangay_id = barangay["barangay_index"]
            // create a 14 character long id for the barangay
        const newBrgyID = createID(province_id, municipality_id, barangay_id)
            // create and insert a new barangay document
        await findAndInserDocument(BarangayModel, newBrgyID, barangay, 2).then(response => {
            // successful insertion
            console.log(response)
        }).catch(error => {
            // failed insertion
            console.log(error)
        })
    }
}

// creates and inserts document specified by the model parameter
async function insertDocumentInDB(model, data) {
    // create a new instance of the model
    const newModelInstance = new model(data);
    // save the document in the database
    await newModelInstance.save().then((response) => {
        // return 1 for successful insertion
        return Promise.resolve(response)
    }).catch(error => {
        console.log(error);
        // return 0 for failed insertion
        return Promise.reject(error)
    })
}
// determines if document exists and if it does not creates a new document and insert it to the specified model
async function findAndInserDocument(model, documentID, barangayData, type) {
    // checks if document is present
    const present = await model.findById(documentID).then(response => {
            if (response === null) {
                // document is not found
                return Promise.resolve(0)
            } else {
                // document is found
                return Promise.resolve(1)
            }
        })
        // stores the type of the model
    let literalType;
    // determines the parameter type
    type === 0 ? literalType = 'Province' :
        type === 1 ? literalType = 'Municipality' :
        literalType = 'Barangay'
        // document is not present in the collection
    if (!present) {
        // creates a data based on schema of the model specified in the parameter
        const data = dataCreator(type, barangayData, documentID)
            // insert document in the database
        await insertDocumentInDB(model, data).then(() => {
                // successful insertion
                console.log(`${literalType} ${barangayData[literalType.toLowerCase()]} was successfully inserted to the database`)
                    // returns a resolve value of 1 :True
                return Promise.resolve(1)
            }).catch(error => {
                // failed insertion
                console.log(error)
                console.log(`Inserting document ${literalType} ${barangayData[literalType.toLowerCase()]} to the database failed`)
                    // returns a resolve value of 0: False/Failed
                return Promise.resolve(0)

            })
            // document is already present
    } else {
        console.log(`${literalType} ${barangayData[literalType.toLowerCase()]} is already in the database`)
            // returns a resolve value of -1 
        return Promise.resolve(-1)
    }


}
// creates and return a key value pair based on the schema defined by the model
function dataCreator(type, barangayData, documentID) {
    // inserts the _id of the document
    let data = {
            _id: documentID
        }
        // for province model
    if (type === 0) {
        data["name"] = barangayData["province"]
            // for municipality model
    } else if (type == 1) {
        data["name"] = barangayData["municipality"]
        data["province_id"] = createID(barangayData["province_index"])
            // for barangay model
    } else if (type == 2) {
        data["name"] = barangayData["barangay"]
        data["municipality_id"] = createID(barangayData["province_index"], barangayData["municipality_index"])
        data["province_id"] = createID(barangayData["province_index"])
    }
    // returns the generated data
    return data
}

// makes this js script independent of the index.js
async function main() {
    // retrieves the list of all the barangays in the Philippines
    console.log("Getting data from the API")
    const barangayList = await SecondStretch()
        .then(response => {
            return response["result"]
        }).catch(error => {
            console.log(error.message)
            console.log("failed to get the barangayList")
        })
        // mongoose connects to the Mongo Database
    await mongoose.connect(uri).then(response => {
            console.log("Connected to Mongo Database");

        }).catch((error) => {
            console.log(error.message)
        })
        // insert each of the barangays in the database
    await insertBarangayToDB(barangayList).then(() => {
            // no problem encountered
            console.log("All are saved")
        }).catch((error) => {
            // encountered some problem
            console.log(error.message)
            console.log("error saving in database")
        })
        // closes the mongoose connection
    mongoose.connection.close();
}
main()