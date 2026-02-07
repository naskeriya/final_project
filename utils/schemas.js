const Joi = require('joi');

const schemas = {
    // Auth Schemas
    register: Joi.object({
        name: Joi.string().min(2).max(50).required().messages({
            'string.empty': 'Name is required',
            'string.min': 'Name must be at least 2 characters long',
        }),
        email: Joi.string().email().required().messages({
            'string.email': 'Please provide a valid email address',
            'string.empty': 'Email is required',
        }),
        password: Joi.string().min(6).required().messages({
            'string.min': 'Password must be at least 6 characters long',
            'string.empty': 'Password is required',
        }),
    }),

    login: Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Please provide a valid email address',
            'string.empty': 'Email is required',
        }),
        password: Joi.string().required().messages({
            'string.empty': 'Password is required',
        }),
    }),

    updateProfile: Joi.object({
        name: Joi.string().min(2).max(50),
        email: Joi.string().email(),
    }).min(1).messages({
        'object.min': 'Please provide at least one field to update (name or email)',
    }),

    // Image Schemas
    generateImage: Joi.object({
        prompt: Joi.string().min(3).max(1000).required().messages({
            'string.empty': 'Prompt is required',
            'string.min': 'Prompt must be at least 3 characters long',
        }),
    }),

    createImage: Joi.object({
        name: Joi.string().min(1).max(100).required(),
        description: Joi.string().allow('').max(500),
        tags: Joi.array().items(Joi.string().max(30)).max(10),
        imageData: Joi.string().required(), // Base64 data
        used_prompt: Joi.string().allow('').max(1000),
    }),

    updateImage: Joi.object({
        name: Joi.string().min(1).max(100),
        description: Joi.string().allow('').max(500),
        tags: Joi.array().items(Joi.string().max(30)).max(10),
        used_prompt: Joi.string().allow('').max(1000),
        path: Joi.string(), // Allowing path update if needed (internal use mostly)
    }).min(1),
};

module.exports = schemas;
