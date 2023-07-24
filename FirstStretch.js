const { axiosInstance } = require("./AxiosInstance")
const { firstURL, mainURL } = require("./Script1")
const { writeToCSV } = require("./CSVFileWriter")
const { axiosPromiseCreator } = require("./Script2")
    // program related constants
const filename = "FirstStretch.csv"

async function firstStretch(province) {
    await barangayInProvinceGetter(province).then(res => {
        writeToCSV(res["result"], filename).then(() => {
            console.log("barangays saved successfully")
        }).catch(err => {
            console.log(err)
        })
        writeToCSV(res["error"], `err${filename}`).then(() => {
            console.log("failed child and parent options are saved");
        }).catch(err => {
            console.log(err)
        })
    })

}
// returns an array of object of barangays
async function barangayInProvinceGetter(province, parentKey) {
    return new Promise((resolve, reject) => {
        // retrieves municipalities of a given province
        axiosPromiseCreator(firstURL).then(res => {
            if (res && res.data) {
                if (res.data.data && res.data.data.childOptions) {
                    // stores the municipalities of a given province
                    let childOptions = res.data.data.childOptions;
                    childOptions = childOptions[`${province}`];
                    // calls a function that retrieves barangays for each municipality of the province
                    getEachBarangay(childOptions, province)
                        .then(res => {
                            const resultArray = [];
                            const erroneousArray = []
                                // for each province
                            for (key in res) {
                                if (res[key].successful) {
                                    // for each municipality in province
                                    for (innerKey in res[key].data) {
                                        resultArray.push({
                                            "province": province,
                                            // index of the province
                                            "province_index": parentKey,
                                            "municipality": res[key]["municipality"],
                                            // index of the municipality
                                            "municipality_index": key,
                                            // index of the barangay
                                            "barangay": res[key]["data"][innerKey],
                                            "barangay_index": innerKey,
                                        })
                                    }
                                } else {
                                    erroneousArray.push({
                                        "province": province,
                                        "municipality": res[key]["municipality"]
                                    })
                                }

                            }
                            console.log(`Finished: ${province}`)
                            resolve({
                                "result": resultArray,
                                "error": erroneousArray,
                            })
                        }).catch(err => {
                            console.log("something went wrong")
                            reject(err)
                        })
                } else {
                    console.log("may error")
                }
            }
        }).catch(err => {
            console.log(err)
        })
    })


}

async function getEachBarangay(arrayParam, province) {
    const result = []
    const error = []
        // creates a promise for each combination of province and municipality
    const promiseList = arrayParam.map(municipality => {
            return new Promise((resolve, reject) => {
                axiosInstance({
                    method: "GET",
                    url: `${mainURL}?parentOption=${province}&childOption=${municipality}`.replace(" ", "%20"),
                }).then(res => {
                    // if data retrieval is successful
                    resolve({
                        "data": res.data.data,
                        "province": province,
                        "municipality": municipality,
                        "successful": true
                    })
                }).catch(err => {
                    // if data retrieval is successful
                    if (err.response) {
                        resolve({
                            "successful": false,
                            "municipality": municipality
                        })
                    } else if (err.request) {
                        console.log("failure")
                        console.log(err.request)
                        reject(err)
                    } else {
                        console.log("failure")
                        reject(err)
                    }
                })
            })
        })
        // executes and waits for each of the generated promise above
    for (promise in promiseList) {
        await promiseList[promise].then(res => {
            result.push(res)
        }).catch(() => {
            console.log(error)
        })
    }
    // returns the list of barangays of type object
    return result
}

module.exports = { barangayInProvinceGetter, firstStretch }