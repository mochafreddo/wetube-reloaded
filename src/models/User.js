import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.'],
  },
  avatarUrl: String,
  socialOnly: { type: Boolean, default: false },
  username: { type: String, required: true, unique: true },
  password: { type: String },
  name: { type: String, required: true },
  location: String,
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
});

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 10;

userSchema.pre('save', async function (next) {
  try {
    if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
    }
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

export default User;
