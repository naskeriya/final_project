const express = require('express');
const router = express.Router();
const Image = require('../models/Image');
const { isAuthenticated } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const schemas = require('../utils/schemas');

const fs = require('fs').promises;
const path = require('path');

// @access  Private
router.post('/generate', isAuthenticated, validateRequest(schemas.generateImage), async (req, res) => {
    try {
        const { prompt } = req.body;

        const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
        const apiToken = process.env.CLOUDFLARE_API_TOKEN;
        const model = process.env.CLOUDFLARE_AI_MODEL;

        if (!accountId || !apiToken || !model) {
            return res.status(500).json({ success: false, message: 'Cloudflare configuration missing on server' });
        }

        const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Cloudflare API Error:', errorText);
            throw new Error(`Cloudflare API error: ${response.status}`);
        }

        const buffer = await response.arrayBuffer();
        const base64Image = Buffer.from(buffer).toString('base64');
        const dataUrl = `data:image/png;base64,${base64Image}`;

        res.status(200).json({
            success: true,
            dataUrl: dataUrl
        });
    } catch (error) {
        console.error('Image generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error generating image',
            error: error.message,
        });
    }
});

// @route   POST /api/images
// @desc    Create a new image
// @access  Private
router.post('/', isAuthenticated, validateRequest(schemas.createImage), async (req, res) => {
    try {
        const { imageData, name, used_prompt, description, tags } = req.body;


        // Generate unique filename
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        const filename = `image-${timestamp}-${random}.png`;

        // Define paths
        // Ensure uploads directory exists (relative to project root)
        const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
        // Ensure directory exists
        await fs.mkdir(uploadDir, { recursive: true });

        const filePath = path.join(uploadDir, filename);

        // Remove header from base64 string
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");

        // Write file to disk
        await fs.writeFile(filePath, base64Data, 'base64');

        // Relative path for database and frontend
        const relativePath = `/uploads/${filename}`;

        // Create new image associated with the authenticated user
        const image = await Image.create({
            path: relativePath,
            name,
            used_prompt: used_prompt || '',
            description: description || '',
            tags: tags || [],
            user: req.user.id,
        });

        res.status(201).json({
            success: true,
            message: 'Image created successfully',
            image: {
                id: image._id,
                path: image.path,
                name: image.name,
                used_prompt: image.used_prompt,
                description: image.description,
                tags: image.tags,
                createdAt: image.createdAt,
                updatedAt: image.updatedAt,
            },
        });
    } catch (error) {
        console.error('Create image error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error creating image',
            error: error.message,
        });
    }
});

// @route   GET /api/images
// @desc    Get all images (public)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { search, tags } = req.query;
        let query = {};

        const andFilters = [];

        if (search) {
            const searchRegex = new RegExp(search, 'i');
            andFilters.push({
                $or: [
                    { name: searchRegex },
                    { used_prompt: searchRegex },
                    { description: searchRegex },
                ],
            });
        }

        if (tags) {
            const tagsArray = tags.split(',').map(tag => tag.trim()).filter(t => t !== '');
            if (tagsArray.length > 0) {
                andFilters.push({ tags: { $all: tagsArray } });
            }
        }

        if (andFilters.length > 0) {
            query = { $and: andFilters };
        }

        const images = await Image.find(query)
            .populate('user', 'name email')
            .sort({ createdAt: -1 }); // Most recent first

        res.status(200).json({
            success: true,
            count: images.length,
            images: images.map(img => ({
                id: img._id,
                path: img.path,
                name: img.name,
                used_prompt: img.used_prompt,
                description: img.description,
                tags: img.tags,
                createdAt: img.createdAt,
                updatedAt: img.updatedAt,
            })),
        });
    } catch (error) {
        console.error('Get images error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching images',
            error: error.message,
        });
    }
});

// @route   GET /api/images/:id
// @desc    Get a specific image (public)
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const image = await Image.findById(req.params.id)
            .populate('user', 'name email');

        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'Image not found',
            });
        }

        res.status(200).json({
            success: true,
            image: {
                id: image._id,
                path: image.path,
                name: image.name,
                used_prompt: image.used_prompt,
                description: image.description,
                tags: image.tags,
                user: image.user, // Includes name and email
                createdAt: image.createdAt,
                updatedAt: image.updatedAt,
            },
        });
    } catch (error) {
        console.error('Get image error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching image',
            error: error.message,
        });
    }
});

// @route   PUT /api/images/:id
// @desc    Update an image
// @access  Private
router.put('/:id', isAuthenticated, validateRequest(schemas.updateImage), async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);

        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'Image not found',
            });
        }

        // Verify the image belongs to the authenticated user
        if (image.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this image',
            });
        }

        const { path, name, used_prompt, description, tags } = req.body;

        // Update fields if provided
        if (path !== undefined) image.path = path;
        if (name !== undefined) image.name = name;
        if (used_prompt !== undefined) image.used_prompt = used_prompt;
        if (description !== undefined) image.description = description;
        if (tags !== undefined) image.tags = tags;

        await image.save();

        res.status(200).json({
            success: true,
            message: 'Image updated successfully',
            image: {
                id: image._id,
                path: image.path,
                name: image.name,
                tags: image.tags,
                createdAt: image.createdAt,
                updatedAt: image.updatedAt,
            },
        });
    } catch (error) {
        console.error('Update image error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating image',
            error: error.message,
        });
    }
});

// @route   DELETE /api/images/:id
// @desc    Delete an image
// @access  Private
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);

        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'Image not found',
            });
        }

        // Verify the image belongs to the authenticated user
        if (image.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this image',
            });
        }

        await image.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Image deleted successfully',
        });
    } catch (error) {
        console.error('Delete image error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting image',
            error: error.message,
        });
    }
});

module.exports = router;
