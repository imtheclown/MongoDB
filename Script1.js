// used Node Modules
const request = require('request');
// project related constants
const mainURL = "https://demo.myruntime.com/sustainability-run/fulfillmentClustersService/api/getPhilClusterOptions/sustainabilityRun";
const firstURL = `https://demo.myruntime.com/website/fulfillmentClustersService/api/getPhilClusters/myruntimeWeb`
const municipality = "Miagao";
const province = "Iloilo";
// request for all the barangay in Miagao
function fetchBarangay() {
    request({
            url: `${mainURL}?parentOption=${province}&childOption=${municipality}`,
            method: "GET",
            agentOptions: {
                // evades the expired certificate error
                rejectUnauthorized: false
            }
        },
        // callback function
        function(err, res) {
            if (err) {
                console.log(err)
            } else {
                const result = JSON.parse(res.body).data
                result.forEach(barangay => {
                    console.log(barangay)
                })
            }
        });
}
// module exports
module.exports = { municipality, province, mainURL, firstURL, fetchBarangay }