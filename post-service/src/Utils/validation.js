import joi from "joi";

// Validation for creating a post :
export const validateCreatePost = (data) => {
    const schema = joi.object({
        content: joi.string().min(3).max(1000).required()
    });

    return schema.validate(data);
}

