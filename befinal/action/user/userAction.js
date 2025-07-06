const mongoose = require('mongoose');
const User = require('../../schema/userSchema');
const bcrypt = require('bcrypt');
const Calendar = require('../../schema/calendarSchema');
const noteSchema = require('../../schema/noteSchema');

// Functionalities
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        console.error('Error fetching users (getAllUsers) in userAction.js: ', err);
        res.status(500).json({ message: 'Error fetching users' });
    }
}

//Create user function 
const createUser = async (req, res) => {
    try {
        const { userName, password, email, profilePicture, devices } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already in use' }); // 409 Conflict
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = new User({
            userName,
            passwordHash,
            email,
            profilePicture: profilePicture || null,
            devices: devices || []
        });
        await newUser.save();

        // Create a calendar and attach to user
        const newCalendar = new Calendar({
            title: `${userName}'s Calendar`,
            description: `Default calendar for ${userName}`,
            userId: newUser._id
        });
        await newCalendar.save();

        newUser.calendarId = newCalendar._id;
        await newUser.save();

        res.status(200).json({ message: 'User created successfully' });

    } catch (err) {
        console.error('Error creating user in userAction file: ', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};



//Get user by id
const getUserbyID = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'user not found' });
        }
        res.status(200).json(user)
    } catch (err) {
        console.log("Error retrieving user by ID in userAction: ", err.message)
        res.status(500).json({ message: "Error get user by ID" });
    }
}

//Update user profile
const userUpdate = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true } // return updated document
        );
        if (!updatedUser) {
            return res.status(404).json({ message: 'Invalid ID to update' })
        }
        res.status(200).json(updatedUser)
    } catch (err) {
        console.log('Error in update user in userAction: ', err.message)
        res.status(500).json({ message: 'Error update user 🙁' })
    }
}

const deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const deletedCalendar = await Calendar.findOneAndDelete({ userId: deletedUser._id });

        // Delete note and others
        if (deletedCalendar) {
            await noteSchema.deleteMany({ calendarId: deletedCalendar._id });
        }

        res.status(200).json({ message: "User and related data deleted successfully" });
    } catch (err) {
        console.log("Error deleting user:", err);
        res.status(500).json({ message: "An error occurred while deleting the user" });
    }
};

// Friends
const sendFriendRequest = async (req, res) => {
    try {
        if (!req.user || (!req.user._id && !req.user.id)) {
            return res.status(401).json({ message: "Unauthorized: token invalid or missing user info" });
        }

        const senderId = req.user?.id || req.user?._id;
        const receiverId = req.params.receiverId;

        if (senderId.toString() === receiverId) {
            return res.status(400).json({ message: "you cannot send friend request to youself" });
        }
        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);

        if (!sender || !receiver) {
            return res.status(404).json({ message: "invalid user" })
        }
        if (receiver.friendRequests.includes(senderId)) {
            return res.status(404).json({ message: "Already sent friend request to this user" })
        }
        if (receiver.friends && receiver.friends.includes(senderId)) {
            return res.status(400).json({ message: "Already been friend" })
        }

        //Initialise if match with requirements
        if (!receiver.friendRequests) receiver.friendRequests = [];
        if (!sender.sentRequests) sender.sentRequests = [];

        //push to database if succeed
        receiver.friendRequests.push(senderId);
        sender.sentRequests.push(receiverId);

        await receiver.save();
        await sender.save();

        res.status(200).json({ message: "Send friend request successfully" })
    } catch (err) {
        console.error("Error in sendFriendRequest: ", err);
        res.status(500).json({ message: "Internal error while sending friend request" });
    }
}

const acceptFriendRequest = async (req, res) => {
    try {
        const receiverId = req.user._id || req.user.id;
        const senderId = req.params.senderId;

        const receiver = await User.findById(receiverId);
        const sender = await User.findById(senderId);

        if (!receiver || !sender) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check if there is a friend request from the sender
        if (!receiver.friendRequests.includes(senderId)) {
            return res.status(400).json({ message: "No friend request from this user." });
        }

        // Initialize arrays if they don't exist
        if (!receiver.friends) receiver.friends = [];
        if (!sender.friends) sender.friends = [];

        // Add each other as friends
        receiver.friends.push(senderId);
        sender.friends.push(receiverId);

        // Remove friend request from both sides
        receiver.friendRequests = receiver.friendRequests.filter(
            id => id.toString() !== senderId
        );
        sender.sentRequests = sender.sentRequests.filter(
            id => id.toString() !== receiverId.toString()
        );

        await receiver.save();
        await sender.save();

        res.status(200).json({ message: "Friend request accepted." });

    } catch (err) {
        console.error("Error in acceptFriendRequest:", err);
        res.status(500).json({ message: "Server error while accepting friend request." });
    }
};

// get and read current friends
const getFriends = async (req, res)=>{
    try{
        const userId = req.user._id || req.user.id;
        const user = await User.findById(userId).populate('friends', 'userName email profilePicture');
        if (!user) return res.status(404).json({message: 'User note found'});

        res.status(200).json(user.friends);
    }catch(err){
        console.error("Error in getFriends: ", err);
        res.status(500).json({message: "Internal error in fetching friends"})
    }
};

const getFriendRequests = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const user = await User.findById(userId).populate('friendRequests', 'userName email profilePicture');
        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json(user.friendRequests);
    } catch (err) {
        console.error("Error in getFriendRequests:", err);
        res.status(500).json({ message: "Server error fetching requests." });
    }
};

const rejectFriendRequest = async (req, res) => {
    try {
        const receiverId = req.user._id || req.user.id;
        const senderId = req.params.senderId;

        const receiver = await User.findById(receiverId);
        const sender = await User.findById(senderId);

        if (!receiver || !sender) {
            return res.status(404).json({ message: "User not found" });
        }

        receiver.friendRequests = receiver.friendRequests.filter(id => id.toString() !== senderId);
        sender.sentRequests = sender.sentRequests.filter(id => id.toString() !== receiverId.toString());

        await receiver.save();
        await sender.save();

        res.status(200).json({ message: "Friend request rejected." });
    } catch (err) {
        console.error("Error rejecting friend request:", err);
        res.status(500).json({ message: "Server error." });
    }
};

const unfriend = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const friendId = req.params.friendId;

        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!user || !friend) {
            return res.status(404).json({ message: "User not found" });
        }

        user.friends = user.friends.filter(id => id.toString() !== friendId);
        friend.friends = friend.friends.filter(id => id.toString() !== userId);

        await user.save();
        await friend.save();

        res.status(200).json({ message: "Unfriended successfully" });
    } catch (err) {
        console.error("Error unfriending:", err);
        res.status(500).json({ message: "Server error while unfriending" });
    }
};


module.exports = {
    getAllUsers,
    createUser,
    getUserbyID,
    userUpdate,
    deleteUser,

    sendFriendRequest,
    acceptFriendRequest,
    getFriends,
    getFriendRequests,
    rejectFriendRequest,
    unfriend
};