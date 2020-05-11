console.clear();
// structure:
// series => matchs => teams => players

// seed based rng
let seed = 0;
function rng() {
    const n = Math.sin(seed++) * 10000;
    return n - Math.floor(n);
}

let generationAttempts = 0;

// helper function to generate an array
// of letters of length n
const getLetterSequenceArray = (n) => {
    return [...Array(n)].map((_, i) => {
        return String.fromCharCode('A'.charCodeAt(0) + i);
    });
};

// get every team combo possible
const getPossibleTeams = (players) => {
    // make array to hold teams generated
    const teams = [];

    // for each player, find all unique partners
    players.forEach((player, index) => {
        // get a list of all the partners *after*
        // this partner in order given by players variable
        const subArr = [...players].splice(index + 1);

        // if the list gets no results, stop the function
        if (!subArr.length) return;

        // pair each teammate in the sublist with
        // each player from the outer loop
        subArr.forEach((el, index, self) => {
            // push those pairs to the teams array
            teams.push([player, self[index]]);
        });
    });

    // log the teams array and its length
    // console.log('\nTEAM INFO');
    // console.log('Team List:', teams);
    // console.log('Team Count:', teams.length);

    return teams;
};

// take a set of teams, and assign them matches
const assignMatches = (arr) => {
    // make a list to hold all matches
    const matches = [];
    const teams = [...arr];

    // pull teams out of the teams list
    // until 0 or 1 remain
    while (teams.length > 1) {
        // helper function get a random index from a given array
        const _randomArrayIndex = (arr) => {
            return Math.floor(rng() * arr.length);
        };

        // get two random teams
        const _getMatch = () => {
            // first, get a random team
            const teamA = teams.splice(_randomArrayIndex(teams), 1)[0];

            // find a valid oppo for that team
            const validOpponents = teams.filter((team) => {
                // combine and alphabetize to check for a player
                // who ends up playing on both teams
                const combined = [...teamA, ...team].flat().sort();
                return (
                    combined[0] !== combined[1] &&
                    combined[1] !== combined[2] &&
                    combined[2] !== combined[3]
                );
            });
            if (validOpponents.length === 0) {
                return false;
            } else {
                // get teamB from valid oppos
                const teamB = validOpponents.splice(
                    _randomArrayIndex(validOpponents),
                    1
                )[0];

                // remove teamB from teams
                teams.splice(teams.indexOf(teamB), 1)[0];

                return [teamA, teamB];
            }
        };

        // combine them into a match
        const match = _getMatch();

        // if there are no valid opponents, end the loop
        if (!match) {
            break;
        }

        // push the match into the array
        matches.push(match);
    }

    // log the matches, their length, and leftovers
    // console.log('\nMATCH INFO');
    // console.log('Total Matches:', matches.length);
    // console.log('Match List:', matches);
    // console.log('Leftovers:', teams);

    return matches;
};

// get participation data
const getParticipationData = (players, matches) => {
    let logString = '';
    players.forEach((player) => {
        const gamesPlayed = matches.flat(2).filter((el) => el === player)
            .length;
        logString += `${player}|${gamesPlayed}, `;
    });
    // console.log('\nMATCHES PER PLAYER');
    // console.log(logString);
};

const getDeviationScore = (players, matches) => {
    // build map that tracks oppo matchups
    const playerOpponentMap = new Map();
    players.forEach((player, index, arr) => {
        const oppos = arr
            .filter((oppo) => oppo !== player)
            .reduce((obj, el, i) => {
                obj[el] = 0;
                return obj;
            }, {});
        // todo: convert array to object
        playerOpponentMap.set(player, oppos);
    });

    // tally up matches that each player plays against oppos
    matches.forEach((match) => {
        const leftSideOppos = match[0];
        const rightSideOppos = match[1];
        const tallyOppos = (players, oppos) => {
            players.forEach((player) => {
                oppos.forEach((oppo) => {
                    const key = playerOpponentMap.get(player);
                    if (!key) {
                        debugger;
                    }
                    key[oppo]++;
                    playerOpponentMap.set(player, key);
                });
            });
        };
        tallyOppos(leftSideOppos, rightSideOppos);
        tallyOppos(rightSideOppos, leftSideOppos);
    });

    // present oppos
    const oppoMapArray = [...playerOpponentMap.entries()];
    const playerDeviationMap = new Map();
    oppoMapArray.forEach((el) => {
        const key = el[0];
        const values = Object.values(el[1]);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const deviation = max - min;
        playerDeviationMap.set(key, { min, max, deviation });
    });

    // console.log(JSON.stringify([...playerDeviationMap.entries()]));

    const min = Math.min(
        ...[...playerDeviationMap.values()].map((el) => el.min)
    );
    const deviations = [...playerDeviationMap.values()].map(
        (el) => el.deviation
    );
    // const max = Math.max(
    //     ...[...playerDeviationMap.values()].map((el) => el.max)
    // );

    if (min === 0) {
        return Infinity;
    }
    const deviationSum = deviations.reduce((acc, cur) => acc + cur, 0);

    const deviationScore = deviationSum / deviations.length;
    if (deviationScore === 2.8125) debugger;
    return deviationScore;
};

const generateSeason = (playerCount, generationThreshold) => {
    // make a list of all players
    const players = getLetterSequenceArray(playerCount);
    // console.log('\nPLAYER INFO');
    // console.log('Player List', players);
    // console.log('Player Count', players.length);

    // get all possible teams
    const teams = getPossibleTeams(players);

    // assign matches to those teams
    const matches = assignMatches(teams);

    // confirm everyone within one game of each other
    getParticipationData(players, matches);

    // track the seed used
    // console.log('Generation:', generationAttempts);

    // validate
    if (
        Math.floor(teams.length / 2) !== matches.length &&
        generationAttempts < generationThreshold
    ) {
        // reroll
        // console.clear();
        generationAttempts++;
        generateSeason(playerCount, generationThreshold);
    } else {
        currentDeviationScore = getDeviationScore(players, matches);
        currentSeason = matches;
    }
};

let currentSeason;
let currentDeviationScore = Infinity;
let bestSeason;
let bestDeviationScore = Infinity;
let bestSeasonSeed = 0;
let startTime = Date.now();
for (let i = 10000; i <= 20000; i++) {
    seed = i;
    let loopStartSeed = seed;
    generateSeason(16, 20);

    if (
        currentDeviationScore < bestDeviationScore &&
        currentSeason.length === 60
    ) {
        bestSeason = currentSeason;
        bestDeviationScore = currentDeviationScore;
        bestSeasonSeed = loopStartSeed;
        console.log(`\nNEW BEST FOUND!`);
        console.log(`Best Seed: ${loopStartSeed}`);
        console.log(`Best Deviation Score: ${bestDeviationScore}`);
    }
    if (i % 5000 === 0) {
        console.log(`\n${i} iterations`);
        console.log(
            `${((Date.now() - startTime) / 1000 / 60).toFixed(2)} minutes...`
        );
        console.log(`Best Seed: ${bestSeasonSeed}`);
        console.log(`Best Deviation Score: ${bestDeviationScore}`);
    }
}
console.log(`\nSeed: ${bestSeasonSeed}`);
console.log(`Season:`);
console.log(JSON.stringify(bestSeason));
