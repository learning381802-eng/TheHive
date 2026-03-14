import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    room: {
      type: String,
      required: true,
      trim: true,
      default: 'global'
    },
    senderName: {
      type: String,
      required: true,
      trim: true,
      maxLength: 32
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxLength: 500
    }
  },
  {
    timestamps: true
  }
);

const Message = mongoose.model('Message', messageSchema);

export default Message;
