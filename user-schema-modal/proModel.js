
const mongoose = require('mongoose')

const proSchema = new mongoose.Schema({
    HTML: { type: String, require: false },
    CSS: { type: String, require: false },
    JS: { type: String, require: false },
    userID: { type: String, require: true },
  });
  
  // Modal
  const projectModal = mongoose.model("projects", proSchema);

  module.exports = projectModal;