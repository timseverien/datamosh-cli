const { spawnSync } = require('child_process');

const source = 'examples/stickers.mp4';

const defaultArgs = [
    '--overwrite',
    '--',
    '-filter_complex', 'fps=15',
];

[
    [
        'all',
        source,
        'examples/stickers-all.gif',
        ...defaultArgs
    ],
    [
        'remove-keyframes',
        source,
        'examples/stickers-remove-keyframes.gif',
        '--frame-offset', '4',
        ...defaultArgs
    ],
    [
        'shuffle-frames',
        source,
        'examples/stickers-shuffle-frames.gif',
        '--probability', '0.25',
        '--range', '4',
        ...defaultArgs
    ],
].forEach((args) => {
    console.log(`Running datamosh ${args.join(' ')}`)

    spawnSync('node', ['bin/datamosh.js', ...args], {
        stdio: 'inherit',
    });
});
