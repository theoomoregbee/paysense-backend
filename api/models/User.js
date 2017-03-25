/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {
        full_name: {
            type: 'string',
            required: true
        },
        email: {
            type: 'string',
            required: true,
            email: true,
            unique: true
        },
        phone_number: {
            type: 'string',
            required: true
        },
        bvn: {
            type: 'string',
            required: true,
            unique: true
        },
        account_balance: {
            type: 'float',
            required: true
        }
    }
};

