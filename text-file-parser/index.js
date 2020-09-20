const fs = require('fs');
const path = require('path');
const targetFile = '../season-schedule/season-working.md';
const targetSection = '### Preliminary Pack';

// split target file to lines
const input = fs
    .readFileSync(path.join(__dirname, targetFile))
    .toString()
    .trim()
    .split('\n')
    .map((el) => el.trim());

// get array of all entries below first occurance of "targetSection"
const matchLines = (() => {
    const indexOfTarget = input.findIndex((el) => el === targetSection);
    const indexOfFirstDash =
        input.slice(indexOfTarget).findIndex((el) => el[0] === '-') +
        indexOfTarget;
    const lengthOfDashes = input
        .slice(indexOfFirstDash)
        .findIndex((el) => el[0] !== '-');
    return input.splice(indexOfFirstDash, lengthOfDashes);
})();

const matches = matchLines.map((match, index) => {
    const regex = /([A-Z]\d\d).*\[(.*)\s&\s(.*)\svs\.\s(.*)\s&\s(.*)\]/;
    const results = match.match(regex);
    return {
        order: index + 1,
        id: results[1],
        fighterA: results[2],
        fighterB: results[3],
        fighterC: results[4],
        fighterD: results[5],
        teamA: `${results[2]} & ${results[3]}`,
        teamB: `${results[4]} & ${results[5]}`,
    };
});

// write left/right teams
const leftTeam = matches.map((match) => match.teamA).join('\n');
const rightTeam = matches.map((match) => match.teamB).join('\n');
fs.writeFileSync(path.join(__dirname, 'Left Teams.txt'), leftTeam);
fs.writeFileSync(path.join(__dirname, 'Right Teams.txt'), rightTeam);
