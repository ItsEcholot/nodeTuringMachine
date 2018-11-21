const fs                = require('fs');

class Parser {
    constructor() {

    }

    loadFile(filePath) {
        console.log(`Loading file ${filePath}`);
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, 'utf-8', (err, data) => {
                if (err)
                    reject(err);
                else
                    resolve(data);
            });
        });
    }

    parseFile(fileContents) {
        console.log(`Parsing file contents`);
        const lines = fileContents.split(/[\r\n]+/);
        const commands = [];
        const tape = [];

        let lineCounter = 0;
        for (const line of lines) {
            lineCounter++;

            // Comment line, ignore
            if (line.charAt(0) === '#')
                continue;

            if (lineCounter === 1 && line.includes('TAPE:')) {
                tape.push(...(line.split('TAPE: ')[1]));
                continue;
            }

            const args = line.split(' ');
            if (args.length === 5) {
                commands.push({
                    startState: args[0],
                    readSymbol: args[1],
                    writeSymbol: args[2],
                    moveDirection: args[3],
                    nextState: args[4],
                });
            } else {
                console.log(`Yikes line ${lineCounter} is malformed. Not 5 arguments!`);
                return false;
            }
        }

        return {commands, tape};
    }
}

module.exports = Parser;