const Parser                = require('./parser');
const TuringMachine         = require('./turingmachine');

class App {
    constructor() {
        console.log(`Starting node turing machine`);
        this.parser = new Parser();

        this.parser.loadFile(process.argv[2]).then(file => {
            const parseRes = this.parser.parseFile(file);

            this.turingMachine = new TuringMachine(parseRes.tape, parseRes.tapeAlphabet);
            this.turingMachine.executeCommands(parseRes.commands, process.argv[3] === 'steps');

            console.log(`All done... Exiting`);
        }).catch(err => console.error(err));
    }
}

module.exports = App;