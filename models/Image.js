const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
    {
        path: {
            type: String,
            required: [true, 'Image path is required'],
            trim: true,
        },
        name: {
            type: String,
            required: [true, 'Image name is required'],
            trim: true,
        },
        used_prompt: {
            type: String,
            trim: true,
            default: '',
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User reference is required'],
        },
        tags: {
            type: [String],
            default: [],
            validate: {
                validator: function (tags) {
                    return tags.every(tag =>
                        /^[a-zA-Z0-9\s]+$/.test(tag) && tag.length <= 64
                    );
                },
                message: 'Tags must contain only letters, numbers, and spaces, and be max 64 characters',
            },
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt fields
    }
);

// Index for efficient tag aggregation queries
imageSchema.index({ tags: 1 });
// Index for user-specific queries
imageSchema.index({ user: 1 });

module.exports = mongoose.model('Image', imageSchema);
