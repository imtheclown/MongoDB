const { default: mongoose, Mongoose } = require("mongoose");

const ProvinceSchema = new mongoose.Schema({
    name: String,
    _id: String,
})

const MunicipalitySchema = new mongoose.Schema({
    province_id: {
        type: String,
        ref: 'Provinces'
    },
    name: String,
    _id: String
})

const BarangaySchema = new mongoose.Schema({
    province_id: {
        type: String,
        ref: 'Provinces'
    },
    municipality_id: {
        type: String,
        ref: 'Municipalities'
    },
    name: String,
    _id: String
})

const ProvinceModel = new mongoose.model('Provinces', ProvinceSchema)
const MunicipalityModel = new mongoose.model('Municipalities', MunicipalitySchema)
const BarangayModel = new mongoose.model('Barangays', BarangaySchema)

module.exports = {
    ProvinceModel,
    MunicipalityModel,
    BarangayModel
}