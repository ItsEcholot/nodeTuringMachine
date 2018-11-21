const {performance}             = require('perf_hooks');

class TuringMachine {
    constructor(tape, tapeAlphabet) {
        this.state;
        this.tape = tape || [];
        this.tapeAlphabet = tapeAlphabet || [];
        this.tapePos = 0;
        this.steps = [];
    }

    executeCommands(commands, stepsMode) {
        // Starting state will be the startState of the first command and push the initial state to the steps
        console.log(`Setting starting state to ${commands[0].startState} based on first command`);
        this.state = commands[0].startState;
        this.steps.push({
            newTape: this.tape,
            newState: this.state,
            newPos: this.tapePos,
        });

        commands = this.sortStructurCommands(commands);
        if (stepsMode) {
            process.stdin.resume();
            process.stdin.on('data', key => {
                const execStartTime = performance.now();
                const execResult = this.stepExecution(commands);
                if (!execResult) {
                    this.resultPrint();
                    process.exit(0);
                }
                else
                    this.stepPrint(execResult, performance.now() - execStartTime);
            });
        } else {
            this.autoExecution(commands);
        }
    }

    sortStructurCommands(commands) {
        console.log(`-- Sorting and structuring commands by startState and readSymbol`);
        const stateSortingCommandsTimeStart = performance.now();
        let stateSortedCommands = {};
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

        stateSortedCommands = this.replaceWildcardCommands(stateSortedCommands);
        console.log(`-- Sorting and structuring done in ${performance.now() - stateSortingCommandsTimeStart}ms`);
        return stateSortedCommands;
    }

    replaceWildcardCommands(commands) {
        for (let state in commands) {
            for (let readSymbol in commands[state]) {
                if (readSymbol === '*') {
                    for (let tapeAlphabetSymbol of this.tapeAlphabet) {
                        const replacementCommand = {...commands[state]['*']};
                        replacementCommand.readSymbol = tapeAlphabetSymbol;
                        if (replacementCommand.writeSymbol === '*')
                            replacementCommand.writeSymbol = tapeAlphabetSymbol;

                        if (!commands[state][tapeAlphabetSymbol]) {
                            commands[state][tapeAlphabetSymbol] = replacementCommand;
                        }
                    }
                }
            }
        }
        return commands;
    }

    stepExecution(commands) {
        let stepResult = this.execute(this.tapePos, commands);
        this.steps.push(stepResult);
        this.tape = stepResult.newTape
        this.state = stepResult.newState;
        this.tapePos = stepResult.newPos;

        if (stepResult.newState === 'halt') {
            console.log(`Reached halt state, TM accepted the tape`);
            return false;
        }
        else if (!stepResult) {
            console.log(`Didn't reach a halt state, TM didn't accept the tape`);
            return false;
        }

        return stepResult;
    }

    stepPrint(stepResult, msNeeded) {
        const oldStep = this.steps[this.steps.length-2] ? this.steps[this.steps.length-2] : null;
        oldStep.newTape[oldStep.newPos] = oldStep.newTape[oldStep.newPos] ? '➧'.concat(oldStep.newTape[oldStep.newPos]) : '➧_';

        let cloneStepResultTape = stepResult.newTape.slice(0);
        // Fix negative indexes getting lost in clone
        for (let index in stepResult.newTape) {
            if (index < 0)
                cloneStepResultTape[index] = stepResult.newTape[index];
        }
        cloneStepResultTape[stepResult.newPos] = stepResult.newTape[stepResult.newPos] ? '➧'.concat(stepResult.newTape[stepResult.newPos]) : '➧_';

        let oldString = `${oldStep.newState}: `;
        let newString = `${stepResult.newState}: `;

        for (let i = oldStep.newPos - 15; i < oldStep.newPos + 15; i++) {
            oldString += oldStep.newTape[i] ? oldStep.newTape[i] : '_';
        }
        for (let i = stepResult.newPos - 15; i < stepResult.newPos + 15; i++) {
            newString += cloneStepResultTape[i] ? cloneStepResultTape[i] : '_';
        }

        if (msNeeded)
            console.log(`${oldString} ⟶ ${newString} ⟶ ${msNeeded}ms`);
        else
            console.log(`${oldString} ⟶ ${newString}`);
    }

    resultPrint() {
        let lowestIndex = 0;
        let highestIndex = 0;
        for (let index in this.tape) {
            index = parseInt(index);
            if (index < lowestIndex)
                lowestIndex = index;
            if (index > highestIndex)
                highestIndex = index;
        }
        const resultArray = [];
        let foundResult = false;
        for (let i = lowestIndex; i < highestIndex; i++) {
            if (this.tape[i] === '_' && !foundResult)
                continue;
            else if (this.tape[i] !== '_') {
                foundResult = true;
                resultArray.push(this.tape[i]);
            }
            else
                break;
        }

        let result = '';
        resultArray.map(el => result += el);
        
        console.log(`Final result: ${result}`);
    }

    autoExecution(commands) {
        // Start the first execution manually
        console.log(`-- Executing TM`);
        const executeStartTime = performance.now();
        const firstExec = this.execute(0, commands);
        if (firstExec) {
            this.steps.push(firstExec);
            this.tape = firstExec.newTape
            this.state = firstExec.newState;
            this.tapePos = firstExec.newPos;
        } 
        else {
            console.log(`Didn't reach a halt state, TM didn't accept the tape`);
            return;
        }

        let loopStepResult;
        do {
            loopStepResult = this.execute(this.tapePos, commands);
            this.steps.push(loopStepResult);
            this.tape = loopStepResult.newTape
            this.state = loopStepResult.newState;
            this.tapePos = loopStepResult.newPos;
        } while (this.steps.length < 1000000 && loopStepResult && loopStepResult.newState !== 'halt');

        if (loopStepResult.newState === 'halt')
            console.log(`Reached halt state, TM accepted the tape`);
        else if (!loopStepResult)
            console.log(`Didn't reach a halt state, TM didn't accept the tape`);
        else if (loopSteps > 1000000)
            console.log(`Didn't reach a halt state after 1'000'000 steps, probably an endless loop`);

        console.log(`-- Executing TM done in ${performance.now() - executeStartTime}ms using ${this.steps.length-1} steps`);
        
        if (loopStepResult)
            this.stepPrint(loopStepResult);

        this.resultPrint();
    }

    execute(pos, commands) {
        const readSymbol = this.tape[pos] || '_';

        if (!commands[this.state] || !commands[this.state][readSymbol])
            return false;

        let newTape = this.tape.slice(0);  
        // Fix negative indexes getting lost in clone
        for (let index in this.tape) {
            if (index < 0)
                newTape[index] = this.tape[index];
        }
        newTape[pos] = commands[this.state][readSymbol].writeSymbol;

        const newState = commands[this.state][readSymbol].nextState;
        let newPos;
        switch (commands[this.state][readSymbol].moveDirection) {
            case 'r':
                newPos = pos + 1;
                break;
            case 'l':
                newPos = pos - 1;
                break;
            case '*':
                newPos = pos;
                break;
        }

        return {
            newTape,
            newState,
            newPos
        };
    }
}

module.exports = TuringMachine;