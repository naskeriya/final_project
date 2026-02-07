const express = require('express');
const router = express.Router();
const Image = require('../models/Image');
const { isAuthenticated } = require('../middleware/auth');

// @route   GET /api/tags
// @desc    Get tag aggregation (most popular tags by count)
// @access  Public
router.get('/', async (req, res) => {
    try {
        // Aggregate tags from ALL images
        const tagAggregation = await Image.aggregate([
            // Unwind tags array
            { $unwind: '$tags' },
            // Group by tag and count
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            // Sort by count descending (most popular first), then alphabetically
            { $sort: { count: -1, _id: 1 } },
            // Format output
            { $project: { _id: 0, name: '$_id', count: 1 } },
        ]);

        res.status(200).json({
            success: true,
            tags: tagAggregation,
        });
    } catch (error) {
        console.error('Tag aggregation error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching tags',
            error: error.message,
        });
    }
});

module.exports = router;
