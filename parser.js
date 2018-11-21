const fs                = require('fs');

class Parser {
    constructor() {

    }

    loadFile(filePath) {
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
        const lines = fileContents.split(/[\r\n]+/);
        const commands = [];

        let lineCounter = 0;
        for (let line of lines) {
            lineCounter++;
            
            // Comment line, ignore
            if (line.charAt(0) === '#')
                continue;

            const args = line.split(' ');
            if (args.length == 5) {
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
    }
}

module.exports = Parser;