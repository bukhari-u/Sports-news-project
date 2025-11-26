require('dotenv').config();
const mongoose = require('mongoose');
const News = require('./models/News');
const LiveEvent = require('./models/LiveEvent');
const Video = require('./models/Video');
const Fixture = require('./models/Fixture');
const Team = require('./models/Team');
const LeagueTable = require('./models/LeagueTable');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sportsdb';

async function connectDB() {
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');
}

async function clearExistingData() {
  await News.deleteMany({});
  await LiveEvent.deleteMany({});
  await Video.deleteMany({});
  await Fixture.deleteMany({});
  await Team.deleteMany({});
  await LeagueTable.deleteMany({});
  console.log('Cleared existing data');
}

// Import Teams Data
async function importTeamsData() {
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
          wins: 12,
          losses: 2,
          championships: 3
        },
        home: {
          wins: 8,
          losses: 0
        },
        away: {
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
      ]
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
          wins: 10,
          losses: 5,
          championships: 1
        },
        home: {
          wins: 6,
          losses: 1
        },
        away: {
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
      ]
    },
    {
      teamId: 16,
      name: "India",
      sport: "Cricket",
      league: "ICC",
      country: "India",
      featured: true,
      stats: {
        overall: {
          rating: 122,
          worldCups: 2
        },
        home: {
          rating: 125,
          wins: 8
        },
        away: {
          rating: 118,
          wins: 6
        }
      },
      keyPlayers: ["Rohit Sharma", "Virat Kohli", "Jasprit Bumrah"],
      logo: "IND",
      schedule: [
        { date: new Date("2024-11-20"), opponent: "Australia", location: "Home", time: "14:30" },
        { date: new Date("2024-11-25"), opponent: "England", location: "Home", time: "14:30" },
        { date: new Date("2024-12-02"), opponent: "South Africa", location: "Away", time: "10:00" },
        { date: new Date("2024-12-10"), opponent: "New Zealand", location: "Away", time: "11:00" }
      ],
      roster: [
        { name: "Rohit Sharma", position: "Batsman", number: 45 },
        { name: "Virat Kohli", position: "Batsman", number: 18 },
        { name: "KL Rahul", position: "Wicket-Keeper", number: 1 },
        { name: "Hardik Pandya", position: "All-rounder", number: 33 },
        { name: "Ravindra Jadeja", position: "All-rounder", number: 8 },
        { name: "Jasprit Bumrah", position: "Bowler", number: 93 },
        { name: "Mohammed Shami", position: "Bowler", number: 11 },
        { name: "Kuldeep Yadav", position: "Bowler", number: 23 }
      ]
    },
    {
      teamId: 17,
      name: "New Zealand",
      sport: "Cricket",
      league: "ICC",
      country: "New Zealand",
      featured: false,
      stats: {
        overall: {
          rating: 112,
          worldCups: 0
        },
        home: {
          rating: 115,
          wins: 7
        },
        away: {
          rating: 108,
          wins: 5
        }
      },
      keyPlayers: ["Kane Williamson", "Rachin Ravindra"],
      logo: "NZ",
      schedule: [
        { date: new Date("2024-11-18"), opponent: "Pakistan", location: "Home", time: "11:00" },
        { date: new Date("2024-11-24"), opponent: "Bangladesh", location: "Home", time: "11:00" },
        { date: new Date("2024-12-05"), opponent: "Sri Lanka", location: "Away", time: "14:30" },
        { date: new Date("2024-12-12"), opponent: "India", location: "Home", time: "11:00" }
      ],
      roster: [
        { name: "Kane Williamson", position: "Batsman", number: 22 },
        { name: "Trent Boult", position: "Bowler", number: 18 },
        { name: "Tim Southee", position: "Bowler", number: 38 },
        { name: "Devon Conway", position: "Batsman", number: 1 },
        { name: "Glenn Phillips", position: "All-rounder", number: 72 },
        { name: "Mitchell Santner", position: "All-rounder", number: 74 },
        { name: "Lockie Ferguson", position: "Bowler", number: 11 },
        { name: "Ish Sodhi", position: "Bowler", number: 31 }
      ]
    },
    {
      teamId: 21,
      name: "Los Angeles Dodgers",
      sport: "Baseball",
      league: "MLB",
      country: "USA",
      featured: true,
      stats: {
        overall: {
          wins: 93,
          losses: 69,
          worldSeries: 7
        },
        home: {
          wins: 50,
          losses: 31
        },
        away: {
          wins: 43,
          losses: 38
        }
      },
      keyPlayers: ["Shohei Ohtani", "Mookie Betts"],
      logo: "LAD",
      schedule: [
        { date: new Date("2024-11-15"), opponent: "San Francisco Giants", location: "Home", time: "19:10" },
        { date: new Date("2024-11-19"), opponent: "San Diego Padres", location: "Away", time: "18:40" },
        { date: new Date("2024-11-23"), opponent: "Arizona Diamondbacks", location: "Home", time: "19:10" },
        { date: new Date("2024-11-28"), opponent: "Colorado Rockies", location: "Away", time: "17:40" }
      ],
      roster: [
        { name: "Mookie Betts", position: "Outfielder", number: 50 },
        { name: "Freddie Freeman", position: "First Baseman", number: 5 },
        { name: "Will Smith", position: "Catcher", number: 16 },
        { name: "Max Muncy", position: "Third Baseman", number: 13 },
        { name: "J.D. Martinez", position: "Designated Hitter", number: 28 },
        { name: "James Outman", position: "Outfielder", number: 33 },
        { name: "Miguel Rojas", position: "Shortstop", number: 11 },
        { name: "David Peralta", position: "Outfielder", number: 6 }
      ]
    },
    {
      teamId: 24,
      name: "Florida Panthers",
      sport: "Hockey",
      league: "NHL",
      country: "USA",
      featured: true,
      stats: {
        overall: {
          points: 19,
          stanleyCups: 1
        },
        home: {
          points: 10,
          wins: 5
        },
        away: {
          points: 9,
          wins: 4
        }
      },
      keyPlayers: ["Matthew Tkachuk", "Aleksander Barkov"],
      logo: "FLA",
      schedule: [
        { date: new Date("2024-11-16"), opponent: "Tampa Bay Lightning", location: "Home", time: "19:00" },
        { date: new Date("2024-11-19"), opponent: "Boston Bruins", location: "Away", time: "19:00" },
        { date: new Date("2024-11-22"), opponent: "Toronto Maple Leafs", location: "Home", time: "19:00" },
        { date: new Date("2024-11-26"), opponent: "Montreal Canadiens", location: "Away", time: "19:00" }
      ],
      roster: [
        { name: "Aleksander Barkov", position: "Center", number: 16 },
        { name: "Matthew Tkachuk", position: "Left Wing", number: 19 },
        { name: "Sam Reinhart", position: "Right Wing", number: 13 },
        { name: "Aaron Ekblad", position: "Defenseman", number: 5 },
        { name: "Brandon Montour", position: "Defenseman", number: 62 },
        { name: "Sergei Bobrovsky", position: "Goaltender", number: 72 },
        { name: "Carter Verhaeghe", position: "Center", number: 23 },
        { name: "Sam Bennett", position: "Center", number: 9 }
      ]
    },
    {
      teamId: 27,
      name: "McLaren",
      sport: "Formula 1",
      league: "Formula 1",
      country: "UK",
      featured: true,
      stats: {
        overall: {
          points: 756,
          championships: 8
        },
        home: {
          points: 150,
          wins: 2
        },
        away: {
          points: 606,
          wins: 4
        }
      },
      keyPlayers: ["Lando Norris", "Oscar Piastri"],
      logo: "MCL",
      schedule: [
        { date: new Date("2024-11-17"), opponent: "Brazil Grand Prix", location: "São Paulo", time: "14:00" },
        { date: new Date("2024-11-24"), opponent: "Las Vegas Grand Prix", location: "Las Vegas", time: "22:00" },
        { date: new Date("2024-12-01"), opponent: "Qatar Grand Prix", location: "Lusail", time: "17:00" },
        { date: new Date("2024-12-08"), opponent: "Abu Dhabi Grand Prix", location: "Yas Marina", time: "17:00" }
      ],
      roster: [
        { name: "Lando Norris", position: "Driver", number: 4 },
        { name: "Oscar Piastri", position: "Driver", number: 81 },
        { name: "Andrea Stella", position: "Team Principal", number: null },
        { name: "Rob Marshall", position: "Chief Technical Officer", number: null }
      ]
    },
    {
      teamId: 30,
      name: "South Africa",
      sport: "Rugby",
      league: "World Rugby",
      country: "South Africa",
      featured: true,
      stats: {
        overall: {
          points: 93,
          worldCups: 4
        },
        home: {
          points: 50,
          wins: 10
        },
        away: {
          points: 43,
          wins: 8
        }
      },
      keyPlayers: ["Siya Kolisi", "Cheslin Kolbe"],
      logo: "RSA",
      schedule: [
        { date: new Date("2024-11-16"), opponent: "New Zealand", location: "Home", time: "17:05" },
        { date: new Date("2024-11-23"), opponent: "Australia", location: "Away", time: "19:35" },
        { date: new Date("2024-12-07"), opponent: "England", location: "Home", time: "17:05" },
        { date: new Date("2024-12-14"), opponent: "France", location: "Away", time: "21:00" }
      ],
      roster: [
        { name: "Siya Kolisi", position: "Flanker", number: 6 },
        { name: "Eben Etzebeth", position: "Lock", number: 4 },
        { name: "Cheslin Kolbe", position: "Wing", number: 14 },
        { name: "Faf de Klerk", position: "Scrum-half", number: 9 },
        { name: "Handré Pollard", position: "Fly-half", number: 10 },
        { name: "Malcolm Marx", position: "Hooker", number: 2 },
        { name: "Pieter-Steph du Toit", position: "Flanker", number: 7 },
        { name: "Damian de Allende", position: "Centre", number: 12 }
      ]
    }
  ];

  try {
    await Team.insertMany(teamsData);
    console.log(`✅ Teams imported successfully: ${teamsData.length} teams`);
  } catch (error) {
    console.error('❌ Error importing teams:', error);
  }
}

