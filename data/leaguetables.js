const leagueTablesData = [
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
    sport: "Football",
    table: [
      { position: 1, team: "Real Madrid", played: 12, wins: 9, draws: 2, losses: 1, points: 29 },
      { position: 2, team: "Barcelona", played: 12, wins: 8, draws: 3, losses: 1, points: 27 },
      { position: 3, team: "Atletico Madrid", played: 12, wins: 8, draws: 1, losses: 3, points: 25 },
      { position: 4, team: "Girona", played: 12, wins: 7, draws: 2, losses: 3, points: 23 },
      { position: 5, team: "Athletic Bilbao", played: 12, wins: 6, draws: 3, losses: 3, points: 21 }
    ]
  }
];

module.exports = leagueTablesData;