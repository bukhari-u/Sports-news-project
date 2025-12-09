const teamsData = [
  {
    teamId: 1,
    name: "Arsenal",
    sport: "Football",
    league: "Premier League",
    country: "England",
    featured: true,
    stats: {
      overall: {
        position: 1,
        played: 11,
        wins: 8,
        draws: 2,
        losses: 1,
        points: 26,
        trophies: 13
      },
      home: {
        position: 1,
        played: 6,
        wins: 5,
        draws: 1,
        losses: 0,
        points: 16
      },
      away: {
        position: 2,
        played: 5,
        wins: 3,
        draws: 1,
        losses: 1,
        points: 10
      }
    },
    keyPlayers: ["Bukayo Saka", "Martin Ødegaard", "William Saliba"],
    logo: "ARS",
    schedule: [
      { date: new Date("2024-11-15"), opponent: "Manchester City", location: "Home", time: "15:00" },
      { date: new Date("2024-11-22"), opponent: "Chelsea", location: "Away", time: "17:30" },
      { date: new Date("2024-11-29"), opponent: "Liverpool", location: "Home", time: "16:00" },
      { date: new Date("2024-12-06"), opponent: "Tottenham", location: "Away", time: "12:30" }
    ],
    roster: [
      { name: "Aaron Ramsdale", position: "Goalkeeper", number: 1 },
      { name: "William Saliba", position: "Defender", number: 2 },
      { name: "Kieran Tierney", position: "Defender", number: 3 },
      { name: "Ben White", position: "Defender", number: 4 },
      { name: "Thomas Partey", position: "Midfielder", number: 5 },
      { name: "Gabriel Magalhães", position: "Defender", number: 6 },
      { name: "Bukayo Saka", position: "Forward", number: 7 },
      { name: "Martin Ødegaard", position: "Midfielder", number: 8 },
      { name: "Gabriel Jesus", position: "Forward", number: 9 },
      { name: "Emile Smith Rowe", position: "Midfielder", number: 10 }
    ],
    isActive: true
  },
  {
    teamId: 2,
    name: "Manchester City",
    sport: "Football",
    league: "Premier League",
    country: "England",
    featured: true,
    stats: {
      overall: {
        position: 2,
        played: 11,
        wins: 7,
        draws: 1,
        losses: 3,
        points: 22,
        trophies: 9
      },
      home: {
        position: 2,
        played: 6,
        wins: 4,
        draws: 1,
        losses: 1,
        points: 13
      },
      away: {
        position: 3,
        played: 5,
        wins: 3,
        draws: 0,
        losses: 2,
        points: 9
      }
    },
    keyPlayers: ["Erling Haaland", "Phil Foden", "Rodri"],
    logo: "MCI",
    schedule: [
      { date: new Date("2024-11-15"), opponent: "Arsenal", location: "Away", time: "15:00" },
      { date: new Date("2024-11-22"), opponent: "Manchester United", location: "Home", time: "15:00" },
      { date: new Date("2024-11-29"), opponent: "Newcastle", location: "Away", time: "17:30" },
      { date: new Date("2024-12-06"), opponent: "Aston Villa", location: "Home", time: "15:00" }
    ],
    roster: [
      { name: "Ederson", position: "Goalkeeper", number: 31 },
      { name: "Kyle Walker", position: "Defender", number: 2 },
      { name: "Rúben Dias", position: "Defender", number: 3 },
      { name: "John Stones", position: "Defender", number: 5 },
      { name: "Rodri", position: "Midfielder", number: 16 },
      { name: "Kevin De Bruyne", position: "Midfielder", number: 17 },
      { name: "Bernardo Silva", position: "Midfielder", number: 20 },
      { name: "Phil Foden", position: "Midfielder", number: 47 },
      { name: "Erling Haaland", position: "Forward", number: 9 },
      { name: "Julián Álvarez", position: "Forward", number: 19 }
    ],
    isActive: true
  },
  {
    teamId: 3,
    name: "Chelsea",
    sport: "Football",
    league: "Premier League",
    country: "England",
    featured: false,
    stats: {
      overall: {
        position: 3,
        played: 11,
        wins: 6,
        draws: 2,
        losses: 3,
        points: 20,
        trophies: 6
      },
      home: {
        position: 4,
        played: 5,
        wins: 3,
        draws: 1,
        losses: 1,
        points: 10
      },
      away: {
        position: 3,
        played: 6,
        wins: 3,
        draws: 1,
        losses: 2,
        points: 10
      }
    },
    keyPlayers: ["Cole Palmer", "Reece James", "Enzo Fernández"],
    logo: "CHE",
    schedule: [
      { date: new Date("2024-11-15"), opponent: "Newcastle", location: "Home", time: "15:00" },
      { date: new Date("2024-11-22"), opponent: "Arsenal", location: "Home", time: "17:30" },
      { date: new Date("2024-11-29"), opponent: "Brighton", location: "Away", time: "15:00" },
      { date: new Date("2024-12-06"), opponent: "Manchester United", location: "Away", time: "16:00" }
    ],
    roster: [
      { name: "Robert Sánchez", position: "Goalkeeper", number: 1 },
      { name: "Reece James", position: "Defender", number: 24 },
      { name: "Thiago Silva", position: "Defender", number: 6 },
      { name: "Levi Colwill", position: "Defender", number: 26 },
      { name: "Enzo Fernández", position: "Midfielder", number: 8 },
      { name: "Moises Caicedo", position: "Midfielder", number: 25 },
      { name: "Conor Gallagher", position: "Midfielder", number: 23 },
      { name: "Cole Palmer", position: "Midfielder", number: 20 },
      { name: "Raheem Sterling", position: "Forward", number: 7 },
      { name: "Nicolas Jackson", position: "Forward", number: 15 }
    ],
    isActive: true
  },
  {
    teamId: 4,
    name: "Real Madrid",
    sport: "Football",
    league: "La Liga",
    country: "Spain",
    featured: true,
    stats: {
      overall: {
        position: 1,
        played: 12,
        wins: 9,
        draws: 2,
        losses: 1,
        points: 29,
        trophies: 35
      },
      home: {
        position: 1,
        played: 6,
        wins: 5,
        draws: 1,
        losses: 0,
        points: 16
      },
      away: {
        position: 1,
        played: 6,
        wins: 4,
        draws: 1,
        losses: 1,
        points: 13
      }
    },
    keyPlayers: ["Vinicius Jr", "Jude Bellingham", "Thibaut Courtois"],
    logo: "RMA",
    schedule: [
      { date: new Date("2024-11-16"), opponent: "Barcelona", location: "Home", time: "20:00" },
      { date: new Date("2024-11-23"), opponent: "Atletico Madrid", location: "Away", time: "18:30" },
      { date: new Date("2024-11-30"), opponent: "Sevilla", location: "Home", time: "16:15" },
      { date: new Date("2024-12-07"), opponent: "Valencia", location: "Away", time: "21:00" }
    ],
    roster: [
      { name: "Thibaut Courtois", position: "Goalkeeper", number: 1 },
      { name: "Dani Carvajal", position: "Defender", number: 2 },
      { name: "David Alaba", position: "Defender", number: 4 },
      { name: "Antonio Rüdiger", position: "Defender", number: 22 },
      { name: "Aurélien Tchouaméni", position: "Midfielder", number: 18 },
      { name: "Federico Valverde", position: "Midfielder", number: 15 },
      { name: "Jude Bellingham", position: "Midfielder", number: 5 },
      { name: "Luka Modrić", position: "Midfielder", number: 10 },
      { name: "Vinicius Jr", position: "Forward", number: 7 },
      { name: "Rodrygo", position: "Forward", number: 11 }
    ],
    isActive: true
  },
  {
    teamId: 5,
    name: "Barcelona",
    sport: "Football",
    league: "La Liga",
    country: "Spain",
    featured: false,
    stats: {
      overall: {
        position: 2,
        played: 12,
        wins: 8,
        draws: 3,
        losses: 1,
        points: 27,
        trophies: 26
      },
      home: {
        position: 2,
        played: 6,
        wins: 5,
        draws: 1,
        losses: 0,
        points: 16
      },
      away: {
        position: 2,
        played: 6,
        wins: 3,
        draws: 2,
        losses: 1,
        points: 11
      }
    },
    keyPlayers: ["Robert Lewandowski", "Pedri", "Frenkie de Jong"],
    logo: "BAR",
    schedule: [
      { date: new Date("2024-11-16"), opponent: "Real Madrid", location: "Away", time: "20:00" },
      { date: new Date("2024-11-23"), opponent: "Real Sociedad", location: "Home", time: "18:30" },
      { date: new Date("2024-11-30"), opponent: "Athletic Bilbao", location: "Away", time: "16:15" },
      { date: new Date("2024-12-07"), opponent: "Atletico Madrid", location: "Home", time: "21:00" }
    ],
    roster: [
      { name: "Marc-André ter Stegen", position: "Goalkeeper", number: 1 },
      { name: "João Cancelo", position: "Defender", number: 2 },
      { name: "Ronald Araújo", position: "Defender", number: 4 },
      { name: "Jules Koundé", position: "Defender", number: 23 },
      { name: "Frenkie de Jong", position: "Midfielder", number: 21 },
      { name: "Pedri", position: "Midfielder", number: 8 },
      { name: "Gavi", position: "Midfielder", number: 6 },
      { name: "İlkay Gündoğan", position: "Midfielder", number: 22 },
      { name: "Robert Lewandowski", position: "Forward", number: 9 },
      { name: "Raphinha", position: "Forward", number: 11 }
    ],
    isActive: true
  },
  {
    teamId: 6,
    name: "Bayern Munich",
    sport: "Football",
    league: "Bundesliga",
    country: "Germany",
    featured: true,
    stats: {
      overall: {
        position: 1,
        played: 10,
        wins: 8,
        draws: 1,
        losses: 1,
        points: 25,
        trophies: 32
      },
      home: {
        position: 1,
        played: 5,
        wins: 4,
        draws: 1,
        losses: 0,
        points: 13
      },
      away: {
        position: 1,
        played: 5,
        wins: 4,
        draws: 0,
        losses: 1,
        points: 12
      }
    },
    keyPlayers: ["Harry Kane", "Jamal Musiala", "Manuel Neuer"],
    logo: "BAY",
    schedule: [
      { date: new Date("2024-11-15"), opponent: "Borussia Dortmund", location: "Home", time: "18:30" },
      { date: new Date("2024-11-22"), opponent: "Bayer Leverkusen", location: "Away", time: "17:30" },
      { date: new Date("2024-11-29"), opponent: "Stuttgart", location: "Home", time: "15:30" },
      { date: new Date("2024-12-06"), opponent: "Eintracht Frankfurt", location: "Away", time: "15:30" }
    ],
    roster: [
      { name: "Manuel Neuer", position: "Goalkeeper", number: 1 },
      { name: "Joshua Kimmich", position: "Defender", number: 6 },
      { name: "Matthijs de Ligt", position: "Defender", number: 4 },
      { name: "Dayot Upamecano", position: "Defender", number: 2 },
      { name: "Leon Goretzka", position: "Midfielder", number: 8 },
      { name: "Jamal Musiala", position: "Midfielder", number: 42 },
      { name: "Thomas Müller", position: "Midfielder", number: 25 },
      { name: "Leroy Sané", position: "Forward", number: 10 },
      { name: "Serge Gnabry", position: "Forward", number: 7 },
      { name: "Harry Kane", position: "Forward", number: 9 }
    ],
    isActive: true
  },
  {
    teamId: 7,
    name: "Paris Saint-Germain",
    sport: "Football",
    league: "Ligue 1",
    country: "France",
    featured: false,
    stats: {
      overall: {
        position: 1,
        played: 11,
        wins: 9,
        draws: 1,
        losses: 1,
        points: 28,
        trophies: 11
      },
      home: {
        position: 1,
        played: 6,
        wins: 5,
        draws: 1,
        losses: 0,
        points: 16
      },
      away: {
        position: 1,
        played: 5,
        wins: 4,
        draws: 0,
        losses: 1,
        points: 12
      }
    },
    keyPlayers: ["Kylian Mbappé", "Achraf Hakimi", "Marquinhos"],
    logo: "PSG",
    schedule: [
      { date: new Date("2024-11-15"), opponent: "Marseille", location: "Home", time: "21:00" },
      { date: new Date("2024-11-22"), opponent: "Lyon", location: "Away", time: "17:00" },
      { date: new Date("2024-11-29"), opponent: "Lille", location: "Home", time: "20:00" },
      { date: new Date("2024-12-06"), opponent: "Monaco", location: "Away", time: "20:00" }
    ],
    roster: [
      { name: "Gianluigi Donnarumma", position: "Goalkeeper", number: 99 },
      { name: "Achraf Hakimi", position: "Defender", number: 2 },
      { name: "Marquinhos", position: "Defender", number: 5 },
      { name: "Presnel Kimpembe", position: "Defender", number: 3 },
      { name: "Marco Verratti", position: "Midfielder", number: 6 },
      { name: "Vitinha", position: "Midfielder", number: 17 },
      { name: "Fabian Ruiz", position: "Midfielder", number: 8 },
      { name: "Ousmane Dembélé", position: "Forward", number: 10 },
      { name: "Neymar Jr", position: "Forward", number: 10 },
      { name: "Kylian Mbappé", position: "Forward", number: 7 }
    ],
    isActive: true
  },
  {
    teamId: 8,
    name: "Juventus",
    sport: "Football",
    league: "Serie A",
    country: "Italy",
    featured: false,
    stats: {
      overall: {
        position: 2,
        played: 11,
        wins: 7,
        draws: 3,
        losses: 1,
        points: 24,
        trophies: 36
      },
      home: {
        position: 2,
        played: 6,
        wins: 4,
        draws: 2,
        losses: 0,
        points: 14
      },
      away: {
        position: 3,
        played: 5,
        wins: 3,
        draws: 1,
        losses: 1,
        points: 10
      }
    },
    keyPlayers: ["Dusan Vlahovic", "Federico Chiesa", "Wojciech Szczęsny"],
    logo: "JUV",
    schedule: [
      { date: new Date("2024-11-16"), opponent: "AC Milan", location: "Home", time: "20:45" },
      { date: new Date("2024-11-23"), opponent: "Inter Milan", location: "Away", time: "18:00" },
      { date: new Date("2024-11-30"), opponent: "Napoli", location: "Home", time: "20:45" },
      { date: new Date("2024-12-07"), opponent: "Roma", location: "Away", time: "18:00" }
    ],
    roster: [
      { name: "Wojciech Szczęsny", position: "Goalkeeper", number: 1 },
      { name: "Danilo", position: "Defender", number: 6 },
      { name: "Gleison Bremer", position: "Defender", number: 3 },
      { name: "Alex Sandro", position: "Defender", number: 12 },
      { name: "Manuel Locatelli", position: "Midfielder", number: 5 },
      { name: "Adrien Rabiot", position: "Midfielder", number: 25 },
      { name: "Weston McKennie", position: "Midfielder", number: 16 },
      { name: "Federico Chiesa", position: "Forward", number: 7 },
      { name: "Arkadiusz Milik", position: "Forward", number: 14 },
      { name: "Dusan Vlahovic", position: "Forward", number: 9 }
    ],
    isActive: true
  },
  {
    teamId: 9,
    name: "AC Milan",
    sport: "Football",
    league: "Serie A",
    country: "Italy",
    featured: false,
    stats: {
      overall: {
        position: 3,
        played: 11,
        wins: 7,
        draws: 2,
        losses: 2,
        points: 23,
        trophies: 19
      },
      home: {
        position: 3,
        played: 6,
        wins: 4,
        draws: 1,
        losses: 1,
        points: 13
      },
      away: {
        position: 2,
        played: 5,
        wins: 3,
        draws: 1,
        losses: 1,
        points: 10
      }
    },
    keyPlayers: ["Rafael Leão", "Theo Hernandez", "Mike Maignan"],
    logo: "MIL",
    schedule: [
      { date: new Date("2024-11-16"), opponent: "Juventus", location: "Away", time: "20:45" },
      { date: new Date("2024-11-23"), opponent: "Fiorentina", location: "Home", time: "20:45" },
      { date: new Date("2024-11-30"), opponent: "Lazio", location: "Away", time: "18:00" },
      { date: new Date("2024-12-07"), opponent: "Atalanta", location: "Home", time: "20:45" }
    ],
    roster: [
      { name: "Mike Maignan", position: "Goalkeeper", number: 16 },
      { name: "Davide Calabria", position: "Defender", number: 2 },
      { name: "Fikayo Tomori", position: "Defender", number: 23 },
      { name: "Theo Hernandez", position: "Defender", number: 19 },
      { name: "Ismaël Bennacer", position: "Midfielder", number: 4 },
      { name: "Sandro Tonali", position: "Midfielder", number: 8 },
      { name: "Brahim Díaz", position: "Midfielder", number: 10 },
      { name: "Rafael Leão", position: "Forward", number: 17 },
      { name: "Olivier Giroud", position: "Forward", number: 9 },
      { name: "Zlatan Ibrahimović", position: "Forward", number: 11 }
    ],
    isActive: true
  },
  {
    teamId: 10,
    name: "Liverpool",
    sport: "Football",
    league: "Premier League",
    country: "England",
    featured: true,
    stats: {
      overall: {
        position: 8,
        played: 11,
        wins: 5,
        draws: 3,
        losses: 3,
        points: 18,
        trophies: 19
      },
      home: {
        position: 7,
        played: 6,
        wins: 3,
        draws: 2,
        losses: 1,
        points: 11
      },
      away: {
        position: 9,
        played: 5,
        wins: 2,
        draws: 1,
        losses: 2,
        points: 7
      }
    },
    keyPlayers: ["Mohamed Salah", "Trent Alexander-Arnold", "Virgil van Dijk"],
    logo: "LIV",
    schedule: [
      { date: new Date("2024-11-15"), opponent: "Manchester United", location: "Home", time: "16:00" },
      { date: new Date("2024-11-22"), opponent: "Tottenham", location: "Away", time: "15:00" },
      { date: new Date("2024-11-29"), opponent: "Arsenal", location: "Away", time: "16:00" },
      { date: new Date("2024-12-06"), opponent: "Everton", location: "Home", time: "12:30" }
    ],
    roster: [
      { name: "Alisson Becker", position: "Goalkeeper", number: 1 },
      { name: "Trent Alexander-Arnold", position: "Defender", number: 66 },
      { name: "Virgil van Dijk", position: "Defender", number: 4 },
      { name: "Ibrahima Konaté", position: "Defender", number: 5 },
      { name: "Andrew Robertson", position: "Defender", number: 26 },
      { name: "Fabinho", position: "Midfielder", number: 3 },
      { name: "Jordan Henderson", position: "Midfielder", number: 14 },
      { name: "Thiago Alcântara", position: "Midfielder", number: 6 },
      { name: "Mohamed Salah", position: "Forward", number: 11 },
      { name: "Darwin Núñez", position: "Forward", number: 27 }
    ],
    isActive: true
  },
  {
    teamId: 11,
    name: "Detroit Pistons",
    sport: "Basketball",
    league: "NBA",
    country: "USA",
    featured: true,
    stats: {
      overall: {
        position: 5,
        played: 14,
        wins: 12,
        losses: 2,
        championships: 3
      },
      home: {
        position: 2,
        played: 8,
        wins: 8,
        losses: 0
      },
      away: {
        position: 8,
        played: 6,
        wins: 4,
        losses: 2
      }
    },
    keyPlayers: ["Cade Cunningham", "Jalen Duren"],
    logo: "DET",
    schedule: [
      { date: new Date("2024-11-15"), opponent: "Boston Celtics", location: "Home", time: "19:00" },
      { date: new Date("2024-11-18"), opponent: "Chicago Bulls", location: "Away", time: "20:00" },
      { date: new Date("2024-11-21"), opponent: "Milwaukee Bucks", location: "Home", time: "19:30" },
      { date: new Date("2024-11-25"), opponent: "Atlanta Hawks", location: "Away", time: "19:30" }
    ],
    roster: [
      { name: "Cade Cunningham", position: "Point Guard", number: 2 },
      { name: "Jaden Ivey", position: "Shooting Guard", number: 23 },
      { name: "Bojan Bogdanović", position: "Small Forward", number: 44 },
      { name: "Isaiah Stewart", position: "Power Forward", number: 28 },
      { name: "Jalen Duren", position: "Center", number: 0 },
      { name: "Alec Burks", position: "Guard", number: 5 },
      { name: "Marvin Bagley III", position: "Forward", number: 35 },
      { name: "James Wiseman", position: "Center", number: 13 }
    ],
    isActive: true
  },
  {
    teamId: 12,
    name: "Cleveland Cavaliers",
    sport: "Basketball",
    league: "NBA",
    country: "USA",
    featured: false,
    stats: {
      overall: {
        position: 6,
        played: 15,
        wins: 10,
        losses: 5,
        championships: 1
      },
      home: {
        position: 3,
        played: 7,
        wins: 6,
        losses: 1
      },
      away: {
        position: 10,
        played: 8,
        wins: 4,
        losses: 4
      }
    },
    keyPlayers: ["Donovan Mitchell", "Evan Mobley"],
    logo: "CLE",
    schedule: [
      { date: new Date("2024-11-16"), opponent: "New York Knicks", location: "Home", time: "19:30" },
      { date: new Date("2024-11-19"), opponent: "Philadelphia 76ers", location: "Away", time: "19:00" },
      { date: new Date("2024-11-22"), opponent: "Indiana Pacers", location: "Home", time: "19:00" },
      { date: new Date("2024-11-26"), opponent: "Toronto Raptors", location: "Away", time: "19:30" }
    ],
    roster: [
      { name: "Darius Garland", position: "Point Guard", number: 10 },
      { name: "Donovan Mitchell", position: "Shooting Guard", number: 45 },
      { name: "Caris LeVert", position: "Small Forward", number: 3 },
      { name: "Evan Mobley", position: "Power Forward", number: 4 },
      { name: "Jarrett Allen", position: "Center", number: 31 },
      { name: "Isaac Okoro", position: "Forward", number: 35 },
      { name: "Ricky Rubio", position: "Guard", number: 13 },
      { name: "Dean Wade", position: "Forward", number: 32 }
    ],
    isActive: true
  },
  {
    teamId: 13,
    name: "Golden State Warriors",
    sport: "Basketball",
    league: "NBA",
    country: "USA",
    logo: "GSW",
    featured: false,
    stats: {
      overall: { 
        position: 10, 
        played: 82, 
        wins: 46, 
        losses: 36, 
        points: 0,
        championships: 7
      },
      home: { 
        position: 8, 
        played: 41, 
        wins: 25, 
        losses: 16, 
        points: 0 
      },
      away: { 
        position: 10, 
        played: 41, 
        wins: 21, 
        losses: 20, 
        points: 0 
      }
    },
    keyPlayers: ["Stephen Curry", "Klay Thompson", "Draymond Green", "Chris Paul"],
    schedule: [
      { date: new Date("2024-11-15"), opponent: "Denver Nuggets", location: "Home", time: "19:30" },
      { date: new Date("2024-11-18"), opponent: "Phoenix Suns", location: "Away", time: "20:00" },
      { date: new Date("2024-11-21"), opponent: "Sacramento Kings", location: "Home", time: "19:00" },
      { date: new Date("2024-11-25"), opponent: "LA Clippers", location: "Away", time: "19:30" }
    ],
    roster: [
      { name: "Stephen Curry", position: "Point Guard", number: 30 },
      { name: "Klay Thompson", position: "Shooting Guard", number: 11 },
      { name: "Andrew Wiggins", position: "Small Forward", number: 22 },
      { name: "Draymond Green", position: "Power Forward", number: 23 },
      { name: "Kevon Looney", position: "Center", number: 5 },
      { name: "Chris Paul", position: "Point Guard", number: 3 },
      { name: "Gary Payton II", position: "Shooting Guard", number: 0 },
      { name: "Jonathan Kuminga", position: "Forward", number: 1 },
      { name: "Moses Moody", position: "Shooting Guard", number: 4 },
      { name: "Dario Šarić", position: "Forward", number: 20 }
    ],
    isActive: true
  },
  {
    teamId: 14,
    name: "Los Angeles Lakers",
    sport: "Basketball",
    league: "NBA",
    country: "USA",
    logo: "LAL",
    featured: false,
    stats: {
      overall: { 
        position: 7, 
        played: 82, 
        wins: 47, 
        losses: 35, 
        points: 0,
        championships: 17
      },
      home: { 
        position: 6, 
        played: 41, 
        wins: 27, 
        losses: 14, 
        points: 0 
      },
      away: { 
        position: 8, 
        played: 41, 
        wins: 20, 
        losses: 21, 
        points: 0 
      }
    },
    keyPlayers: ["LeBron James", "Anthony Davis", "Austin Reaves", "D'Angelo Russell"],
    schedule: [
      { date: new Date("2024-11-16"), opponent: "Memphis Grizzlies", location: "Home", time: "19:30" },
      { date: new Date("2024-11-19"), opponent: "Portland Trail Blazers", location: "Away", time: "19:00" },
      { date: new Date("2024-11-22"), opponent: "Oklahoma City Thunder", location: "Home", time: "19:30" },
      { date: new Date("2024-11-26"), opponent: "New Orleans Pelicans", location: "Away", time: "20:00" }
    ],
    roster: [
      { name: "LeBron James", position: "Small Forward", number: 23 },
      { name: "Anthony Davis", position: "Power Forward", number: 3 },
      { name: "Austin Reaves", position: "Shooting Guard", number: 15 },
      { name: "D'Angelo Russell", position: "Point Guard", number: 1 },
      { name: "Rui Hachimura", position: "Forward", number: 28 },
      { name: "Jarred Vanderbilt", position: "Forward", number: 2 },
      { name: "Taurean Prince", position: "Small Forward", number: 12 },
      { name: "Jaxson Hayes", position: "Center", number: 11 },
      { name: "Cam Reddish", position: "Small Forward", number: 5 },
      { name: "Christian Wood", position: "Forward", number: 35 }
    ],
    isActive: true
  },
  {
    teamId: 15,
    name: "Los Angeles Dodgers",
    sport: "Baseball",
    league: "MLB",
    country: "USA",
    logo: "LAD",
    featured: true,
    stats: {
      overall: { 
        position: 1, 
        played: 70, 
        wins: 48, 
        losses: 22, 
        points: 0,
        championships: 7
      },
      home: { 
        position: 1, 
        played: 35, 
        wins: 26, 
        losses: 9, 
        points: 0 
      },
      away: { 
        position: 1, 
        played: 35, 
        wins: 22, 
        losses: 13, 
        points: 0 
      }
    },
    keyPlayers: ["Shohei Ohtani", "Mookie Betts", "Freddie Freeman", "Clayton Kershaw"],
    schedule: [
      { date: new Date("2024-11-15"), opponent: "San Francisco Giants", location: "Home", time: "19:10" },
      { date: new Date("2024-11-18"), opponent: "San Diego Padres", location: "Away", time: "18:40" },
      { date: new Date("2024-11-22"), opponent: "Arizona Diamondbacks", location: "Home", time: "19:10" },
      { date: new Date("2024-11-26"), opponent: "Colorado Rockies", location: "Away", time: "17:40" }
    ],
    roster: [
      { name: "Shohei Ohtani", position: "Designated Hitter", number: 17 },
      { name: "Mookie Betts", position: "Right Field", number: 50 },
      { name: "Freddie Freeman", position: "First Base", number: 5 },
      { name: "Will Smith", position: "Catcher", number: 16 },
      { name: "Max Muncy", position: "Third Base", number: 13 },
      { name: "Teoscar Hernández", position: "Left Field", number: 37 },
      { name: "Gavin Lux", position: "Second Base", number: 9 },
      { name: "James Outman", position: "Center Field", number: 33 },
      { name: "Miguel Rojas", position: "Shortstop", number: 11 },
      { name: "Clayton Kershaw", position: "Pitcher", number: 22 }
    ],
    isActive: true
  },
  {
    teamId: 16,
    name: "India",
    sport: "Cricket",
    league: "ICC",
    country: "India",
    logo: "IND",
    featured: true,
    stats: {
      overall: {
        position: 1,
        played: 35,
        wins: 25,
        losses: 8,
        draws: 2,
        points: 52,
        trophies: 5
      },
      home: {
        position: 1,
        played: 18,
        wins: 15,
        losses: 2,
        draws: 1,
        points: 31
      },
      away: {
        position: 1,
        played: 17,
        wins: 10,
        losses: 6,
        draws: 1,
        points: 21
      }
    },
    keyPlayers: ["Virat Kohli", "Rohit Sharma", "Jasprit Bumrah", "Hardik Pandya"],
    schedule: [
      { date: new Date("2024-11-15"), opponent: "Australia", location: "Home", time: "14:30" },
      { date: new Date("2024-11-20"), opponent: "England", location: "Home", time: "14:30" },
      { date: new Date("2024-11-25"), opponent: "South Africa", location: "Away", time: "10:00" },
      { date: new Date("2024-11-30"), opponent: "New Zealand", location: "Away", time: "11:00" }
    ],
    roster: [
      { name: "Rohit Sharma", position: "Batsman", number: 45 },
      { name: "Virat Kohli", position: "Batsman", number: 18 },
      { name: "KL Rahul", position: "Wicket-Keeper", number: 1 },
      { name: "Rishabh Pant", position: "Wicket-Keeper", number: 17 },
      { name: "Hardik Pandya", position: "All-rounder", number: 33 },
      { name: "Ravindra Jadeja", position: "All-rounder", number: 8 },
      { name: "Jasprit Bumrah", position: "Bowler", number: 93 },
      { name: "Mohammed Shami", position: "Bowler", number: 11 },
      { name: "Kuldeep Yadav", position: "Bowler", number: 23 },
      { name: "Mohammed Siraj", position: "Bowler", number: 13 }
    ],
    isActive: true
  },
  {
    teamId: 17,
    name: "New Zealand",
    sport: "Cricket",
    league: "ICC",
    country: "New Zealand",
    logo: "NZ",
    featured: false,
    stats: {
      overall: {
        position: 3,
        played: 35,
        wins: 20,
        losses: 12,
        draws: 3,
        points: 43,
        trophies: 0
      },
      home: {
        position: 2,
        played: 18,
        wins: 12,
        losses: 4,
        draws: 2,
        points: 26
      },
      away: {
        position: 4,
        played: 17,
        wins: 8,
        losses: 8,
        draws: 1,
        points: 17
      }
    },
    keyPlayers: ["Kane Williamson", "Trent Boult", "Rachin Ravindra"],
    schedule: [
      { date: new Date("2024-11-16"), opponent: "Pakistan", location: "Home", time: "11:00" },
      { date: new Date("2024-11-21"), opponent: "Bangladesh", location: "Home", time: "11:00" },
      { date: new Date("2024-11-26"), opponent: "Sri Lanka", location: "Away", time: "14:30" },
      { date: new Date("2024-12-01"), opponent: "West Indies", location: "Away", time: "19:00" }
    ],
    roster: [
      { name: "Kane Williamson", position: "Batsman", number: 22 },
      { name: "Trent Boult", position: "Bowler", number: 18 },
      { name: "Tim Southee", position: "Bowler", number: 38 },
      { name: "Devon Conway", position: "Batsman", number: 1 },
      { name: "Tom Latham", position: "Wicket-Keeper", number: 48 },
      { name: "Glenn Phillips", position: "All-rounder", number: 1 },
      { name: "Mitchell Santner", position: "All-rounder", number: 74 },
      { name: "Lockie Ferguson", position: "Bowler", number: 11 },
      { name: "Daryl Mitchell", position: "All-rounder", number: 1 },
      { name: "Rachin Ravindra", position: "All-rounder", number: 8 }
    ],
    isActive: true
  },
  {
    teamId: 18,
    name: "Boston Red Sox",
    sport: "Baseball",
    league: "MLB",
    country: "USA",
    logo: "BOS",
    featured: false,
    stats: {
      overall: { 
        position: 2, 
        played: 70, 
        wins: 42, 
        losses: 28, 
        points: 0,
        championships: 9
      },
      home: { 
        position: 2, 
        played: 35, 
        wins: 23, 
        losses: 12, 
        points: 0 
      },
      away: { 
        position: 2, 
        played: 35, 
        wins: 19, 
        losses: 16, 
        points: 0 
      }
    },
    keyPlayers: ["Rafael Devers", "Chris Sale", "Trevor Story", "Masataka Yoshida"],
    schedule: [
      { date: new Date("2024-11-15"), opponent: "New York Yankees", location: "Away", time: "19:05" },
      { date: new Date("2024-11-18"), opponent: "Tampa Bay Rays", location: "Home", time: "19:10" },
      { date: new Date("2024-11-22"), opponent: "Baltimore Orioles", location: "Away", time: "19:05" },
      { date: new Date("2024-11-26"), opponent: "Toronto Blue Jays", location: "Home", time: "19:10" }
    ],
    roster: [
      { name: "Rafael Devers", position: "Third Base", number: 11 },
      { name: "Trevor Story", position: "Shortstop", number: 10 },
      { name: "Masataka Yoshida", position: "Left Field", number: 7 },
      { name: "Alex Verdugo", position: "Right Field", number: 99 },
      { name: "Triston Casas", position: "First Base", number: 36 },
      { name: "Connor Wong", position: "Catcher", number: 12 },
      { name: "Enmanuel Valdez", position: "Second Base", number: 1 },
      { name: "Jarren Duran", position: "Center Field", number: 16 },
      { name: "Brayan Bello", position: "Pitcher", number: 66 },
      { name: "Chris Sale", position: "Pitcher", number: 41 }
    ],
    isActive: true
  },
  {
    teamId: 19,
    name: "Toronto Maple Leafs",
    sport: "Hockey",
    league: "NHL",
    country: "Canada",
    logo: "TOR",
    featured: false,
    stats: {
      overall: { 
        position: 1, 
        played: 20, 
        wins: 13, 
        losses: 7, 
        points: 26,
        championships: 13
      },
      home: { 
        position: 1, 
        played: 10, 
        wins: 8, 
        losses: 2, 
        points: 16 
      },
      away: { 
        position: 1, 
        played: 10, 
        wins: 5, 
        losses: 5, 
        points: 10 
      }
    },
    keyPlayers: ["Auston Matthews", "Mitchell Marner", "William Nylander"],
    schedule: [
      { date: new Date("2024-11-15"), opponent: "Montreal Canadiens", location: "Home", time: "19:00" },
      { date: new Date("2024-11-18"), opponent: "Boston Bruins", location: "Away", time: "19:30" },
      { date: new Date("2024-11-22"), opponent: "Ottawa Senators", location: "Home", time: "19:00" },
      { date: new Date("2024-11-26"), opponent: "Detroit Red Wings", location: "Away", time: "19:30" }
    ],
    roster: [
      { name: "Auston Matthews", position: "Center", number: 34 },
      { name: "Mitchell Marner", position: "Right Wing", number: 16 },
      { name: "William Nylander", position: "Right Wing", number: 88 },
      { name: "John Tavares", position: "Center", number: 91 },
      { name: "Morgan Rielly", position: "Defenseman", number: 44 },
      { name: "TJ Brodie", position: "Defenseman", number: 78 },
      { name: "Jake McCabe", position: "Defenseman", number: 22 },
      { name: "Ilya Samsonov", position: "Goaltender", number: 35 },
      { name: "Joseph Woll", position: "Goaltender", number: 60 },
      { name: "Matthew Knies", position: "Left Wing", number: 23 }
    ],
    isActive: true
  },
  {
    teamId: 20,
    name: "Montreal Canadiens",
    sport: "Hockey",
    league: "NHL",
    country: "Canada",
    logo: "MTL",
    featured: false,
    stats: {
      overall: { 
        position: 5, 
        played: 20, 
        wins: 9, 
        losses: 11, 
        points: 18,
        championships: 24
      },
      home: { 
        position: 4, 
        played: 10, 
        wins: 6, 
        losses: 4, 
        points: 12 
      },
      away: { 
        position: 6, 
        played: 10, 
        wins: 3, 
        losses: 7, 
        points: 6 
      }
    },
    keyPlayers: ["Nick Suzuki", "Cole Caufield", "Brendan Gallagher"],
    schedule: [
      { date: new Date("2024-11-15"), opponent: "Toronto Maple Leafs", location: "Away", time: "19:00" },
      { date: new Date("2024-11-19"), opponent: "Vancouver Canucks", location: "Home", time: "19:30" },
      { date: new Date("2024-11-23"), opponent: "Edmonton Oilers", location: "Away", time: "20:00" },
      { date: new Date("2024-11-27"), opponent: "Calgary Flames", location: "Home", time: "19:00" }
    ],
    roster: [
      { name: "Nick Suzuki", position: "Center", number: 14 },
      { name: "Cole Caufield", position: "Right Wing", number: 22 },
      { name: "Brendan Gallagher", position: "Right Wing", number: 11 },
      { name: "Mike Matheson", position: "Defenseman", number: 8 },
      { name: "David Savard", position: "Defenseman", number: 58 },
      { name: "Kaiden Guhle", position: "Defenseman", number: 21 },
      { name: "Jake Allen", position: "Goaltender", number: 34 },
      { name: "Sam Montembeault", position: "Goaltender", number: 35 },
      { name: "Josh Anderson", position: "Right Wing", number: 17 },
      { name: "Kirby Dach", position: "Center", number: 77 }
    ],
    isActive: true
  }
];

module.exports = teamsData;