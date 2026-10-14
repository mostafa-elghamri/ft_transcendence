// const mongoose = require('mongoose');

// const GroupSchema = new mongoose.Schema({
//     owner: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true
//     },
//     groupName: {
//         type: String,
//         required: true,
//         trim: true,
//         minlength: [2, 'Group name must be at least 2 characters'],
//     },
//     members: [{
//         type: mongoose.Schema.Types.ObjectId,
//         ref: `User`
//     }],
//     createdAt: {
//         type: Date,
//         default: Date.now,
//     }
// });

// module.exports = mongoose.model(`Group`, GroupSchema);