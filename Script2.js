// imported custom modules
const { csvCreator } = require("./CSVFileWriter")
const { province, municipality, firstURL, mainURL } = require("./Script1");
const { axiosPromiseCreator } = require("./AxiosInstance")
const { axiosInstance } = require("./AxiosInstance")
    //
const filename = `Script2.csv`
    // endpoints for API call
const endpoints = [
        `${mainURL}?parentOption=${province}&childOption=${municipality}`,
        `${firstURL}`
    ]
    // returns an axios request promise given the endpoint
function axiosPromise(province, municipality) {
    // create a list of promises
    const newPromiseList = endpoints.map(endpoint => {
            return axiosPromiseCreator(endpoint);
        })
        // executes all the generated promises
        // if at least one fails, the process fails
    Promise.all(newPromiseList)
        // creates CSV file
        .then(res => {
            console.log(`attempt to get data from the ${newPromiseList.length} API endpoints is successful`)
            if (res) {
                csvCreator(res[0], res[1], filename, province, municipality);
            }
        }).catch(() => {
            console.log("Failed to retrieve all the required information")
        })
}

module.exports = { axiosPromise, axiosPromiseCreator }