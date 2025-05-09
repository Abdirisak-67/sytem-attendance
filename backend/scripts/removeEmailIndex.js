const mongoose = require('mongoose');
require('dotenv').config();

async function removeEmailIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the students collection
    const db = mongoose.connection.db;
    const studentsCollection = db.collection('students');

    // Drop the email index
    await studentsCollection.dropIndex('email_1');
    console.log('Successfully dropped email index');

    // Remove email field from all documents
    await studentsCollection.updateMany(
      {},
      { $unset: { email: "" } }
    );
    console.log('Successfully removed email field from all documents');

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the migration
removeEmailIndex(); 