// test-follow.js - Test the follow functionality
const mongoose = require('mongoose');
require('dotenv').config();

async function testFollow() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sportsapp');
    console.log('✅ Connected to MongoDB');
    
    const User = require('./models/User');
    
    // Test if we can find users
    const users = await User.find();
    console.log(`📊 Found ${users.length} users in database`);
    
    if (users.length > 0) {
      const user = users[0];
      console.log('👤 Sample user:', {
        username: user.username,
        email: user.email,
        followedTeams: user.followedTeams
      });
    }
    
    await mongoose.disconnect();
    console.log('✅ Test completed successfully');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testFollow();