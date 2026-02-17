import joi from "joi";

// Validation for creating a post :
export const validateCreatePost = (data) => {
    const schema = joi.object({
        content: joi.string().min(3).max(1000).required(),
        mediaUrls: joi.array()
    });

    return schema.validate(data);
}

// Validation for updating a post :
export const validateUpdatePost = (data) => {
    const schema = joi.object({
        content: joi.string().min(3).max(1000).required(),
        mediaUrls: joi.array().items(joi.string().uri()).optional()
    });
    return schema.validate(data);
}