const leagueTablesData = [
  // ───────────────────────────────
  // Existing Leagues (Your Data)
  // ───────────────────────────────
  {
    leagueName: "Premier League",
    sport: "football",
    season: "2024",
    table: [
      { position: 1, team: "Manchester City", played: 38, wins: 28, draws: 7, losses: 3, points: 91 },
      { position: 2, team: "Arsenal", played: 38, wins: 28, draws: 5, losses: 5, points: 89 },
      { position: 3, team: "Liverpool", played: 38, wins: 24, draws: 10, losses: 4, points: 82 },
      { position: 4, team: "Aston Villa", played: 38, wins: 20, draws: 8, losses: 10, points: 68 },
      { position: 5, team: "Tottenham", played: 38, wins: 20, draws: 6, losses: 12, points: 66 }
    ],
    isActive: true
  },
  {
    leagueName: "NBA Eastern Conference",
    sport: "basketball",
    season: "2024",
    table: [
      { position: 1, team: "Boston Celtics", played: 82, wins: 64, draws: 0, losses: 18, points: 0 },
      { position: 2, team: "Milwaukee Bucks", played: 82, wins: 49, draws: 0, losses: 33, points: 0 },
      { position: 3, team: "New York Knicks", played: 82, wins: 50, draws: 0, losses: 32, points: 0 },
      { position: 4, team: "Cleveland Cavaliers", played: 82, wins: 48, draws: 0, losses: 34, points: 0 },
      { position: 5, team: "Orlando Magic", played: 82, wins: 47, draws: 0, losses: 35, points: 0 }
    ],
    isActive: true
  },
  {
    leagueName: "MLB American League East",
    sport: "baseball",
    season: "2024",
    table: [
      { position: 1, team: "New York Yankees", played: 70, wins: 45, draws: 0, losses: 25, points: 0 },
      { position: 2, team: "Boston Red Sox", played: 70, wins: 42, draws: 0, losses: 28, points: 0 },
      { position: 3, team: "Tampa Bay Rays", played: 70, wins: 38, draws: 0, losses: 32, points: 0 },
      { position: 4, team: "Toronto Blue Jays", played: 70, wins: 35, draws: 0, losses: 35, points: 0 },
      { position: 5, team: "Baltimore Orioles", played: 70, wins: 33, draws: 0, losses: 37, points: 0 }
    ],
    isActive: true
  },
  {
    leagueName: "La Liga",
    sport: "football",
    season: "2024",
    table: [
      { position: 1, team: "Real Madrid", played: 12, wins: 9, draws: 2, losses: 1, points: 29 },
      { position: 2, team: "Barcelona", played: 12, wins: 8, draws: 3, losses: 1, points: 27 },
      { position: 3, team: "Atletico Madrid", played: 12, wins: 8, draws: 1, losses: 3, points: 25 },
      { position: 4, team: "Girona", played: 12, wins: 7, draws: 2, losses: 3, points: 23 },
      { position: 5, team: "Athletic Bilbao", played: 12, wins: 6, draws: 3, losses: 3, points: 21 }
    ],
    isActive: true
  },

  // ───────────────────────────────
  // NEW SIMPLE TABLES FOR OTHER SPORTS
  // ───────────────────────────────

  // TENNIS — ATP Rankings Style
  {
    leagueName: "ATP World Rankings",
    sport: "tennis",
    season: "2024",
    table: [
      { position: 1, team: "Novak Djokovic", points: 9980 },
      { position: 2, team: "Carlos Alcaraz", points: 8800 },
      { position: 3, team: "Jannik Sinner", points: 7900 },
      { position: 4, team: "Daniil Medvedev", points: 7600 },
      { position: 5, team: "Alexander Zverev", points: 7200 }
    ],
    isActive: true
  },

  // HOCKEY — World Rankings
  {
    leagueName: "FIH Men's Hockey Rankings",
    sport: "hockey",
    season: "2024",
    table: [
      { position: 1, team: "Netherlands", points: 3050 },
      { position: 2, team: "Belgium", points: 2980 },
      { position: 3, team: "India", points: 2890 },
      { position: 4, team: "Australia", points: 2810 },
      { position: 5, team: "Germany", points: 2750 }
    ],
    isActive: true
  },

  // GOLF — PGA Rankings
  {
    leagueName: "PGA World Golf Rankings",
    sport: "golf",
    season: "2024",
    table: [
      { position: 1, team: "Scottie Scheffler", points: 540 },
      { position: 2, team: "Rory McIlroy", points: 480 },
      { position: 3, team: "Jon Rahm", points: 450 },
      { position: 4, team: "Viktor Hovland", points: 430 },
      { position: 5, team: "Xander Schauffele", points: 420 }
    ],
    isActive: true
  },

  // RUGBY — World Rankings
  {
    leagueName: "World Rugby Rankings",
    sport: "rugby",
    season: "2024",
    table: [
      { position: 1, team: "South Africa", points: 94.5 },
      { position: 2, team: "Ireland", points: 91.2 },
      { position: 3, team: "New Zealand", points: 89.0 },
      { position: 4, team: "France", points: 86.4 },
      { position: 5, team: "England", points: 85.2 }
    ],
    isActive: true
  },

  // FORMULA 1 — Driver Standings
  {
    leagueName: "Formula 1 Drivers Championship",
    sport: "formula1",
    season: "2024",
    table: [
      { position: 1, driver: "Max Verstappen", team: "Red Bull", points: 310 },
      { position: 2, driver: "Lando Norris", team: "McLaren", points: 245 },
      { position: 3, driver: "Charles Leclerc", team: "Ferrari", points: 225 },
      { position: 4, driver: "Lewis Hamilton", team: "Mercedes", points: 190 },
      { position: 5, driver: "Carlos Sainz", team: "Ferrari", points: 175 }
    ],
    isActive: true
  },

  {
  leagueName: "ICC Cricket Rankings",
  sport: "Cricket",
  season: "2024",
  table: [
    { 
      position: 1, 
      team: "India", 
      played: 32, 
      wins: 22, 
      draws: 2, 
      losses: 8, 
      rating: 121, 
      points: 3720 
    },
    { 
      position: 2, 
      team: "Australia", 
      played: 30, 
      wins: 20, 
      draws: 1, 
      losses: 9, 
      rating: 117, 
      points: 3510 
    },
    { 
      position: 3, 
      team: "Pakistan", 
      played: 28, 
      wins: 17, 
      draws: 2, 
      losses: 9, 
      rating: 112, 
      points: 3136 
    },
    { 
      position: 4, 
      team: "South Africa", 
      played: 27, 
      wins: 15, 
      draws: 1, 
      losses: 11, 
      rating: 108, 
      points: 2916 
    },
    { 
      position: 5, 
      team: "New Zealand", 
      played: 26, 
      wins: 14, 
      draws: 1, 
      losses: 11, 
      rating: 104, 
      points: 2704 
    }
  ],
  isActive: true
},


  // BOXING — P4P Rankings
  {
    leagueName: "Pound for Pound (P4P) Rankings",
    sport: "boxing",
    season: "2024",
    table: [
      { position: 1, team: "Oleksandr Usyk" },
      { position: 2, team: "Terence Crawford" },
      { position: 3, team: "Naoya Inoue" },
      { position: 4, team: "Canelo Alvarez" },
      { position: 5, team: "Tyson Fury" }
    ],
    isActive: true
  },

  // MMA — UFC Rankings
  {
    leagueName: "UFC Pound for Pound Rankings",
    sport: "mma",
    season: "2024",
    table: [
      { position: 1, team: "Islam Makhachev" },
      { position: 2, team: "Jon Jones" },
      { position: 3, team: "Leon Edwards" },
      { position: 4, team: "Alex Pereira" },
      { position: 5, team: "Ilia Topuria" }
    ],
    isActive: true
  },

  // OLYMPICS — Medal Table
  {
    leagueName: "Olympics Medal Table",
    sport: "olympics",
    season: "2024",
    table: [
      { position: 1, team: "USA", gold: 39, silver: 41, bronze: 33, total: 113 },
      { position: 2, team: "China", gold: 38, silver: 32, bronze: 19, total: 89 },
      { position: 3, team: "Japan", gold: 27, silver: 14, bronze: 17, total: 58 },
      { position: 4, team: "Australia", gold: 17, silver: 7, bronze: 22, total: 46 },
      { position: 5, team: "France", gold: 16, silver: 11, bronze: 23, total: 50 }
    ],
    isActive: true
  }
];

module.exports = leagueTablesData;
