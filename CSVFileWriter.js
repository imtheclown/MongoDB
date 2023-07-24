// imported modules
const csv = require("@fast-csv/format");
const fs = require("fs");
const path = require("path");

function csvCreator(array1, array2, filename, province, municipality){
    // checks if actual parameters has the required properties
    if(array1.data && array2.data){
        array1 = array1.data;
        array2 = array2.data
        if(array2.data && array2.data.childOptions){
            //checks if municipality exists in the list of municipality by province
            let munID;
            const provinceList = array2.data.childOptions[`${province}`]
            // determines the index of the municipality
            for(key in provinceList){
                if(provinceList[key] === `${municipality}`){
                    munID = key;
                }
            }
            //municipality does exist in the specified province and array1 has data property
            if(munID && array1.data){
                let barangayList = []
                const municipalList = array1.data
                // list of objects are used for automated detection of headers
                for(key in municipalList){
                    barangayList.push(
                        {"id":key.toString(), "name":municipalList[key], "parentID":munID.toString()}
                    );
                }
                // creates a csv file if barangayList is not empty
                if(barangayList.length >0){
                    // sets header to true:
                    // since entries in muncipalList is of type object, headers will be auto-generated
                    writeToCSV(barangayList, filename)
                        .then(()=>{
                            console.log(`${filename} created successfully`)
                        }).catch(()=>{
                            console.log(`Unable to create file ${filename} `)
                    })

                }
            }
        }else{
            console.log(`Parameter Array1 or Array2 has missing property`)
        }
    }
}

function writeToCSV(arrayParam, filename){
    return new Promise(
        (res, reject) =>{
            csv.writeToStream(fs.createWriteStream(path.resolve(__dirname, `CSVFile`, filename )),
                arrayParam, {headers:true, includeEndRowDelimiter:true})
                .on('error', err => {
                    reject(err)
                })
                .on('finish', () => res())
        })
}

module.exports = {csvCreator, writeToCSV}
