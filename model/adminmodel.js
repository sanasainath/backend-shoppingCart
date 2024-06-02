// const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');

// const Schema = mongoose.Schema;

// const adminSchema = new Schema({
//     firstName: {
//         type: String,
//         required: true,
//         trim: true,
//         min: 3,
//         max: 20,
//     },
//     lastName: {
//         type: String,
//         required: true,
//         trim: true,
//         min: 3,
//         max: 20,
//     },
//     userName: {
//         type: String,
       
//         trim: true,
//         unique: true,
//         index: true,
//         lowercase: true
//     },
//     email: {
//         type: String,
//         required: true,
//         trim: true,
//         unique: true,
//         lowercase: true
//     },
//     password: {
//         type: String,
//         required: true,
//     },
//     role: {
//         type: String,
//         enum: ['user', 'admin'],
//         default: 'admin',
//     },
//     contact: {
//         type: String,
       
//     }
// }, { timestamps: true });

// adminSchema.pre('save', async function (next) {
//     const user = this;
//     if (!user.isModified('password')) return next();

//     try {
//         const hashedPassword = await bcrypt.hash(user.password, 10);
//         user.password = hashedPassword;
//         next();
//     } catch (error) {
//         return next(error);
//     }
// });

// adminSchema.methods.authenticate = function (password) {
//     return bcrypt.compare(password, this.password);
// };
// module.exports = mongoose.model('Admin', adminSchema);


