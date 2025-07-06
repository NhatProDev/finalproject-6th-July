const express = require('express');
const router = express.Router();
const {verifyToken} = require('../middlewares/auth');
const mapAction = require('../action/mapAction');

// Create a new map
router.post('/', verifyToken, mapAction.createMap);
// Get all maps for the user
router.get('/', verifyToken, mapAction.getUserMaps);
// Get a specific map by ID
router.get('/:_id', verifyToken, mapAction.getMapById);
// Update a map by ID
router.put('/:_id', verifyToken, mapAction.updateMap);
// Delete a map by ID
router.delete('/:_id', verifyToken, mapAction.deleteMap);

module.exports = router;
// This code defines the routes for map-related actions in an Express application.