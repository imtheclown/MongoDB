const { firstURL } = require("./constants")
const { barangayInProvinceGetter } = require("./FirstStretch")
const { axiosPromiseCreator } = require("./AxiosInstance")

async function SecondStretch() {
    // retrieves list of provinces
    const provinces = await axiosPromiseCreator(firstURL).then(res => {
            if (res && res.data && res.data.data) {
                if (res.data.data["parentOptions"]) {
                    return res.data.data["parentOptions"]
                }
            }
        }).catch(error => {
            if ((error.message).includes("timeout")) {
                console.log("There has been a connection error");
            }
        })
        // storage arrays
    const resultArray = []
    const errorArray = []
        // loop through the array to get barangays in each province
    for (key in provinces) {
        // returns object in form {result[], error[]}
        // successful query of provinces means all province is present and thus can be identified by the index
        await barangayInProvinceGetter(provinces[key], key)
            .then(res => {
                if (res && res.result) {
                    res.result.forEach(element => {
                        resultArray.push(element);
                    });
                    resultArray.push(...res.result);
                    errorArray.push(...res.error);
                }
            }).catch(err => {
                resultArray.push([])
                console.log(err.response)
            })
    }
    return {
        "result": resultArray,
        "error": errorArray
    }
}

module.exports = { SecondStretch }