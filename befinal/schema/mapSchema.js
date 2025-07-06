const mongoose = require('mongoose');

const nodeSchema = new mongoose.Schema({
    id: {type: String, required: true},
    label: {type: String},
    position: {
        x: {type: Number, required: true},
        y: {type: Number, required: true}
    },
    note: {type: mongoose.Schema.Types.ObjectId, ref: 'Note'}
});

const connectionSchema = new mongoose.Schema({
    from: {type: String, required: true}, // node.id
    to: {type: String, required: true} // node.id
    
    //Thi s code is for connecting node to node and retrieve by using node.id
});

// the main Schema
const mapSchema = new mongoose.Schema({
    title: {type: String, default: "New map"},
    description: {type: String},
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    participants: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    nodes: [nodeSchema], // retrieve the nodeSchema
    connections: [connectionSchema], // retrieve the connection SChema
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Map', mapSchema);