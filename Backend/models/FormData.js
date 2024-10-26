const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  filePath: { type: String, required: true }
});

const formDataSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  dob: { type: Date, required: true },
  residentialAddress: { type: Object, required: true },
  sameAsResidential: { type: Boolean, required: true },
  permanentAddress: { type: Object, required: true },
  documents: { type: [documentSchema], required: true } 
});

module.exports = mongoose.model('FormData', formDataSchema);
