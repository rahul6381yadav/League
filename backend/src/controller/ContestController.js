const Contest = require('../model/ContestModel');
const ContestLog = require('../model/ContestLogsModel');
const User = require('../model/UserModel');

exports.createContest = async (req, res) => {
    const { name, roomCode, duration, startTime } = req.body;  // Include startTime in the request body
    const user = req.user;

    try {
        if (!user) {
            return res.status(404).json({ message: 'User not found', isError: true });
        }

        if (user.role !== 'coordinator') {
            return res.status(403).json({ message: 'Unauthorized: Only coordinators can create contests', isError: true });
        }

        // Ensure startTime is provided and valid
        const start = startTime ? new Date(startTime) : new Date();

        if (isNaN(start.getTime())) {
            return res.status(400).json({ message: 'Invalid start time format', isError: true });
        }

        // Create the contest
        const contest = new Contest({
            name,
            roomCode,
            duration,
            startTime: start
        });

        // contest.participants.push(user._id);

        await contest.save();

        // Associate the contest with the user
        // user.contests.push(contest._id);
        // await user.save();

        res.status(201).json({ 
            message: 'Contest created successfully', 
            contest, 
            isError: false 
        });

    } catch (error) {
        console.error('Error creating contest:', error);
        res.status(500).json({ message: 'Failed to create contest', isError: true });
    }
};

exports.getContests = async (req, res) => {
    try {

        const contests = await Contest.find()
            .populate('participants', 'name email')  // Populate with user info
            .exec();
        res.json({ message: 'Contests fetched successfully', contests, isError: false });
    } catch (error) {
        res.status(500).json({ message: 'Failed to get contests', isError: true });
        console.log('Error getting contests:', error);
    }
};

exports.getRoomDetails = async (req, res) => {
    const { roomCode } = req.params;

    try {
        const room = await Contest.findOne({ roomCode })
            .populate('participants', 'name email')  // Populate with user info
            .exec();

        if (room) {
            res.json({message: 'Room fetched successfully', room, isError: false});
        } else {
            res.status(404).json({ message: 'Room not found', isError: true });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch room', isError: true });
        console.log('Error fetching room:', error);
    }
};

exports.joinContest = async (req, res) => {
    const { roomCode } = req.body;
    const userId = req.user._id;

    try {
        const contest = await Contest.findOne({ roomCode });

        if (!contest) {
            return res.status(404).json({ message: 'Contest not found', isError: true });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found', isError: true });
        }

        // Check if the user is already part of the contest
        if (contest.participants.includes(user._id)) {
            return res.status(200).json({
                message: 'User already joined the contest',
                user,
                contest
            });
        }

        // Add the user to the participants
        contest.participants.push(user._id);
        await contest.save();

        // Add the contest to the user's list
        // if (!user.contests.includes(contest._id)) {
        //     user.contests.push(contest._id);
        //     await user.save();
        // }

        res.status(200).json({
            message: 'Successfully joined the contest',
            user,
            contest
        });

    } catch (error) {
        console.error('Error joining contest:', error);
        res.status(500).json({ message: 'Failed to join contest', error });
    }
};

exports.getActiveContests = async (req, res) => {
    try {
        const currentTime = new Date();

        console.log('Current time:', currentTime);

        // Find contests where current time is between startTime and endTime
        const activeContests = await Contest.find({
            startTime: { $lte: currentTime },  // Contest has started
            $expr: {
                $gt: [
                    { $add: ["$startTime", { $multiply: ["$duration", 60000] }] },  // End time
                    currentTime
                ]
            }
        }).populate('participants');

        res.status(200).json({
            message: 'Active contests fetched successfully',
            activeContests,
            isError: false
        });

    } catch (error) {
        console.error('Error fetching active contests:', error);
        res.status(500).json({ message: 'Failed to fetch active contests', error });
    }
};

// Get paginated logs
exports.getContestLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    
    const logs = await ContestLog.find()
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get logs by room
exports.getLogsByRoom =  async (req, res) => {
  try {
    const logs = await ContestLog.find({ roomCode: req.params.roomCode })
      .sort({ timestamp: -1 })
      .limit(100);

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

