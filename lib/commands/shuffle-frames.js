const AviGlitch = require('aviglitch');
const crypto = require('crypto');
const fs = require('fs-extra');
const inquirer = require('inquirer');
const os = require('os');
const path = require('path');
const pathToFfmpeg = require('ffmpeg-static');

const mathf = require('../mathf');
const run = require('../run');

const ffmpegArgumentsLossless = [
    '-crf', '0',
    '-q:a', '0',
    '-q:v', '0'
];

module.exports = async (source, destination, options = {}) => {
    const pathSource = path.resolve(process.cwd(), source);
    const pathDestination = path.resolve(process.cwd(), destination);
    const fileNameIntermediate = crypto.randomBytes(32).toString('hex');
    const pathIntermediateSource = path.resolve(os.tmpdir(), `${fileNameIntermediate}.avi`);
    const pathIntermediateDestination = path.resolve(os.tmpdir(), `${fileNameIntermediate}-out.avi`);

    const isSourceToIntermediateConversionRequired = path.extname(pathSource) !== path.extname(pathIntermediateSource);
    const isIntermediateToDestinationConversionRequired = path.extname(pathIntermediateSource) !== path.extname(pathDestination);

    const overwrite = Boolean(options.overwrite);
    const probability = Number.parseFloat(options.probability);
    const range = Number.parseInt(options.range);

    const ffmpegArguments = [
        '-loglevel', 'error',
        '-pix_fmt', 'yuv420p',
        '-y', // overwrite if destination exists
        ...options.ffmpegArguments,
    ];

    if (!overwrite) {
        const destinyExists = await fs.exists(pathDestination);

        if (destinyExists) {
            const result = await inquirer.prompt({
                default: false,
                message: `"${pathDestination}" already exists. Should this file be replaced?`,
                name: 'destinationReplace',
                type: 'confirm',
            });

            if (!result.destinationReplace) {
                console.log('Unable to proceed without replacing the destination file.');
                process.exit(0);
            }
        }
    }

    {
        const pathIntermediateDirectory = path.dirname(pathIntermediateSource);

        try {
            await fs.ensureDir(pathIntermediateDirectory);
        } catch (error) {
            console.log(`Unable to create dir "${pathIntermediateDirectory}"`);
        }
    }

    console.log(`Creating "${pathIntermediateSource}"`);

    {
        if (isSourceToIntermediateConversionRequired) {
            try {
                await run(pathToFfmpeg, [
                    '-i', pathSource,
                    ...ffmpegArgumentsLossless,
                    pathIntermediateSource,
                ]);
            } catch (error) {
                console.error(error);
                process.exit(1);
            }
        } else {
            await fs.copyFile(pathSource, pathIntermediateSource);
        }
    }

    console.log(`Destroying "${pathIntermediateSource}"`);

    {
        const avi = AviGlitch.open(pathIntermediateSource);
        const originalFrames = [];

        avi.frames.each(({ data, flag, is_keyframe }) => {
            originalFrames.push({ data, flag, is_keyframe });
        });

        avi.frames.each_with_index((frame, index) => {
            const r = Math.random();

            if (index === 0 || r > probability) {
                return frame.data;
            }

            let randomFrame;
            let randomFrameIndex;

            do {
                randomFrameIndex = index + Math.round(mathf.mix(-range, range, Math.random()));

                randomFrame = originalFrames[randomFrameIndex];
            } while (!randomFrame || randomFrame.is_keyframe);

            frame.flag = randomFrame.flag;
            frame.data = randomFrame.data;
        });

        avi.output(pathIntermediateDestination);
    }

    console.log(`Moving "${pathIntermediateDestination}" to "${pathDestination}"`);

    {
        if (isIntermediateToDestinationConversionRequired) {
            try {
                await run(pathToFfmpeg, [
                    '-i', pathIntermediateDestination,
                    ...ffmpegArguments,
                    pathDestination,
                ]);
            } catch (error) {
                console.error(error);
                process.exit(1);
            }
        } else {
            await fs.move(pathIntermediateDestination, pathDestination, { overwrite: true });
        }
    }
};
