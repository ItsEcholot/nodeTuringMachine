class TuringMachine {
    constructor(tape) {
        this.state;
        this.tape = tape || [];
    }

    executeCommands(commands) {
        // Starting state will be the startState of the first instruction
        this.state = commands[0].startState;
        const stateSortedCommands = {};

        for (const command of commands) {
            if (!stateSortedCommands[command.startState]) {
                stateSortedCommands[command.startState] = {};
            }
            
            if (stateSortedCommands[command.startState][command.readSymbol]) {
                console.error(`Duplicate path! Your TM is not deterministic`);
                return false;
            }

            stateSortedCommands[command.startState][command.readSymbol] = command;
        }

        console.dir(stateSortedCommands);
    }
}

module.exports = TuringMachine;