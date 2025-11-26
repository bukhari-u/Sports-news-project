const playersData = [
  {
    name: 'Cristiano Ronaldo',
    sport: 'Football',
    position: 'Forward',
    nationality: 'Portugal',
    currentClub: 'Al Nassr',
    age: 39,
    height: '6\'2" (187 cm)',
    weight: '183 lbs (83 kg)',
    image: 'https://i.pinimg.com/736x/f0/59/8d/f0598d0b83dd2bff878ee24fc43abcc8.jpg',
    description: 'Widely regarded as one of the greatest players of all time, Ronaldo has won five Ballon d\'Or awards and four European Golden Shoes, the most by a European player. He has won 34 trophies in his career, including seven league titles, five UEFA Champions Leagues, and the UEFA European Championship.',
    stats: {
      'Career Goals': '850+',
      'Ballon d\'Or': '5',
      'UCL Titles': '5',
      'Int\'l Caps': '205',
      'Int\'l Goals': '128',
      'Assists': '250+'
    },
    trophies: {
      'Ballon d\'Or': 5,
      'Champions League': 5,
      'European Championship': 1,
      'League Titles': 7,
      'Domestic Cups': 14,
      'FIFA Club World Cup': 4
    },
    career: [
      { year: '2002-2003', club: 'Sporting CP', apps: 31, goals: 5 },
      { year: '2003-2009', club: 'Manchester United', apps: 292, goals: 118 },
      { year: '2009-2018', club: 'Real Madrid', apps: 438, goals: 450 },
      { year: '2018-2021', club: 'Juventus', apps: 134, goals: 101 },
      { year: '2021-2022', club: 'Manchester United', apps: 54, goals: 27 },
      { year: '2023-Present', club: 'Al Nassr', apps: 50, goals: 44 }
    ],
    isActive: true
  },
  {
    name: 'Lionel Messi',
    sport: 'Football',
    position: 'Forward',
    nationality: 'Argentina',
    currentClub: 'Inter Miami',
    age: 36,
    height: '5\'7" (170 cm)',
    weight: '148 lbs (67 kg)',
    image: 'https://i.pinimg.com/736x/28/bf/e1/28bfe11c73731a62204a48d70649fb65.jpg',
    description: 'Considered one of the greatest players of all time, Messi has won a record eight Ballon d\'Or awards, a record six European Golden Shoes, and in 2020 was named to the Ballon d\'Or Dream Team. He has spent his entire professional career with Barcelona, where he has won a club-record 35 trophies.',
    stats: {
      'Career Goals': '800+',
      'Ballon d\'Or': '8',
      'UCL Titles': '4',
      'Int\'l Caps': '180',
      'Int\'l Goals': '106',
      'Assists': '350+'
    },
    trophies: {
      'Ballon d\'Or': 8,
      'Champions League': 4,
      'World Cup': 1,
      'League Titles': 12,
      'Domestic Cups': 7,
      'Copa América': 1
    },
    career: [
      { year: '2004-2021', club: 'Barcelona', apps: 778, goals: 672 },
      { year: '2021-2023', club: 'PSG', apps: 75, goals: 32 },
      { year: '2023-Present', club: 'Inter Miami', apps: 41, goals: 25 }
    ],
    isActive: true
  },
  {
    name: 'Imran Khan',
    sport: 'Cricket',
    position: 'All-rounder',
    nationality: 'Pakistan',
    currentClub: 'Pakistan (Retired)',
    age: 71,
    height: '6\'0" (183 cm)',
    weight: '176 lbs (80 kg)',
    image: 'https://i.pinimg.com/736x/bc/4e/0d/bc4e0dbbfb967b24a798865b4df320ba.jpg',
    description: 'Legendary cricketer who captained Pakistan to their first-ever Cricket World Cup victory in 1992. Known for his charismatic leadership and exceptional all-round abilities. After retirement, he transitioned into politics and served as the 22nd Prime Minister of Pakistan.',
    stats: {
      'Test Runs': '3,807',
      'Test Wickets': '362',
      'ODI Runs': '3,709',
      'ODI Wickets': '182',
      'World Cup': '1992',
      'Captaincy Record': '14 Wins, 8 Losses'
    },
    trophies: {
      'Cricket World Cup': 1,
      'Test Series Wins': 6,
      'Wisden Cricketer': 1,
      'Man of the Match': 13,
      'ICC Hall of Fame': 1,
      'Hilal-i-Imtiaz': 1
    },
    career: [
      { year: '1971-1982', club: 'Pakistan', achievement: 'Early Career', details: 'Test debut, Rising star' },
      { year: '1982-1992', club: 'Pakistan', achievement: 'Captaincy Era', details: 'Team leadership, World Cup 1992' },
      { year: '1992', club: 'Pakistan', achievement: 'World Cup Victory', details: 'Captain, Historic win' }
    ],
    isActive: true
  },
  {
    name: 'LeBron James',
    sport: 'Basketball',
    position: 'Forward',
    nationality: 'USA',
    currentClub: 'Los Angeles Lakers',
    age: 39,
    height: '6\'9" (206 cm)',
    weight: '250 lbs (113 kg)',
    image: 'https://i.pinimg.com/1200x/bc/7c/c0/bc7cc0a239e8ed8b441ce6b3a253bf53.jpg',
    description: 'Widely considered one of the greatest basketball players of all time, James has won four NBA championships, four NBA MVP awards, four Finals MVP awards, and two Olympic gold medals.',
    stats: {
      'Points': '40,000+',
      'Assists': '11,000+',
      'Rebounds': '11,000+',
      'NBA Titles': '4',
      'MVP Awards': '4',
      'All-Star': '20'
    },
    trophies: {
      'NBA Championships': 4,
      'MVP Awards': 4,
      'Finals MVP': 4,
      'Olympic Gold': 2,
      'Scoring Titles': 1,
      'All-Star MVP': 3
    },
    career: [
      { year: '2003-2010', club: 'Cleveland Cavaliers', points: 15251, wins: 0 },
      { year: '2010-2014', club: 'Miami Heat', points: 7919, wins: 2 },
      { year: '2014-2018', club: 'Cleveland Cavaliers', points: 7867, wins: 1 },
      { year: '2018-Present', club: 'Los Angeles Lakers', points: 9000, wins: 1 }
    ],
    isActive: true
  },
  {
    name: 'Virat Kohli',
    sport: 'Cricket',
    position: 'Batsman',
    nationality: 'India',
    currentClub: 'Royal Challengers Bangalore',
    age: 35,
    height: '5\'9" (175 cm)',
    weight: '154 lbs (70 kg)',
    image: 'https://i.pinimg.com/736x/30/1d/62/301d62577229184fefd3804d714c3bcb.jpg',
    description: 'Considered one of the best batsmen in the world, known for his aggressive batting style and consistency across all formats of the game.',
    stats: {
      'International Centuries': '80',
      'ODI Runs': '13,000+',
      'Test Runs': '8,500+',
      'Batting Average': '50+',
      'IPL Runs': '7,000+',
      'Captaincy Wins': '65%'
    },
    trophies: {
      'World Cup': 1,
      'Champions Trophy': 1,
      'Test Mace': 2,
      'IPL Orange Cap': 1,
      'ICC Awards': 3,
      'National Awards': 2
    },
    career: [
      { year: '2008-2013', club: 'India', achievement: 'Emerging Star', details: 'ODI debut, First century' },
      { year: '2013-2017', club: 'India', achievement: 'Rise to Captaincy', details: 'Test captain, Multiple records' },
      { year: '2017-2021', club: 'India', achievement: 'Peak Performance', details: 'Consistent centuries, Leadership' },
      { year: '2021-Present', club: 'India', achievement: 'Veteran Phase', details: 'Experience, Mentor role' }
    ],
    isActive: true
  },
  {
    name: 'Novak Djokovic',
    sport: 'Tennis',
    position: 'Professional',
    nationality: 'Serbia',
    currentClub: 'ATP Tour',
    age: 36,
    height: '6\'2" (188 cm)',
    weight: '170 lbs (77 kg)',
    image: 'https://i.pinimg.com/736x/62/72/36/6272369d11340338d7893be4bbd4760a.jpg',
    description: 'Regarded as one of the greatest tennis players of all time, holds numerous records including most Grand Slam titles and most weeks at world No. 1.',
    stats: {
      'Grand Slam Titles': '24',
      'Weeks at No 1': '400+',
      'ATP Titles': '98',
      'Prize Money': '$180M+',
      'Win Percentage': '83%',
      'Masters Titles': '40'
    },
    trophies: {
      'Grand Slams': 24,
      'ATP Finals': 7,
      'Masters 1000': 40,
      'Olympic Medals': 1,
      'Davis Cup': 1,
      'Year End No 1': 8
    },
    career: [
      { year: '2003-2007', club: 'ATP Tour', achievement: 'Early Career', details: 'First ATP title, Top 3 ranking' },
      { year: '2008-2010', club: 'ATP Tour', achievement: 'Grand Slam Breakthrough', details: 'First Australian Open, No 3 ranking' },
      { year: '2011-2016', club: 'ATP Tour', achievement: 'Dominance Begins', details: 'Multiple Slams, No 1 ranking' },
      { year: '2017-Present', club: 'ATP Tour', achievement: 'Historic Achievements', details: 'Record Slams, Longest No 1' }
    ],
    isActive: true
  },
  {
    name: 'Muhammad Ali',
    sport: 'Boxing',
    position: 'Heavyweight',
    nationality: 'USA',
    currentClub: 'Retired',
    age: 74,
    height: '6\'3" (191 cm)',
    weight: '236 lbs (107 kg)',
    image: 'https://i.pinimg.com/736x/c5/53/de/c553de69f8e47c477c835b50e1af0e9c.jpg',
    description: 'Widely regarded as one of the most significant and celebrated sports figures of the 20th century. Nicknamed "The Greatest", he is considered one of the most important and celebrated figures in boxing history.',
    stats: {
      'Total Fights': '61',
      'Wins': '56',
      'Wins by KO': '37',
      'Losses': '5',
      'World Titles': '3',
      'Olympic Gold': '1'
    },
    trophies: {
      'Heavyweight Titles': 3,
      'Olympic Gold': 1,
      'Ring Magazine': 6,
      'Fighter of the Year': 6,
      'Sportsman of the Century': 1,
      'Presidential Medal': 1
    },
    career: [
      { year: '1960-1964', club: 'Professional Boxing', achievement: 'Early Career', details: 'Olympic Gold, First Title' },
      { year: '1964-1967', club: 'Professional Boxing', achievement: 'First Reign', details: 'Title defenses, Controversy' },
      { year: '1970-1974', club: 'Professional Boxing', achievement: 'Comeback', details: 'Fight of the Century, Rumble in the Jungle' },
      { year: '1974-1981', club: 'Professional Boxing', achievement: 'Later Career', details: 'Thrilla in Manila, Retirement' }
    ],
    isActive: true
  },
  {
    name: 'Lewis Hamilton',
    sport: 'Formula 1',
    position: 'Driver',
    nationality: 'Great Britain',
    currentClub: 'Mercedes',
    age: 39,
    height: '5\'9" (175 cm)',
    weight: '150 lbs (68 kg)',
    image: 'https://i.pinimg.com/736x/b2/94/16/b29416839342c9ebb5e49094c80dfcd5.jpg',
    description: 'One of the most successful drivers in the history of Formula One, holding the records for most wins, pole positions, and podium finishes. He has won seven World Drivers\' Championship titles.',
    stats: {
      'World Titles': '7',
      'Race Wins': '103',
      'Pole Positions': '104',
      'Podium Finishes': '197',
      'Fastest Laps': '65',
      'Points': '4700+'
    },
    trophies: {
      'World Championships': 7,
      'Race Wins': 103,
      'Pole Positions': 104,
      'Podiums': 197,
      'Fastest Laps': 65,
      'Hat-tricks': 19
    },
    career: [
      { year: '2007-2012', club: 'McLaren', wins: 21, championships: 1 },
      { year: '2013-2021', club: 'Mercedes', wins: 82, championships: 6 },
      { year: '2022-Present', club: 'Mercedes', wins: 0, championships: 0 }
    ],
    isActive: true
  },
  {
    name: 'Roger Federer',
    sport: 'Tennis',
    position: 'Professional',
    nationality: 'Switzerland',
    currentClub: 'Retired',
    age: 42,
    height: '6\'1" (185 cm)',
    weight: '187 lbs (85 kg)',
    image: 'https://i.pinimg.com/736x/2e/4b/8c/2e4b8c8d59fea26ceb01141487e03797.jpg',
    description: 'Regarded as one of the greatest tennis players of all time, Federer was ranked world No. 1 by the ATP for 310 weeks, including a record 237 consecutive weeks.',
    stats: {
      'Grand Slam Titles': '20',
      'Weeks at No 1': '310',
      'ATP Titles': '103',
      'Prize Money': '$130M+',
      'Win Percentage': '82%',
      'Olympic Medals': '2'
    },
    trophies: {
      'Grand Slams': 20,
      'ATP Finals': 6,
      'Masters 1000': 28,
      'Olympic Medals': 2,
      'Davis Cup': 1,
      'Year End No 1': 5
    },
    career: [
      { year: '1998-2002', club: 'ATP Tour', achievement: 'Early Career', details: 'First ATP title, Top 10 ranking' },
      { year: '2003-2007', club: 'ATP Tour', achievement: 'Dominance Begins', details: 'Multiple Slams, No 1 ranking' },
      { year: '2008-2012', club: 'ATP Tour', achievement: 'Rivalry Era', details: 'Competition with Nadal, Djokovic' },
      { year: '2013-2022', club: 'ATP Tour', achievement: 'Later Career', details: 'Injury comebacks, Final titles' }
    ],
    isActive: true
  },
  {
    name: 'Tiger Woods',
    sport: 'Golf',
    position: 'Professional',
    nationality: 'USA',
    currentClub: 'PGA Tour',
    age: 48,
    height: '6\'1" (185 cm)',
    weight: '185 lbs (84 kg)',
    image: 'https://i.pinimg.com/736x/52/cf/0f/52cf0f749d7b674bfff6430c6c8c1a25.jpg',
    description: 'Widely regarded as one of the greatest golfers of all time and one of the most famous athletes in modern history. He was the dominant force in golf from the late 1990s to the late 2000s.',
    stats: {
      'Major Championships': '15',
      'PGA Tour Wins': '82',
      'European Tour Wins': '41',
      'Weeks at No 1': '683',
      'Career Earnings': '$120M+',
      'Player of the Year': '11'
    },
    trophies: {
      'Major Championships': 15,
      'PGA Tour Wins': 82,
      'European Tour': 41,
      'Vardon Trophy': 9,
      'Player of the Year': 11,
      'Money Title': 10
    },
    career: [
      { year: '1996-1999', club: 'PGA Tour', achievement: 'Rookie Sensation', details: 'First Major, Record breaking' },
      { year: '2000-2008', club: 'PGA Tour', achievement: 'Tiger Slam', details: 'Dominance, Multiple records' },
      { year: '2009-2013', club: 'PGA Tour', achievement: 'Injury & Scandal', details: 'Personal issues, Comeback' },
      { year: '2014-2019', club: 'PGA Tour', achievement: 'Later Career', details: '2019 Masters, Final major' }
    ],
    isActive: true
  },
  {
    name: 'Usain Bolt',
    sport: 'Athletics',
    position: 'Sprinter',
    nationality: 'Jamaica',
    currentClub: 'Retired',
    age: 37,
    height: '6\'5" (195 cm)',
    weight: '207 lbs (94 kg)',
    image: 'https://i.pinimg.com/1200x/e1/f0/65/e1f065325ab188f2588fbbbcdffa7e4f.jpg',
    description: 'Widely considered the greatest sprinter of all time, holding world records in the 100m, 200m and 4×100m relay. He is an eight-time Olympic gold medalist and eleven-time World Champion.',
    stats: {
      'Olympic Gold': '8',
      'World Titles': '11',
      'World Records': '3',
      '100m Personal Best': '9.58',
      '200m Personal Best': '19.19',
      'Undefeated in Finals': '45'
    },
    trophies: {
      'Olympic Gold': 8,
      'World Championships': 11,
      'World Records': 3,
      'Diamond League': 2,
      'IAAF Athlete': 6,
      'Laureus Award': 4
    },
    career: [
      { year: '2002-2007', club: 'Jamaica', achievement: 'Junior Career', details: 'World Junior records, Early success' },
      { year: '2008-2009', club: 'Jamaica', achievement: 'Breakthrough', details: 'Beijing Olympics, World records' },
      { year: '2010-2016', club: 'Jamaica', achievement: 'Dominance', details: 'London, Rio Olympics, Continued success' },
      { year: '2017', club: 'Jamaica', achievement: 'Retirement', details: 'Final World Championships, Legacy' }
    ],
    isActive: true
  },
  {
    name: 'Michael Phelps',
    sport: 'Swimming',
    position: 'Swimmer',
    nationality: 'USA',
    currentClub: 'Retired',
    age: 38,
    height: '6\'4" (193 cm)',
    weight: '194 lbs (88 kg)',
    image: 'https://i.pinimg.com/736x/33/c0/73/33c07326800475a8037573e3dcac06fe.jpg',
    description: 'The most successful and most decorated Olympian of all time, with a total of 28 medals, 23 of them gold. Phelps also holds the all-time records for Olympic gold medals, Olympic gold medals in individual events, and Olympic medals in individual events.',
    stats: {
      'Olympic Gold': '23',
      'Olympic Medals': '28',
      'World Records': '39',
      'World Titles': '26',
      'Years Active': '16',
      'Career Earnings': '$55M+'
    },
    trophies: {
      'Olympic Gold': 23,
      'Olympic Medals': 28,
      'World Records': 39,
      'World Championships': 26,
      'US Championships': 48,
      'Swimmer of the Year': 8
    },
    career: [
      { year: '2000-2004', club: 'USA Swimming', achievement: 'Early Career', details: 'Sydney debut, Athens breakthrough' },
      { year: '2004-2008', club: 'USA Swimming', achievement: 'Dominance', details: 'Beijing record 8 gold medals' },
      { year: '2009-2012', club: 'USA Swimming', achievement: 'Continued Success', details: 'London Olympics, More records' },
      { year: '2014-2016', club: 'USA Swimming', achievement: 'Comeback & Retirement', details: 'Rio finale, Final medals' }
    ],
    isActive: true
  },
  {
    name: 'Serena Williams',
    sport: 'Tennis',
    position: 'Professional',
    nationality: 'USA',
    currentClub: 'Retired',
    age: 42,
    height: '5\'9" (175 cm)',
    weight: '155 lbs (70 kg)',
    image: 'https://i.pinimg.com/1200x/e6/40/f8/e640f8a557ab03614b21134f07593b64.jpg',
    description: 'Regarded as one of the greatest tennis players of all time, holding the most Grand Slam titles in the Open Era with 23 singles titles. She was ranked world No. 1 in singles by the WTA on eight separate occasions.',
    stats: {
      'Grand Slam Titles': '23',
      'Weeks at No 1': '319',
      'WTA Titles': '73',
      'Prize Money': '$94M+',
      'Win Percentage': '85%',
      'Olympic Gold': '4'
    },
    trophies: {
      'Grand Slams': 23,
      'Olympic Gold': 4,
      'WTA Titles': 73,
      'Year End No 1': 5,
      'WTA Finals': 5,
      'Fed Cup': 4
    },
    career: [
      { year: '1995-1999', club: 'WTA Tour', achievement: 'Early Career', details: 'First titles, US Open breakthrough' },
      { year: '2000-2007', club: 'WTA Tour', achievement: 'Serena Slam', details: 'Dominance, Multiple Slams' },
      { year: '2008-2016', club: 'WTA Tour', achievement: 'Comeback & Dominance', details: 'Injury return, More titles' },
      { year: '2017-2022', club: 'WTA Tour', achievement: 'Later Career', details: 'Motherhood, Final titles' }
    ],
    isActive: true
  },
  {
    name: 'Tom Brady',
    sport: 'American Football',
    position: 'Quarterback',
    nationality: 'USA',
    currentClub: 'Retired',
    age: 46,
    height: '6\'4" (193 cm)',
    weight: '225 lbs (102 kg)',
    image: 'https://i.pinimg.com/736x/ae/de/1a/aede1a8538ba7a5d79ede5d1fdafa57d.jpg',
    description: 'Widely regarded as the greatest quarterback of all time, holding numerous NFL records including most Super Bowl wins, appearances and MVP awards. He played 23 seasons in the NFL, primarily with the New England Patriots.',
    stats: {
      'Super Bowl Wins': '7',
      'Super Bowl MVPs': '5',
      'Passing Yards': '89,000+',
      'Touchdown Passes': '649',
      'Pro Bowl Selections': '15',
      'MVP Awards': '3'
    },
    trophies: {
      'Super Bowls': 7,
      'Super Bowl MVP': 5,
      'MVP Awards': 3,
      'Pro Bowl': 15,
      'All-Pro': 6,
      'Comeback Player': 1
    },
    career: [
      { year: '2000-2006', club: 'New England Patriots', superBowls: 3, mvps: 1 },
      { year: '2007-2019', club: 'New England Patriots', superBowls: 3, mvps: 2 },
      { year: '2020-2022', club: 'Tampa Bay Buccaneers', superBowls: 1, mvps: 0 }
    ],
    isActive: true
  },
  {
    name: 'Islam Makhachev',
    sport: 'MMA',
    position: 'Lightweight/Welterweight',
    nationality: 'Russia',
    currentClub: 'American Kickboxing Academy',
    age: 32,
    height: '5\'10" (178 cm)',
    weight: '155 lbs (70 kg)',
    image: 'https://i.dailymail.co.uk/1s/2025/11/16/06/103918343-15295445-image-a-41_1763273407522.jpg',
    description: 'Current UFC Lightweight Champion and one of the most dominant fighters in the division, known for his elite grappling skills. A protege of Khabib Nurmagomedov, Makhachev has established himself as one of the best pound-for-pound fighters in the world.',
    stats: {
      'Wins': '28',
      'Losses': '1',
      'Finishes': '18',
      'UFC Wins': '18',
      'Title Defenses': '3',
      'Win Streak': '13'
    },
    trophies: {
      'UFC Lightweight': 1,
      'P4P Ranking': 1,
      'UFC Welterweight': 1,
      'Fight of the Night': 2,
      'Submission of the Night': 3,
      'Undisputed Champion': 1
    },
    career: [
      { year: '2010-2014', club: 'UFC', achievement: 'Early Career', details: 'Regional promotions, Building record' },
      { year: '2015-2021', club: 'UFC', achievement: 'UFC Rise', details: 'Debut, Climbing rankings' },
      { year: '2022', club: 'UFC', achievement: 'Championship', details: 'Title win vs Oliveira' },
      { year: '2022-2024', club: 'UFC', achievement: 'Reign', details: 'Title defenses, P4P #1' }
    ],
    isActive: true
  },
  {
    name: 'Khabib Nurmagomedov',
    sport: 'MMA',
    position: 'Lightweight',
    nationality: 'Russia',
    currentClub: 'Retired',
    age: 35,
    height: '5\'10" (178 cm)',
    weight: '155 lbs (70 kg)',
    image: 'https://i.pinimg.com/736x/81/e5/58/81e5580bc1a23930f9ca613f0fb107aa.jpg',
    description: 'Former UFC Lightweight Champion, widely considered one of the greatest MMA fighters of all time with an undefeated record. Known for his dominant grappling and relentless pressure, Khabib retired with a perfect 29-0 record.',
    stats: {
      'Wins': '29',
      'Losses': '0',
      'Finishes': '19',
      'UFC Wins': '16',
      'Title Defenses': '3',
      'Win Streak': '29'
    },
    trophies: {
      'UFC Lightweight': 1,
      'Undefeated Record': 1,
      'Performance Bonus': 6,
      'Fight of the Night': 2,
      'Submission of the Night': 4,
      'P4P Ranking': 1
    },
    career: [
      { year: '2008-2011', club: 'UFC', achievement: 'Early Career', details: 'Regional dominance, Undefeated' },
      { year: '2012-2017', club: 'UFC', achievement: 'UFC Rise', details: 'Debut, Title contention' },
      { year: '2018-2020', club: 'UFC', achievement: 'Championship Era', details: 'Title win, Defenses' },
      { year: '2020', club: 'UFC', achievement: 'Retirement', details: 'Final fight, Perfect record' }
    ],
    isActive: true
  }
];

module.exports = playersData;