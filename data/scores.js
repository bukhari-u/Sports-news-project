const scoresData = [
  // Live Matches - UPDATED STRUCTURE
  {
    matchId: '101',
    sport: 'Football',
    league: 'Premier League',
    teams: {
      home: { name: 'Manchester City', logo: 'MC', score: '2' },
      away: { name: 'Liverpool', logo: 'LIV', score: '1' }
    },
    status: 'live',
    minute: '75',
    venue: 'Etihad Stadium',
    time: new Date(),
    competition: 'Premier League • Etihad Stadium',
    matchDetails: {
      venue: 'Etihad Stadium',
      time: 'Live - 2nd Half'
    },
    stats: {
      possession: '58% - 42%',
      shots: '14 - 8',
      shotsOnTarget: '6 - 3',
      corners: '5 - 2',
      fouls: '12 - 15',
      yellowCards: '2 - 3',
      redCards: '0 - 0',
      offsides: '1 - 2'
    },
    teamStats: {
      home: {
        name: 'Manchester City',
        shots: 14,
        shotsOnTarget: 6,
        passes: 512,
        passAccuracy: '87%',
        tackles: 18,
        interceptions: 12
      },
      away: {
        name: 'Liverpool',
        shots: 8,
        shotsOnTarget: 3,
        passes: 389,
        passAccuracy: '79%',
        tackles: 22,
        interceptions: 15
      }
    },
    // --- NEW: Added highlights for live match ---
    highlights: {
      videoId: 'mc_liv_highlights_101',
      summary: 'Manchester City leads 2-1 in a tense match. Key moments include a stunning long-range goal in the 35th minute and a crucial penalty save by the City keeper just before halftime.'
    },
    isActive: true
  },
  {
    matchId: '102',
    sport: 'Basketball',
    league: 'NBA',
    teams: {
      home: { name: 'Boston Celtics', logo: 'BOS', score: '95' },
      away: { name: 'LA Lakers', logo: 'LAL', score: '98' }
    },
    status: 'live',
    minute: 'Q4',
    venue: 'TD Garden',
    time: new Date(),
    competition: 'NBA • TD Garden',
    matchDetails: {
      venue: 'TD Garden',
      time: '4:32 remaining'
    },
    stats: {
      fieldGoals: '42% - 46%',
      threePointers: '35% - 38%',
      freeThrows: '82% - 85%',
      rebounds: '42 - 38',
      assists: '24 - 26',
      steals: '7 - 5',
      blocks: '4 - 3',
      turnovers: '12 - 10'
    },
    // --- NEW: Added teamStats and highlights for live match ---
    teamStats: {
      home: {
        name: 'Boston Celtics',
        fastBreakPoints: 12,
        pointsInPaint: 42,
        secondChancePoints: 8,
        largestLead: 7
      },
      away: {
        name: 'LA Lakers',
        fastBreakPoints: 9,
        pointsInPaint: 38,
        secondChancePoints: 11,
        largestLead: 5
      }
    },
    highlights: {
      videoId: 'bos_lal_highlights_102',
      summary: 'A back-and-forth battle in the fourth quarter. The Lakers have taken a narrow lead with a 8-2 run, fueled by three-pointers and defensive stops.'
    },
    isActive: true
  },
  {
    matchId: '103',
    sport: 'Cricket',
    league: 'ICC World Cup',
    teams: {
      home: { name: 'India', logo: 'IND', score: '245/3' },
      away: { name: 'Australia', logo: 'AUS', score: '280/6' }
    },
    status: 'live',
    minute: '45th Over',
    venue: 'Melbourne Cricket Ground',
    time: new Date(),
    competition: 'ICC World Cup • MCG',
    matchDetails: {
      venue: 'Melbourne Cricket Ground',
      time: 'India Batting'
    },
    stats: {
      runs: '245/3 - 280/6',
      runRate: '5.44 - 6.22',
      overs: '45 - 50',
      fours: '24 - 28',
      sixes: '6 - 8',
      wickets: '3 - 6',
      extras: '12 - 10'
    },
    // --- NEW: Added teamStats and highlights for live match ---
    teamStats: {
      home: {
        name: 'India',
        partnerships: '75-run 3rd wicket',
        requiredRunRate: '7.2',
        lastWicket: 'Sharma, 45.1 ov'
      },
      away: {
        name: 'Australia',
        economyRate: '5.85',
        dotBalls: '145',
        maidenOvers: '3'
      }
    },
    highlights: {
      videoId: 'ind_aus_highlights_103',
      summary: 'India requires 36 runs from 30 balls. The match is poised for a thrilling finish, with the current batsmen building a steady partnership under pressure.'
    },
    isActive: true
  },
  {
    matchId: '104',
    sport: 'Hockey',
    league: 'NHL',
    teams: {
      home: { name: 'Canadiens', logo: 'MTL', score: '2' },
      away: { name: 'Maple Leafs', logo: 'TOR', score: '3' }
    },
    status: 'live',
    minute: 'P3',
    venue: 'Bell Centre',
    time: new Date(),
    competition: 'NHL • Bell Centre',
    matchDetails: {
      venue: 'Bell Centre',
      time: '12:15 remaining'
    },
    // --- NEW: Added comprehensive stats, teamStats, and highlights for live match ---
    stats: {
      shots: '28 - 32',
      hits: '18 - 22',
      powerPlay: '0/2 - 1/3',
      faceoffs: '48% - 52%',
      penaltyMinutes: '6 - 8'
    },
    teamStats: {
      home: {
        name: 'Canadiens',
        takeaways: 9,
        giveaways: 12,
        blockedShots: 15
      },
      away: {
        name: 'Maple Leafs',
        takeaways: 11,
        giveaways: 8,
        blockedShots: 11
      }
    },
    highlights: {
      videoId: 'mtl_tor_highlights_104',
      summary: 'The Maple Leafs hold a one-goal lead in the third period. The Canadiens are pushing hard for an equalizer, applying sustained pressure in the offensive zone.'
    },
    isActive: true
  },
  {
    matchId: '105',
    sport: 'Rugby',
    league: 'Rugby Championship',
    teams: {
      home: { name: 'Springboks', logo: 'RSA', score: '18' },
      away: { name: 'All Blacks', logo: 'NZL', score: '24' }
    },
    status: 'live',
    minute: '65',
    venue: 'Ellis Park',
    time: new Date(),
    competition: 'Rugby Championship • Ellis Park',
    matchDetails: {
      venue: 'Ellis Park',
      time: 'Second Half'
    },
    // --- NEW: Added comprehensive stats, teamStats, and highlights for live match ---
    stats: {
      possession: '45% - 55%',
      territory: '48% - 52%',
      carries: '125 - 138',
      meters: '385 - 452',
      cleanBreaks: '6 - 8',
      defendersBeaten: '22 - 26',
      turnovers: '10 - 8'
    },
    teamStats: {
      home: {
        name: 'Springboks',
        lineouts: '8/10',
        scrums: '5/5',
        penalties: '9',
        mauls: '12'
      },
      away: {
        name: 'All Blacks',
        lineouts: '7/8',
        scrums: '4/4',
        penalties: '7',
        mauls: '8'
      }
    },
    highlights: {
      videoId: 'rsa_nzl_highlights_105',
      summary: 'The All Blacks lead by 6 points in a physically demanding match. The Springboks are fighting to get back into the game, using their powerful forward pack to gain territory.'
    },
    isActive: true
  },
  {
    matchId: '106',
    sport: 'Boxing',
    league: 'WBA Middleweight',
    teams: {
      home: { name: 'Canelo Alvarez', logo: 'CA', score: '-' },
      away: { name: 'Caleb Plant', logo: 'CP', score: '-' }
    },
    status: 'live',
    minute: 'Round 8',
    venue: 'T-Mobile Arena',
    time: new Date(),
    competition: 'WBA Middleweight • T-Mobile Arena',
    matchDetails: {
      venue: 'T-Mobile Arena',
      time: 'Live - Championship'
    },
    // --- NEW: Added comprehensive stats and highlights for live match ---
    stats: {
      punchesThrown: '312 - 285',
      punchesLanded: '98 - 76',
      accuracy: '31% - 27%',
      jabsLanded: '35 - 28',
      powerPunches: '63 - 48',
      knockdowns: '0 - 0'
    },
    highlights: {
      videoId: 'ca_cp_highlights_106',
      summary: 'Canelo Alvarez is controlling the fight with effective aggression and accurate power punching. Plant is using movement and a consistent jab to try to keep Canelo at bay.'
    },
    isActive: true
  },

  // Today's Results - UPDATED STRUCTURE
  {
    matchId: '201',
    sport: 'Football',
    league: 'La Liga',
    teams: {
      home: { name: 'Barcelona', logo: 'FCB', score: '1' },
      away: { name: 'Real Madrid', logo: 'RMA', score: '3' }
    },
    status: 'finished',
    venue: 'Camp Nou',
    time: new Date(Date.now() - 86400000),
    competition: 'La Liga • Camp Nou',
    matchDetails: {
      venue: 'Camp Nou',
      time: 'Full Time'
    },
    // --- NEW: Added stats and teamStats for finished match ---
    stats: {
      possession: '62% - 38%',
      shots: '18 - 12',
      shotsOnTarget: '6 - 5',
      corners: '8 - 4',
      fouls: '14 - 16',
      yellowCards: '3 - 4',
      redCards: '0 - 0',
      offsides: '2 - 1'
    },
    teamStats: {
      home: {
        name: 'Barcelona',
        passes: 645,
        passAccuracy: '89%',
        tackles: 19,
        interceptions: 11
      },
      away: {
        name: 'Real Madrid',
        passes: 412,
        passAccuracy: '82%',
        tackles: 24,
        interceptions: 16
      }
    },
    highlights: {
      videoId: 'ni8PheuLDgs',
      summary: 'Real Madrid secured a convincing 3-1 victory over rivals Barcelona in a thrilling El Clásico encounter. The away side dominated possession and created numerous chances, with their attacking trio causing constant problems for the Barcelona defense.'
    },
    isActive: true
  },
  {
    matchId: '202',
    sport: 'Tennis',
    league: 'ATP Finals',
    teams: {
      home: { name: 'Novak Djokovic', logo: 'ND', score: '2' },
      away: { name: 'Carlos Alcaraz', logo: 'CA', score: '1' }
    },
    status: 'finished',
    venue: 'Pala Alpitour',
    time: new Date(Date.now() - 86400000),
    competition: 'ATP Finals • Turin',
    matchDetails: {
      venue: 'Pala Alpitour',
      time: '6-4, 5-7, 6-4'
    },
    // --- NEW: Added stats and teamStats for finished match ---
    stats: {
      aces: '12 - 9',
      doubleFaults: '2 - 4',
      firstServe: '68% - 64%',
      firstServePoints: '74% - 71%',
      breakPoints: '3/7 - 2/5',
      totalPoints: '112 - 106'
    },
    highlights: {
      videoId: 'a3kMDNxKhJ4',
      summary: 'Novak Djokovic claimed his seventh ATP Finals title with a hard-fought victory over Carlos Alcaraz. The match lasted over three hours and featured incredible rallies, with Djokovic\'s experience ultimately proving decisive in the final set.'
    },
    isActive: true
  },
  {
    matchId: '203',
    sport: 'Baseball',
    league: 'MLB',
    teams: {
      home: { name: 'NY Yankees', logo: 'NYY', score: '4' },
      away: { name: 'Boston Red Sox', logo: 'BOS', score: '0' }
    },
    status: 'finished',
    venue: 'Yankee Stadium',
    time: new Date(Date.now() - 86400000),
    competition: 'MLB World Series',
    matchDetails: {
      venue: 'Yankee Stadium',
      time: 'Game 7 Final'
    },
    // --- NEW: Added comprehensive stats, teamStats, and highlights based on 2025 AL Wild Card Series [citation:2][citation:5][citation:10] ---
    stats: {
      hits: '9 - 4',
      errors: '0 - 2',
      homeRuns: '0 - 0',
      strikeouts: '12 - 8',
      walks: '2 - 1',
      leftOnBase: '6 - 5'
    },
    teamStats: {
      home: {
        name: 'NY Yankees',
        batting: '9-for-32 (.281)',
        pitching: '8.0 IP, 4 H, 0 ER, 12 K',
        fielding: '0 errors'
      },
      away: {
        name: 'Boston Red Sox',
        batting: '4-for-29 (.138)',
        pitching: '7.0 IP, 9 H, 4 R, 2 ER',
        fielding: '2 errors'
      }
    },
    highlights: {
      videoId: 'nyy_bos_highlights_203',
      summary: 'Yankees rookie Cam Schlittler delivered a historic performance with 12 strikeouts over 8 scoreless innings in his postseason debut, setting a new Yankees rookie postseason record. The Yankees capitalized on two Boston errors in the 4th inning to score all four runs, with key RBI singles from Amed Rosario and Anthony Volpe. Ryan McMahon made a spectacular defensive play, vaulting into the dugout to catch a foul pop-up in the 8th inning. [citation:2][citation:5]'
    },
    // --- NEW: Added preview context for future games based on Rivalry Weekend information [citation:1][citation:6] ---
    preview: {
      seriesContext: 'This game adds another chapter to the storied Yankees-Red Sox rivalry. The Yankees recently defeated the Red Sox in the 2025 AL Wild Card Series, with rookie pitcher Cam Schlittler making a historic start. [citation:2][citation:10]',
      keyPlayers: {
        home: ['Cam Schlittler (RHP)', 'Aaron Judge', 'Anthony Volpe'],
        away: ['Connelly Early (LHP)', 'Alex Bregman', 'Jarren Duran']
      }
    },
    isActive: true
  },
  {
    matchId: '204',
    sport: 'Basketball',
    league: 'NBA',
    teams: {
      home: { name: 'Bucks', logo: 'MIL', score: '112' },
      away: { name: 'Nets', logo: 'BKN', score: '108' }
    },
    status: 'finished',
    venue: 'Fiserv Forum',
    time: new Date(Date.now() - 86400000),
    competition: 'NBA • Fiserv Forum',
    matchDetails: {
      venue: 'Fiserv Forum',
      time: 'Overtime'
    },
    // --- NEW: Added stats, teamStats, and highlights for finished match ---
    stats: {
      fieldGoals: '44% - 42%',
      threePointers: '36% - 35%',
      freeThrows: '85% - 82%',
      rebounds: '52 - 48',
      assists: '26 - 24',
      steals: '8 - 7',
      blocks: '6 - 5',
      turnovers: '13 - 15'
    },
    teamStats: {
      home: {
        name: 'Bucks',
        fastBreakPoints: 18,
        pointsInPaint: 52,
        secondChancePoints: 14,
        largestLead: 11
      },
      away: {
        name: 'Nets',
        fastBreakPoints: 14,
        pointsInPaint: 46,
        secondChancePoints: 12,
        largestLead: 8
      }
    },
    highlights: {
      videoId: 'mil_bkn_highlights_204',
      summary: 'The Bucks outlasted the Nets in an overtime thriller. A clutch three-pointer at the end of regulation forced OT, where the Bucks defense made key stops to secure the victory.'
    },
    isActive: true
  },
  {
    matchId: '205',
    sport: 'Cricket',
    league: 'IPL',
    teams: {
      home: { name: 'Mumbai Indians', logo: 'MI', score: '185/6' },
      away: { name: 'Chennai Super Kings', logo: 'CSK', score: '189/4' }
    },
    status: 'finished',
    venue: 'Dubai International',
    time: new Date(Date.now() - 86400000),
    competition: 'T20 League • Dubai',
    matchDetails: {
      venue: 'Dubai International',
      time: 'CSK won by 6 wickets'
    },
    // --- NEW: Added stats, teamStats, and highlights for finished match ---
    stats: {
      runRate: '9.25 - 9.45',
      overs: '20 - 19.2',
      fours: '18 - 20',
      sixes: '8 - 9',
      wickets: '6 - 4',
      extras: '8 - 7'
    },
    teamStats: {
      home: {
        name: 'Mumbai Indians',
        partnerships: '65-run 4th wicket',
        dotBalls: '42',
        maidenOvers: '0'
      },
      away: {
        name: 'Chennai Super Kings',
        partnerships: '78-run 2nd wicket',
        dotBalls: '38',
        maidenOvers: '1'
      }
    },
    highlights: {
      videoId: 'mi_csk_highlights_205',
      summary: 'Chennai Super Kings chased down the target with 4 balls to spare. A brilliant 78-run partnership for the second wicket set up the victory, with the winning runs coming from a six over long-on.'
    },
    isActive: true
  },
  {
    matchId: '206',
    sport: 'Formula1',
    league: 'Formula 1',
    teams: {
      home: { name: 'Max Verstappen', logo: 'VER', score: '1st' },
      away: { name: 'Lewis Hamilton', logo: 'HAM', score: '2nd' }
    },
    status: 'finished',
    venue: 'Interlagos Circuit',
    time: new Date(Date.now() - 86400000),
    competition: 'Brazilian Grand Prix',
    matchDetails: {
      venue: 'Interlagos Circuit',
      time: '71 Laps Completed'
    },
    // --- NEW: Added comprehensive stats and highlights for finished race ---
    stats: {
      gridPosition: '1 - 3',
      fastestLap: '1:12.345 - 1:12.567',
      pitStops: '2 - 2',
      points: '25 - 18',
      team: 'Red Bull - Mercedes'
    },
    highlights: {
      videoId: 'ver_ham_highlights_206',
      summary: 'Max Verstappen won a strategic Brazilian GP, holding off Lewis Hamilton in a tense battle. The key moment came during the second round of pit stops, where Red Bull executed a perfect undercut to gain track position.'
    },
    isActive: true
  },

  // Upcoming Matches - UPDATED STRUCTURE
  {
    matchId: '301',
    sport: 'Football',
    league: 'Champions League',
    teams: {
      home: { name: 'Bayern Munich', logo: 'BAY', score: '-' },
      away: { name: 'Paris SG', logo: 'PSG', score: '-' }
    },
    status: 'upcoming',
    venue: 'Allianz Arena',
    time: new Date(Date.now() + 3600000),
    competition: 'Champions League • Allianz Arena',
    matchDetails: {
      venue: 'Allianz Arena',
      time: 'Today, 19:45 GMT'
    },
    // --- NEW: Added comprehensive preview for upcoming match ---
    preview: {
      teams: {
        home: {
          name: 'Bayern Munich',
          coach: 'Thomas Tuchel',
          lineup: [
            { number: 1, name: 'Manuel Neuer', position: 'Goalkeeper' },
            { number: 5, name: 'Benjamin Pavard', position: 'Defender' },
            { number: 2, name: 'Dayot Upamecano', position: 'Defender' },
            { number: 4, name: 'Matthijs de Ligt', position: 'Defender' },
            { number: 19, name: 'Alphonso Davies', position: 'Defender' },
            { number: 6, name: 'Joshua Kimmich', position: 'Midfielder' },
            { number: 8, name: 'Leon Goretzka', position: 'Midfielder' },
            { number: 10, name: 'Leroy Sané', position: 'Forward' },
            { number: 25, name: 'Thomas Müller', position: 'Forward' },
            { number: 7, name: 'Serge Gnabry', position: 'Forward' },
            { number: 9, name: 'Harry Kane', position: 'Forward' }
          ],
          substitutes: [
            { number: 26, name: 'Sven Ulreich', position: 'Goalkeeper' },
            { number: 40, name: 'Noussair Mazraoui', position: 'Defender' },
            { number: 22, name: 'Raphaël Guerreiro', position: 'Defender' },
            { number: 45, name: 'Aleksandar Pavlović', position: 'Midfielder' },
            { number: 42, name: 'Jamal Musiala', position: 'Midfielder' },
            { number: 39, name: 'Mathys Tel', position: 'Forward' },
            { number: 13, name: 'Eric Maxim Choupo-Moting', position: 'Forward' }
          ]
        },
        away: {
          name: 'Paris Saint-Germain',
          coach: 'Luis Enrique',
          lineup: [
            { number: 99, name: 'Gianluigi Donnarumma', position: 'Goalkeeper' },
            { number: 2, name: 'Achraf Hakimi', position: 'Defender' },
            { number: 5, name: 'Marquinhos', position: 'Defender' },
            { number: 21, name: 'Lucas Hernández', position: 'Defender' },
            { number: 25, name: 'Nuno Mendes', position: 'Defender' },
            { number: 17, name: 'Vitinha', position: 'Midfielder' },
            { number: 8, name: 'Fabian Ruiz', position: 'Midfielder' },
            { number: 33, name: 'Warren Zaïre-Emery', position: 'Midfielder' },
            { number: 10, name: 'Kylian Mbappé', position: 'Forward' },
            { number: 9, name: 'Gonçalo Ramos', position: 'Forward' },
            { number: 7, name: 'Ousmane Dembélé', position: 'Forward' }
          ],
          substitutes: [
            { number: 80, name: 'Arnau Tenas', position: 'Goalkeeper' },
            { number: 37, name: 'Milan Škriniar', position: 'Defender' },
            { number: 15, name: 'Danilo Pereira', position: 'Defender' },
            { number: 4, name: 'Manuel Ugarte', position: 'Midfielder' },
            { number: 19, name: 'Lee Kang-in', position: 'Midfielder' },
            { number: 11, name: 'Marco Asensio', position: 'Forward' },
            { number: 23, name: 'Randal Kolo Muani', position: 'Forward' }
          ]
        }
      },
      // --- NEW: Added additional preview context ---
      matchPreview: {
        summary: 'A heavyweight Champions League clash between German and French champions. Bayern Munich boasts a strong home record, while PSG relies on their explosive attack led by Kylian Mbappé.',
        keyPlayers: ['Harry Kane', 'Kylian Mbappé', 'Joshua Kimmich'],
        tacticalAnalysis: 'Bayern will look to control possession and press high, while PSG will likely use quick transitions and the pace of their forward line to counter-attack.'
      }
    },
    isActive: true
  },
  {
    matchId: '302',
    sport: 'Basketball',
    league: 'NBA',
    teams: {
      home: { name: 'Golden State', logo: 'GSW', score: '-' },
      away: { name: 'Phoenix Suns', logo: 'PHX', score: '-' }
    },
    status: 'upcoming',
    venue: 'Chase Center',
    time: new Date(Date.now() + 86400000),
    competition: 'NBA • Chase Center',
    matchDetails: {
      venue: 'Chase Center',
      time: 'Tomorrow, 02:30 GMT'
    },
    // --- NEW: Added preview for upcoming match ---
    preview: {
      matchPreview: {
        summary: 'Western Conference showdown between the veteran Golden State Warriors and the star-powered Phoenix Suns. Both teams feature elite backcourts and high-powered offenses.',
        keyPlayers: ['Stephen Curry', 'Devin Booker', 'Kevin Durant'],
        tacticalAnalysis: 'The matchup features two of the best three-point shooting teams in the league. Rebounding and bench production could be decisive factors.'
      }
    },
    isActive: true
  },
  {
    matchId: '303',
    sport: 'Cricket',
    league: 'T20 World Cup',
    teams: {
      home: { name: 'England', logo: 'ENG', score: '-' },
      away: { name: 'Pakistan', logo: 'PAK', score: '-' }
    },
    status: 'upcoming',
    venue: 'Dubai International',
    time: new Date(Date.now() + 86400000),
    competition: 'T20 World Cup • Dubai',
    matchDetails: {
      venue: 'Dubai International',
      time: 'Tomorrow, 08:00 GMT'
    },
    // --- NEW: Added preview for upcoming match ---
    preview: {
      matchPreview: {
        summary: 'A crucial T20 World Cup encounter between former champions. England\'s aggressive batting lineup faces Pakistan\'s skilled bowling attack in conditions that traditionally favor spin.',
        keyPlayers: ['Jos Buttler', 'Babar Azam', 'Shaheen Afridi'],
        tacticalAnalysis: 'The powerplay overs will be critical. England will look to attack early, while Pakistan will rely on their pace bowlers to take early wickets.'
      }
    },
    isActive: true
  },
  {
    matchId: '304',
    sport: 'Tennis',
    league: 'Australian Open',
    teams: {
      home: { name: 'Rafael Nadal', logo: 'RN', score: '-' },
      away: { name: 'Daniil Medvedev', logo: 'DN', score: '-' }
    },
    status: 'upcoming',
    venue: 'Rod Laver Arena',
    time: new Date(Date.now() + 7200000),
    competition: 'Australian Open • Melbourne',
    matchDetails: {
      venue: 'Rod Laver Arena',
      time: 'Today, 14:00 GMT'
    },
    // --- NEW: Added preview for upcoming match ---
    preview: {
      matchPreview: {
        summary: 'A blockbuster Australian Open semifinal between Rafael Nadal and Daniil Medvedev. A classic contrast of styles: Nadal\'s heavy topspin and relentless defense against Medvedev\'s flat hitting and exceptional court coverage.',
        keyPlayers: ['Rafael Nadal', 'Daniil Medvedev'],
        tacticalAnalysis: 'Nadal will look to attack Medvedev\'s backhand and use his forehand to create angles. Medvedev will try to keep points neutral and use his deep return position to neutralize Nadal\'s serve.'
      }
    },
    isActive: true
  },
  {
    matchId: '305',
    sport: 'Golf',
    league: 'Masters Tournament',
    teams: {
      home: { name: 'Tiger Woods', logo: 'TS', score: '-' },
      away: { name: 'Rory McIlroy', logo: 'RM', score: '-' }
    },
    status: 'upcoming',
    venue: 'Augusta National',
    time: new Date(Date.now() + 86400000),
    competition: 'Masters Tournament • Augusta',
    matchDetails: {
      venue: 'Augusta National',
      time: 'Tomorrow, 07:30 GMT'
    },
    // --- NEW: Added preview for upcoming match ---
    preview: {
      matchPreview: {
        summary: 'Final pairing at the Masters features golf legends Tiger Woods and Rory McIlroy. Woods seeks another historic victory, while McIlroy aims to complete the career Grand Slam.',
        keyPlayers: ['Tiger Woods', 'Rory McIlroy'],
        courseConditions: 'Augusta National is playing firm and fast. Accuracy off the tee and precise approach shots will be crucial for success.'
      }
    },
    isActive: true
  },
  {
    matchId: '306',
    sport: 'MMA',
    league: 'UFC',
    teams: {
      home: { name: 'Israel Adesanya', logo: 'IM', score: '-' },
      away: { name: 'Alex Pereira', logo: 'AP', score: '-' }
    },
    status: 'upcoming',
    venue: 'T-Mobile Arena',
    time: new Date(Date.now() + 10800000),
    competition: 'UFC 300 • T-Mobile Arena',
    matchDetails: {
      venue: 'T-Mobile Arena',
      time: 'Today, 23:00 GMT'
    },
    // --- NEW: Added preview for upcoming match ---
    preview: {
      matchPreview: {
        summary: 'A highly anticipated middleweight championship trilogy fight between Israel Adesanya and Alex Pereira. Their rivalry spans multiple sports and continents, with Pereira currently holding a 3-0 advantage across kickboxing and MMA.',
        keyPlayers: ['Israel Adesanya', 'Alex Pereira'],
        tacticalAnalysis: 'Adesanya will use movement and technical striking to maintain distance, while Pereira will look to land his powerful left hook and leg kicks to slow Adesanya down.'
      }
    },
    isActive: true
  },
  // Additional scores from games data
  {
    matchId: 'FBL-LIVE-001',
    sport: 'Football',
    league: 'Premier League',
    teams: {
      home: { name: 'Manchester City', logo: 'MCI', score: '3' },
      away: { name: 'Arsenal', logo: 'ARS', score: '1' }
    },
    status: 'finished',
    minute: 'FT',
    venue: 'Etihad Stadium',
    time: new Date(),
    competition: 'Premier League',
    // --- NEW: Added stats, teamStats, and highlights for finished match ---
    stats: {
      possession: '61% - 39%',
      shots: '16 - 7',
      shotsOnTarget: '7 - 3',
      corners: '6 - 3',
      fouls: '11 - 14',
      yellowCards: '2 - 4',
      redCards: '0 - 0',
      offsides: '1 - 2'
    },
    teamStats: {
      home: {
        name: 'Manchester City',
        passes: 587,
        passAccuracy: '90%',
        tackles: 21,
        interceptions: 13
      },
      away: {
        name: 'Arsenal',
        passes: 398,
        passAccuracy: '84%',
        tackles: 26,
        interceptions: 18
      }
    },
    highlights: {
      videoId: 'mci_ars_highlights_fl01',
      summary: 'Manchester City dominated possession and created numerous chances in a comfortable 3-1 victory over Arsenal. The home team controlled the midfield throughout the match, with two first-half goals setting the foundation for the win.'
    },
    isActive: true
  },
  {
    matchId: 'FBL-LIVE-002',
    sport: 'Football',
    league: 'Champions League',
    teams: {
      home: { name: 'Real Madrid', logo: 'RMA', score: '2' },
      away: { name: 'Bayern Munich', logo: 'BAY', score: '2' }
    },
    status: 'live',
    minute: '75\'',
    venue: 'Santiago Bernabéu',
    time: new Date(),
    competition: 'Champions League Quarterfinals',
    // --- NEW: Added stats, teamStats, and highlights for live match ---
    stats: {
      possession: '48% - 52%',
      shots: '13 - 15',
      shotsOnTarget: '5 - 6',
      corners: '4 - 5',
      fouls: '15 - 12',
      yellowCards: '3 - 2',
      redCards: '0 - 0',
      offsides: '2 - 1'
    },
    teamStats: {
      home: {
        name: 'Real Madrid',
        passes: 432,
        passAccuracy: '86%',
        tackles: 24,
        interceptions: 16
      },
      away: {
        name: 'Bayern Munich',
        passes: 468,
        passAccuracy: '88%',
        tackles: 19,
        interceptions: 14
      }
    },
    highlights: {
      videoId: 'rm_bay_highlights_fl02',
      summary: 'An intense, evenly-matched Champions League quarterfinal is level at 2-2 with 15 minutes remaining. Both teams have had periods of dominance, with the match featuring spectacular goals at both ends.'
    },
    isActive: true
  },
  {
    matchId: 'NBA-LIVE-001',
    sport: 'Basketball',
    league: 'NBA',
    teams: {
      home: { name: 'Boston Celtics', logo: 'BOS', score: '108' },
      away: { name: 'Los Angeles Lakers', logo: 'LAL', score: '105' }
    },
    status: 'finished',
    minute: 'Final',
    venue: 'TD Garden',
    time: new Date(),
    competition: 'NBA Finals • TD Garden',
    // --- NEW: Added stats, teamStats, and highlights for finished match ---
    stats: {
      fieldGoals: '46% - 44%',
      threePointers: '38% - 36%',
      freeThrows: '84% - 81%',
      rebounds: '45 - 42',
      assists: '28 - 25',
      steals: '9 - 7',
      blocks: '5 - 4',
      turnovers: '11 - 14'
    },
    teamStats: {
      home: {
        name: 'Boston Celtics',
        fastBreakPoints: 16,
        pointsInPaint: 48,
        secondChancePoints: 12,
        largestLead: 9
      },
      away: {
        name: 'Los Angeles Lakers',
        fastBreakPoints: 12,
        pointsInPaint: 44,
        secondChancePoints: 10,
        largestLead: 7
      }
    },
    highlights: {
      videoId: 'bos_lal_highlights_nba01',
      summary: 'The Celtics edged the Lakers in a nail-biting NBA Finals game. A last-second defensive stop secured the victory after the Lakers failed to get a shot off on the final possession.'
    },
    isActive: true
  },
  {
    matchId: 'NBA-LIVE-002',
    sport: 'Basketball',
    league: 'NBA',
    teams: {
      home: { name: 'Golden State Warriors', logo: 'GSW', score: '112' },
      away: { name: 'Denver Nuggets', logo: 'DEN', score: '115' }
    },
    status: 'live',
    minute: 'Q4 3:15',
    venue: 'Chase Center',
    time: new Date(),
    competition: 'NBA Regular Season',
    // --- NEW: Added stats, teamStats, and highlights for live match ---
    stats: {
      fieldGoals: '47% - 49%',
      threePointers: '40% - 42%',
      freeThrows: '88% - 85%',
      rebounds: '40 - 43',
      assists: '30 - 28',
      steals: '6 - 8',
      blocks: '3 - 5',
      turnovers: '10 - 9'
    },
    teamStats: {
      home: {
        name: 'Golden State Warriors',
        fastBreakPoints: 14,
        pointsInPaint: 46,
        secondChancePoints: 11,
        largestLead: 8
      },
      away: {
        name: 'Denver Nuggets',
        fastBreakPoints: 10,
        pointsInPaint: 52,
        secondChancePoints: 13,
        largestLead: 6
      }
    },
    highlights: {
      videoId: 'gsw_den_highlights_nba02',
      summary: 'The Nuggets lead by 3 points in a high-scoring affair. Both teams are shooting exceptionally well from beyond the arc, with the lead changing hands multiple times in the fourth quarter.'
    },
    isActive: true
  },
  {
    matchId: 'MLB-LIVE-001',
    sport: 'Baseball',
    league: 'MLB',
    teams: {
      home: { name: 'New York Yankees', logo: 'NYY', score: '5' },
      away: { name: 'Boston Red Sox', logo: 'BOS', score: '4' }
    },
    status: 'finished',
    minute: 'FINAL',
    venue: 'Yankee Stadium',
    time: new Date(),
    competition: 'MLB • Yankee Stadium',
    // --- NEW: Added comprehensive stats, teamStats, and highlights based on Rivalry Weekend context [citation:1][citation:6] ---
    stats: {
      hits: '11 - 9',
      errors: '1 - 1',
      homeRuns: '2 - 1',
      strikeouts: '9 - 11',
      walks: '3 - 4',
      leftOnBase: '7 - 8'
    },
    teamStats: {
      home: {
        name: 'NY Yankees',
        batting: '11-for-35 (.314)',
        pitching: '9.0 IP, 9 H, 4 ER, 9 K',
        fielding: '1 error'
      },
      away: {
        name: 'Boston Red Sox',
        batting: '9-for-33 (.273)',
        pitching: '8.0 IP, 11 H, 5 R, 4 ER',
        fielding: '1 error'
      }
    },
    highlights: {
      videoId: 'nyy_bos_highlights_mlb01',
      summary: 'The Yankees won a back-and-forth rivalry game against the Red Sox with a walk-off single in the bottom of the 9th inning. Aaron Judge hit a mammoth 436-foot home run in the first inning, while the Red Sox responded with a 3-run homer in the 5th. [citation:7]'
    },
    preview: {
      seriesContext: 'Part of the historic Yankees-Red Sox rivalry, these games always carry extra significance in the AL East race. [citation:4]',
      keyPlayers: {
        home: ['Aaron Judge', 'Carlos Rodon', 'Anthony Volpe'],
        away: ['Alex Bregman', 'Rafael Devers', 'Connelly Early']
      }
    },
    isActive: true
  },
  {
    matchId: 'MLB-LIVE-002',
    sport: 'Baseball',
    league: 'MLB',
    teams: {
      home: { name: 'Los Angeles Dodgers', logo: 'LAD', score: '3' },
      away: { name: 'Chicago Cubs', logo: 'CHC', score: '2' }
    },
    status: 'live',
    minute: 'BOT 8',
    venue: 'Dodger Stadium',
    time: new Date(),
    competition: 'MLB • Dodger Stadium',
    // --- NEW: Added comprehensive stats, teamStats, and highlights for live match ---
    stats: {
      hits: '8 - 6',
      errors: '0 - 0',
      homeRuns: '1 - 1',
      strikeouts: '7 - 9',
      walks: '2 - 3',
      leftOnBase: '5 - 6'
    },
    teamStats: {
      home: {
        name: 'Los Angeles Dodgers',
        batting: '8-for-29 (.276)',
        pitching: '7.0 IP, 6 H, 2 ER, 7 K',
        fielding: '0 errors'
      },
      away: {
        name: 'Chicago Cubs',
        batting: '6-for-26 (.231)',
        pitching: '7.0 IP, 8 H, 3 R, 3 ER',
        fielding: '0 errors'
      }
    },
    highlights: {
      videoId: 'lad_chc_highlights_mlb02',
      summary: 'The Dodgers lead 3-2 in a tight pitcher\'s duel. Shohei Ohtani hit a solo home run in the 5th inning to break a 2-2 tie. Both starting pitchers have delivered quality outings, with the bullpens now taking over.'
    },
    isActive: true
  },
  {
    matchId: 'PL-2024-001',
    sport: 'Football',
    league: 'Premier League',
    teams: {
      home: { name: 'Manchester City', logo: 'MCI', score: '2' },
      away: { name: 'Arsenal', logo: 'ARS', score: '1' }
    },
    status: 'upcoming',
    venue: 'Etihad Stadium',
    time: new Date("2024-06-15"),
    competition: 'Premier League • Etihad Stadium',
    // --- NEW: Added preview for upcoming match ---
    preview: {
      matchPreview: {
        summary: 'A potential Premier League title decider between Manchester City and Arsenal. City\'s home advantage and experience in title races makes them slight favorites against a young, energetic Arsenal side.',
        keyPlayers: ['Kevin De Bruyne', 'Erling Haaland', 'Bukayo Saka', 'Martin Ødegaard'],
        tacticalAnalysis: 'City will look to control possession and press high, while Arsenal will use quick transitions and their organized defensive structure to counter City\'s attacking threats.'
      }
    },
    isActive: true
  },
  {
    matchId: 'UCL-2024-001',
    sport: 'Football',
    league: 'Champions League',
    teams: {
      home: { name: 'Real Madrid', logo: 'RMA', score: '-' },
      away: { name: 'Bayern Munich', logo: 'BAY', score: '-' }
    },
    status: 'upcoming',
    venue: 'Santiago Bernabéu',
    time: new Date("2024-06-18"),
    competition: 'Champions League Quarterfinals',
    // --- NEW: Added preview for upcoming match ---
    preview: {
      matchPreview: {
        summary: 'A classic European clash between two of the most successful clubs in Champions League history. Real Madrid\'s European pedigree faces Bayern Munich\'s disciplined German engineering.',
        keyPlayers: ['Vinicius Junior', 'Jude Bellingham', 'Harry Kane', 'Jamal Musiala'],
        tacticalAnalysis: 'Real Madrid will rely on individual brilliance and counter-attacking speed, while Bayern will employ their trademark high press and possession-based game.'
      }
    },
    isActive: true
  },
  {
    matchId: 'NBA-2024-001',
    sport: 'Basketball',
    league: 'NBA',
    teams: {
      home: { name: 'Boston Celtics', logo: 'BOS', score: '95' },
      away: { name: 'Los Angeles Lakers', logo: 'LAL', score: '98' }
    },
    status: 'upcoming',
    venue: 'TD Garden',
    time: new Date("2024-06-10"),
    competition: 'NBA Finals',
    // --- NEW: Added preview for upcoming match ---
    preview: {
      matchPreview: {
        summary: 'The latest chapter in the NBA\'s most storied rivalry. The Celtics and Lakers meet in the Finals with both teams featuring revamped rosters and championship aspirations.',
        keyPlayers: ['Jayson Tatum', 'Jaylen Brown', 'LeBron James', 'Anthony Davis'],
        tacticalAnalysis: 'The matchup features two elite defenses. The Celtics will use their three-point shooting, while the Lakers will look to dominate in the paint and on the boards.'
      }
    },
    isActive: true
  },
  {
    matchId: 'MLB-2024-001',
    sport: 'Baseball',
    league: 'MLB',
    teams: {
      home: { name: 'New York Yankees', logo: 'NYY', score: '-' },
      away: { name: 'Boston Red Sox', logo: 'BOS', score: '-' }
    },
    status: 'upcoming',
    venue: 'Yankee Stadium',
    time: new Date("2024-06-15"),
    competition: 'MLB Rivalry Series',
    // --- NEW: Added preview for upcoming match based on Rivalry Weekend context [citation:1][citation:6] ---
    preview: {
      matchPreview: {
        summary: 'The iconic Yankees-Red Sox rivalry continues with another chapter at Yankee Stadium. This series is part of MLB\'s inaugural Rivalry Weekend, highlighting one of baseball\'s most intense geographic and divisional rivalries. [citation:1]',
        keyPlayers: {
          home: ['Aaron Judge', 'Carlos Rodon', 'Anthony Volpe'],
          away: ['Alex Bregman', 'Rafael Devers', 'Connelly Early']
        },
        tacticalAnalysis: 'The Yankees power-heavy lineup faces the Red Sox balanced attack. Starting pitching performance and bullpen management will likely decide this contest.'
      },
      seriesContext: 'This game is part of MLB\'s special Rivalry Weekend, featuring 15 designated rival matchups across the league. The Yankees and Red Sox represent one of the most historic and intense rivalries in the series. [citation:1][citation:6]'
    },
    isActive: true
  }
];

module.exports = scoresData;