const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  class: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  strict: false // This allows the schema to be more flexible
});

// Drop the email index if it exists
studentSchema.pre('save', async function(next) {
  try {
    const collection = this.collection;
    const indexes = await collection.indexes();
    const emailIndex = indexes.find(index => index.name === 'email_1');
    
    if (emailIndex) {
      await collection.dropIndex('email_1');
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Student', studentSchema); 