// Import League Tables Data
async function importLeagueTables() {
  const leagueTablesData = [
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
    },
    {
      leagueName: "Premier League",
      sport: "Football",
      table: [
        { position: 1, team: "Arsenal", played: 11, wins: 8, draws: 2, losses: 1, points: 26 },
        { position: 2, team: "Manchester City", played: 11, wins: 7, draws: 1, losses: 3, points: 22 },
        { position: 3, team: "Chelsea", played: 11, wins: 6, draws: 2, losses: 3, points: 20 },
        { position: 4, team: "Liverpool", played: 11, wins: 6, draws: 1, losses: 4, points: 19 },
        { position: 5, team: "Tottenham", played: 11, wins: 5, draws: 3, losses: 3, points: 18 }
      ]
    },
    {
      leagueName: "NBA",
      sport: "Basketball",
      table: [
        { position: 1, team: "Detroit Pistons", played: 14, wins: 12, losses: 2, points: 24 },
        { position: 2, team: "Oklahoma City Thunder", played: 15, wins: 14, losses: 1, points: 28 },
        { position: 3, team: "Denver Nuggets", played: 12, wins: 10, losses: 2, points: 20 },
        { position: 4, team: "Los Angeles Lakers", played: 14, wins: 10, losses: 4, points: 20 },
        { position: 5, team: "Cleveland Cavaliers", played: 15, wins: 10, losses: 5, points: 20 }
      ]
    },
    {
      leagueName: "ICC Cricket",
      sport: "Cricket",
      table: [
        { position: 1, team: "India", played: 15, wins: 12, losses: 3, points: 24 },
        { position: 2, team: "Australia", played: 14, wins: 10, losses: 4, points: 20 },
        { position: 3, team: "New Zealand", played: 13, wins: 9, losses: 4, points: 18 },
        { position: 4, team: "England", played: 14, wins: 8, losses: 6, points: 16 },
        { position: 5, team: "Pakistan", played: 13, wins: 7, losses: 6, points: 14 }
      ]
    },
    {
      leagueName: "MLB",
      sport: "Baseball",
      table: [
        { position: 1, team: "Los Angeles Dodgers", played: 162, wins: 93, losses: 69, points: 186 },
        { position: 2, team: "New York Yankees", played: 162, wins: 94, losses: 68, points: 188 },
        { position: 3, team: "Toronto Blue Jays", played: 162, wins: 94, losses: 68, points: 188 },
        { position: 4, team: "Houston Astros", played: 162, wins: 90, losses: 72, points: 180 },
        { position: 5, team: "Atlanta Braves", played: 162, wins: 89, losses: 73, points: 178 }
      ]
    },
    {
      leagueName: "NHL",
      sport: "Hockey",
      table: [
        { position: 1, team: "Florida Panthers", played: 20, wins: 15, losses: 5, points: 30 },
        { position: 2, team: "Colorado Avalanche", played: 19, wins: 14, losses: 5, points: 28 },
        { position: 3, team: "Toronto Maple Leafs", played: 20, wins: 13, losses: 7, points: 26 },
        { position: 4, team: "Boston Bruins", played: 19, wins: 12, losses: 7, points: 24 },
        { position: 5, team: "Vegas Golden Knights", played: 20, wins: 11, losses: 9, points: 22 }
      ]
    },
    {
      leagueName: "Formula 1",
      sport: "Formula 1",
      table: [
        { position: 1, team: "McLaren", points: 756 },
        { position: 2, team: "Mercedes", points: 398 },
        { position: 3, team: "Red Bull", points: 366 },
        { position: 4, team: "Ferrari", points: 334 },
        { position: 5, team: "Aston Martin", points: 280 }
      ]
    },
    {
      leagueName: "World Rugby",
      sport: "Rugby",
      table: [
        { position: 1, team: "South Africa", points: 93 },
        { position: 2, team: "New Zealand", points: 90 },
        { position: 3, team: "France", points: 88 },
        { position: 4, team: "Ireland", points: 87 },
        { position: 5, team: "England", points: 83 }
      ]
    }
  ];

  try {
    await LeagueTable.insertMany(leagueTablesData);
    console.log(`✅ League tables imported successfully: ${leagueTablesData.length} tables`);
  } catch (error) {
    console.error('❌ Error importing league tables:', error);
  }
}

