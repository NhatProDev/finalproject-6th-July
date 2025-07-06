const Map = require('../schema/mapSchema');

exports.createMap = async (req, res)=>{
    try {
        const {title, description, participants, nodes, connections} = req.body;
        const map = await Map.create({
            title,
            description,
            owner: req.user._id,
            participants: participants || [], // or empty set
            nodes: nodes || [], // or empty set
            connections: connections || []
        });
        res.status(201).json(map)
    } catch (err){
        console.log('create Map failed: ', err);
        res.status (500).json({message: 'Create failed'});
    }
};

exports.getUserMaps = async (req, res)=>{
    try{
        const maps = await Map.find ({
            $or:[
                {owner: req.user._id},
                {participants: req.user._id}
            ]
        }).populate('owner participants nodes.note');
        res.json(maps)
    } catch (err){
        console.log('Error at get User maps: ', err)
        res.status(500).json({message: 'Fetch failed'})
    }
};

exports.getMapById = async (req, res) =>{
    try{
        const map = await Map.findById(req.params._id)
            .populate('owner participants nodes.note');
        if (!map) return res.status(404).json({message: 'Map not found'});
        if (!map.owner.equals(req.user._id) && !map.participants.includes(req.user._id)){
            console.log('Error in getMapById: ', err)
            return res.status(403).json({message: 'Access denied'});
        }
    } catch (err){
        console.log('Error getMapById 500: ', err)
        res.status(500).json({message: 'Error fetching map'})
    }
};

exports.updateMap = async (req, res) => {
    try {
        const map = await Map.findById(req.params.id);
        if (!map) return res.status(404).json({ message: 'Map not found' });
        if (!map.owner.equals(req.user._id)) {
            return res.status(403).json({ message: 'Only owner can update' });
        }

        const { title, description, collaborators, nodes, connections } = req.body;
        map.title = title ?? map.title;
        map.description = description ?? map.description;
        map.collaborators = collaborators ?? map.collaborators;
        map.nodes = nodes ?? map.nodes;
        map.connections = connections ?? map.connections;
        map.updatedAt = Date.now();

        await map.save();
        res.json(map);
    } catch (err) {
        res.status(500).json({ message: 'Update failed', error: err.message });
    }
};

exports.deleteMap = async (req, res) => {
    try {
        const map = await Map.findById(req.params.id);
        if (!map) return res.status(404).json({ message: 'Map not found' });
        if (!map.owner.equals(req.user._id)) {
            return res.status(403).json({ message: 'Only owner can delete' });
        }

        await map.deleteOne();
        res.json({ message: 'Map deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Delete failed', error: err.message });
    }
};