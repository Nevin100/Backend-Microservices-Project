import Joi from "joi";

// Regiseration Validation :
export const validateRegistration = (data) => {
    const schema = Joi.object({
        userName : Joi.string().min(3).max(50).required(),
        email : Joi.string().min(11).required(),
        password : Joi.string().min(8).required()
    })

    return schema.validate(data)
}   

