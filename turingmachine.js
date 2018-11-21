const {performance}             = require('perf_hooks');

class TuringMachine {
    constructor(tape) {
        this.state;
        this.tape = tape || [];
        this.tapePos = 0;
    }

    executeCommands(commands) {
        // Starting state will be the startState of the first command
        console.log(`Setting starting state to ${commands[0].startState} based on first command`);
        this.state = commands[0].startState;

        commands = this.sortStructurCommands(commands);
        
    }

    sortStructurCommands(commands) {
        console.log(`-- Sorting and structuring commands by startState and readSymbol`);
        const stateSortingCommandsTimeStart = performance.now();
        const stateSortedCommands = {};
        for (const command of commands) {
            if (!stateSortedCommands[command.startState]) {
                stateSortedCommands[command.startState] = {};
            }
            
            if (stateSortedCommands[command.startState][command.readSymbol]) {
                console.error(`Duplicate path detected! Your TM is not deterministic`);
                return false;
            }

            stateSortedCommands[command.startState][command.readSymbol] = command;
        }
        console.log(`-- Sorting and structuring done in ${performance.now() - stateSortingCommandsTimeStart}ms`);
    }
}

module.exports = TuringMachine;