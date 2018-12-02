# nodeTuringMachine
Yeah you guessed it, it's a turing machine... Made in node

## Usage
`node index.js [filename] (steps)`

The first argument has to always be the txt file containing the Turing machine and the tape. Take a look at the provided TMs to see how the tape is defined.

The steps argument is optional and enables the manual stepping through mode where every TM execution step is only run after you press enter in the terminal.

## TXT file syntax

- Comments are marked with ;
- No empty lines are allowed, only if they're marked with the comment symbol ;
- Every line represents a single transition between two states.
- Every lines has the following content: q0 x y z q1, where:
    - q0: From state
    - x: Symbol to be read
    - y: Symbol to be written
    - z: r (right) / l (left) / * (stay) depending on which direction you want to move the head after
    - q1: Next state
    - You can insert * for x to match every symbol which hasn't an explicit transition defined.
    - You can insert * for y if you inserted * for x to write the same symbol that has been read (no change).

## Tape macros

- BIN(*decimal number*) converts decimal number to a binary string on the tape
- UNARY(*decimal number*) converts decimal number to an unary represantation created with l's on the tape

For more information take a look at the provided example TMs in this repo.