// Your existing import functions for news, live events, videos, fixtures...
async function importData() {
  // News data - using the exact same data from scripts.js
  const newsData = [
    {
      sport: 'Football',
      league: 'La Liga',
      teams: { home: 'Real Madrid', away: 'Barcelona' },
      title: 'Los Blancos Shine as Barça Falters',
      excerpt: 'Real Madrid conquered El Clásico in thrilling fashion, blending flair, precision, and unyielding dominance to outshine Barcelona.',
      content: 'Real Madrid delivered a commanding performance to secure a 3-0 victory over Barcelona in El Clásico. Los Blancos dominated from start to finish, showcasing tactical brilliance and individual flair.',
      score: '3-0',
      status: 'Finished',
      venue: 'Santiago Bernabeu',
      date: new Date(),
      author: 'Alex Morgan',
      img: 'https://i.pinimg.com/736x/bd/f8/7f/bdf87f851419e4f63f82126a5eceae47.jpg',
      isFavorite: false,
      youtubeId: 'dQw4w9WgXcQ'
    },
    // ... rest of your existing news data
  ];

  // Live events data
  const liveEventsData = [
    {
      sport: 'Football',
      teams: { home: 'Manchester City', away: 'Liverpool' },
      score: '3-0',
      status: 'Live',
      minute: '75',
      league: 'Premier League',
      venue: 'Etihad Stadium',
      youtubeId: 'qsyFbyX5PuY'
    },
    // ... rest of your existing live events data
  ];

  // Videos data
  const videosData = [
    {
      title: 'Incredible Last-Minute Winner!',
      sport: 'Football',
      duration: '2:15',
      thumbnail: 'https://i.pinimg.com/1200x/b8/00/41/b8004132d0cd253c11f68a145617a4de.jpg',
      views: '125K',
      youtubeId: 'MaKmc1ZxX4Y'
    },
    // ... rest of your existing videos data
  ];

  // Fixtures data
  const fixturesData = [
    {
      teams: {
        home: {
          name: 'Chelsea',
          logo: 'https://example.com/chelsea.png',
          form: ['W', 'L', 'W', 'D', 'W']
        },
        away: {
          name: 'Arsenal',
          logo: 'https://example.com/arsenal.png',
          form: ['L', 'W', 'D', 'W', 'L']
        }
      },
      time: '15:00',
      date: new Date(),
      league: 'Premier League',
      sport: 'Football',
      venue: 'Stamford Bridge',
      status: 'Scheduled',
      round: 'Matchday 1',
      season: '2024',
      importance: 'high',
      odds: {
        homeWin: 2.1,
        draw: 3.4,
        awayWin: 3.2
      }
    },
    // ... rest of your existing fixtures data
  ];

  try {
    await News.insertMany(newsData);
    await LiveEvent.insertMany(liveEventsData);
    await Video.insertMany(videosData);
    await Fixture.insertMany(fixturesData);
    
    console.log('✅ Existing data imported successfully!');
    console.log(`📰 News: ${newsData.length} articles`);
    console.log(`🔴 Live Events: ${liveEventsData.length} events`);
    console.log(`🎥 Videos: ${videosData.length} videos`);
    console.log(`📅 Fixtures: ${fixturesData.length} fixtures`);
  } catch (error) {
    console.error('❌ Error importing existing data:', error);
  }
}

async function run() {
  try {
    await connectDB();
    await clearExistingData();
    await importData();
    await importTeamsData();
    await importLeagueTables();
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
}

run();