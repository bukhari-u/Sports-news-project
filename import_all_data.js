require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const eFixture = require('./models/efixture');
const Fixture = require('./models/Fixture');
const Tournament = require('./models/Tournament');
const Video = require('./models/Video');
const News = require('./models/News');
const Team = require('./models/Team');
const LeagueTable = require('./models/LeagueTable');
const Player = require('./models/Player');
const Score = require('./models/Score');
const LiveEvent = require('./models/LiveEvent');
const User = require('./models/User');

// Import data (you'll need to create these files)
const fixturesData = require('./data/fixtures');
const tournamentsData = require('./data/tournaments');
const videosData = require('./data/videos');
const newsData = require('./data/news');
const teamsData = require('./data/teams');
const leagueTablesData = require('./data/leaguetables');
const playersData = require('./data/players');
const scoresData = require('./data/scores');
const liveEventsData = require('./data/liveevents');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sportsdb';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function clearExistingData() {
  console.log('🗑️ Clearing existing data...');
  
  try {
    await eFixture.deleteMany({});
    await Fixture.deleteMany({});
    await Tournament.deleteMany({});
    await Video.deleteMany({});
    await News.deleteMany({});
    await Team.deleteMany({});
    await LeagueTable.deleteMany({});
    await Player.deleteMany({});
    await Score.deleteMany({});
    await LiveEvent.deleteMany({});
    // Note: We don't clear User data to preserve existing users
    
    console.log('✅ All sports data cleared (users preserved)');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  }
}

// Function to validate player data before import
function validatePlayerData(players) {
  const invalidPlayers = [];
  
  players.forEach((player, index) => {
    const errors = [];
    
    if (!player.name) errors.push('name is required');
    if (!player.sport) errors.push('sport is required');
    if (!player.position) errors.push('position is required');
    if (!player.nationality) errors.push('nationality is required');
    if (!player.currentClub) errors.push('currentClub is required');
    
    if (errors.length > 0) {
      invalidPlayers.push({
        index,
        name: player.name || 'Unknown',
        errors
      });
    }
  });
  
  return invalidPlayers;
}

async function importData() {
  let totalCount = 0;
  
  try {
    // Import Fixtures
    console.log('📥 Importing Fixtures...');
    const FixtureResult = await Fixture.insertMany(fixturesData);
    console.log(`✅ Imported ${FixtureResult.length} Fixtures`);
    totalCount += FixtureResult.length;

    // Import Tournaments
    console.log('📥 Importing Tournaments...');
    const tournamentResult = await Tournament.insertMany(tournamentsData);
    console.log(`✅ Imported ${tournamentResult.length} Tournaments`);
    totalCount += tournamentResult.length;

    // Import Videos
    console.log('📥 Importing Videos...');
    const videoResult = await Video.insertMany(videosData);
    console.log(`✅ Imported ${videoResult.length} Videos`);
    totalCount += videoResult.length;

    // Import News
    console.log('📥 Importing News...');
    const newsResult = await News.insertMany(newsData);
    console.log(`✅ Imported ${newsResult.length} News articles`);
    totalCount += newsResult.length;

    // Import Teams
    console.log('📥 Importing Teams...');
    const teamResult = await Team.insertMany(teamsData);
    console.log(`✅ Imported ${teamResult.length} Teams`);
    totalCount += teamResult.length;

    // Import League Tables
    console.log('📥 Importing League Tables...');
    const leagueTableResult = await LeagueTable.insertMany(leagueTablesData);
    console.log(`✅ Imported ${leagueTableResult.length} League Tables`);
    totalCount += leagueTableResult.length;

    // Validate and Import Players
    console.log('📥 Validating Players data...');
    const invalidPlayers = validatePlayerData(playersData);
    if (invalidPlayers.length > 0) {
      console.error('❌ Invalid players found:');
      invalidPlayers.forEach(invalid => {
        console.error(`   Player ${invalid.index} (${invalid.name}): ${invalid.errors.join(', ')}`);
      });
      throw new Error('Player validation failed. Please fix the player data.');
    }
    
    console.log('📥 Importing Players...');
    const playerResult = await Player.insertMany(playersData);
    console.log(`✅ Imported ${playerResult.length} Players`);
    totalCount += playerResult.length;

    // Import Scores
    console.log('📥 Importing Scores...');
    const scoreResult = await Score.insertMany(scoresData);
    console.log(`✅ Imported ${scoreResult.length} Scores`);
    totalCount += scoreResult.length;

    // Import Live Events
    console.log('📥 Importing Live Events...');
    const liveEventResult = await LiveEvent.insertMany(liveEventsData);
    console.log(`✅ Imported ${liveEventResult.length} Live Events`);
    totalCount += liveEventResult.length;

    // Check for existing users
    const existingUsersCount = await User.countDocuments();
    console.log(`👤 Existing users in database: ${existingUsersCount}`);

    console.log('\n🎉 All sports data imported successfully!');
    console.log(`📊 Total documents imported: ${totalCount}`);
    
    // Summary
    console.log('\n📈 Import Summary:');
    console.log(`⚽ Fixtures: ${FixtureResult.length}`);
    console.log(`🏆 Tournaments: ${tournamentResult.length}`);
    console.log(`🎥 Videos: ${videoResult.length}`);
    console.log(`📰 News: ${newsResult.length}`);
    console.log(`👥 Teams: ${teamResult.length}`);
    console.log(`📊 League Tables: ${leagueTableResult.length}`);
    console.log(`🏃 Players: ${playerResult.length}`);
    console.log(`⚽ Scores: ${scoreResult.length}`);
    console.log(`🔴 Live Events: ${liveEventResult.length}`);
    console.log(`👤 Existing Users: ${existingUsersCount}`);

  } catch (error) {
    console.error('❌ Error importing data:', error);
    throw error;
  }
}

async function run() {
  try {
    await connectDB();
    await clearExistingData();
    await importData();
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the import
run();