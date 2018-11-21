const {performance}             = require('perf_hooks');

class TuringMachine {
    constructor(tape) {
        this.state;
        this.tape = tape || [];
        this.tapePos = 0;
        this.steps = [];
    }

    executeCommands(commands) {
        // Starting state will be the startState of the first command
        console.log(`Setting starting state to ${commands[0].startState} based on first command`);
        this.state = commands[0].startState;

        commands = this.sortStructurCommands(commands);

        // Start the first execution manually
        console.log(`-- Executing TM`);
        const executeStartTime = performance.now();
        const firstExec = this.execute(0, commands);
        this.steps.push(firstExec);
        this.tape = firstExec.newTape
        this.state = firstExec.newState;
        this.tapePos = firstExec.newPos;

        let loopStepResult;
        do {
            loopStepResult = this.execute(this.tapePos, commands);
            this.steps.push(loopStepResult);
            this.tape = loopStepResult.newTape
            this.state = loopStepResult.newState;
            this.tapePos = loopStepResult.newPos;
        } while (loopStepResult.newState !== 'halt');
        console.log(`-- Executing TM done in ${performance.now() - executeStartTime}ms using ${this.steps.length} steps`);
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
        return stateSortedCommands;
    }

    execute(pos, commands) {
        const readSymbol = this.tape[pos] || '_';
        const newTape = this.tape.slice(0);     newTape[pos] = commands[this.state][readSymbol].writeSymbol;
        const newState = commands[this.state][readSymbol].nextState;
        const newPos = pos + (commands[this.state][readSymbol].moveDirection === 'r' ? 1 : -1);

        return {
            newTape,
            newState,
            newPos
        };
    }
}

module.exports = TuringMachine;