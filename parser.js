const fs                = require('fs');
const {performance}     = require('perf_hooks');

class Parser {
    constructor() {

    }

    loadFile(filePath) {
        console.log(`-- Loading file ${filePath}`);
        const loadFileTimeStart = performance.now();
        return new Promise((resolve, reject) => {
            fs.readFile(`./tms/${filePath}`, 'utf-8', (err, data) => {
                if (err)
                    reject(err);
                else {
                    console.log(`-- Loading file done in ${performance.now() - loadFileTimeStart}ms`);
                    resolve(data);
                }
            });
        });
    }

    parseFile(fileContents) {
        console.log(`-- Parsing file contents`);
        const parseTimeStart = performance.now();
        const lines = fileContents.split(/[\r\n]+/);
        const commands = [];
        const tape = [];
        const tapeAlphabet = [];

        const binaryMacroRegex = /BIN\(\d+\)/g;
        const unaryMacroRegex = /UNARY\(\d+\)/g;

        let lineCounter = 0;
        for (const line of lines) {
            lineCounter++;

            // Comment line, ignore
            if (line.charAt(0) === ';')
                continue;

            if (lineCounter === 1 && line.includes('TAPE:')) {
                let tapeTemp = line.split('TAPE: ')[1];

                const binMacros = tapeTemp.match(binaryMacroRegex);
                if (binMacros && binMacros.length > 0) {
                    console.log(`Found BIN() Macro, converting to binary`);
                    for (let binMacro of binMacros) {
                        const intString = binMacro.replace('BIN(', '').replace(')', '');
                        const binString = (parseInt(intString, 10) >>> 0).toString(2)
                        tapeTemp = tapeTemp.replace(binMacro, binString);
                    }
                }

                const unaryMacros = tapeTemp.match(unaryMacroRegex);
                if (unaryMacros && unaryMacros.length > 0) {
                    console.log(`Found UNARY() Macro, converting number to amount of l's`);
                    for (let unaryMacro of unaryMacros) {
                        const intString = unaryMacro.replace('UNARY(', '').replace(')', '');
                        const unaryString = 'l'.repeat(parseInt(intString, 10));
                        tapeTemp = tapeTemp.replace(unaryMacro, unaryString);
                    }
                }

                tape.push(...tapeTemp);

                console.log(`Found tape ${tapeTemp}`);
                continue;
            }

            const args = line.split(' ');
            if (args.length >= 5) {
                if (!tapeAlphabet.includes(args[1]))
                    tapeAlphabet.push(args[1]);
                if (!tapeAlphabet.includes(args[2]))
                    tapeAlphabet.push(args[2]);

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

        console.log(`-- Parsing file contents done in ${performance.now() - parseTimeStart}ms`);
        return {commands, tape, tapeAlphabet};
    }
}

module.exports = Parser;