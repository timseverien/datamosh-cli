const program = require('commander');
const commandAll = require('../lib/commands/all');
const commandRemoveKeyframes = require('../lib/commands/remove-keyframes');
const commandShuffleFrames = require('../lib/commands/shuffle-frames');

function createCommandAction(command) {
    return async (source, destination, options) => {
        let ffmpegArguments = [];

        if (program.rawArgs.includes('--')) {
            ffmpegArguments = program.rawArgs.slice(program.rawArgs.indexOf('--') + 1);
        }

        try {
            await command(source, destination, {
                ...options,
                ffmpegArguments,
            });
            process.exit();
        } catch (error) {
            console.error(error);
            process.exit(1);
        }
    };
}

program
    .description('Apply all effects')
    .command('all <source> <destination>')
    .option('--overwrite', 'Skips overwrite prompt and overwrites <destination> if it exists', false)
    .action(createCommandAction(commandAll));

program
    .description('Replace keyframes from a video with a neighbouring B/P-frame')
    .command('remove-keyframes <source> <destination>')
    .option('--frame-offset <offset>', 'Offset to start looking for neighbouring frames', -1)
    .option('--overwrite', 'Skips overwrite prompt and overwrites <destination> if it exists', false)
    .action(createCommandAction(commandRemoveKeyframes));

program
    .description('Shuffle B/P-frames')
    .command('shuffle-frames <source> <destination>')
    .option('--overwrite', 'Skips overwrite prompt and overwrites <destination> if it exists', false)
    .option('-p, --probability <probability>', 'Probability of swapping a frame', 0.1)
    .option('-r, --range <range>', 'Range of neighbouring frames to swap', 2)
    .action(createCommandAction(commandShuffleFrames));

program.parse(process.argv);