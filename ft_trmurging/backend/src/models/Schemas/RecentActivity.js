const mongoose = require('mongoose');

const RecentActivities = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    description: {
        type: String,
        required: true,
    }
});


module.exports = mongoose.model('RecentActivities', RecentActivitiesSchema);
