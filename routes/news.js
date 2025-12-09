// routes/news.js - Enhanced version
const express = require('express');
const router = express.Router();
const News = require('../models/News');

// GET /api/news with advanced filtering
router.get('/', async (req, res) => {
  try {
    const { 
      sport, 
      league, 
      team, 
      status, 
      q, 
      limit = 20, 
      skip = 0,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    
    // Build filter object
    if (sport && sport !== 'All') filter.sport = sport;
    if (league && league !== 'All') filter.league = league;
    if (status && status !== 'All') filter.status = status;
    
    if (team) {
      filter.$or = [
        { 'teams.home': { $regex: team, $options: 'i' } },
        { 'teams.away': { $regex: team, $options: 'i' } }
      ];
    }
    
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { excerpt: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { 'teams.home': { $regex: q, $options: 'i' } },
        { 'teams.away': { $regex: q, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const news = await News.find(filter)
      .sort(sort)
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    // Get counts for filters
    const sports = await News.distinct('sport');
    const leagues = await News.distinct('league');
    const statuses = await News.distinct('status');

    res.json({
      news,
      filters: {
        sports: ['All', ...sports],
        leagues: ['All', ...leagues],
        statuses: ['All', ...statuses]
      },
      total: news.length
    });
    
  } catch (err) {
    console.error('Error fetching news:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET sports statistics
router.get('/stats', async (req, res) => {
  try {
    const totalArticles = await News.countDocuments();
    const liveMatches = await News.countDocuments({ status: 'Live' });
    const upcomingMatches = await News.countDocuments({ status: 'Upcoming' });
    const finishedMatches = await News.countDocuments({ status: 'Finished' });

    res.json({
      totalArticles,
      liveMatches,
      upcomingMatches,
      finishedMatches
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET news by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await News.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create news
router.post('/', async (req, res) => {
  try {
    const { sport, league, title, excerpt, content, img, author, date, teams, score, status, venue } = req.body;
    if (!sport || !title) return res.status(400).json({ error: 'sport and title are required' });
    
    const created = await News.create({ 
      sport, league, title, excerpt, content, img, author, date, teams, score, status, venue 
    });
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;