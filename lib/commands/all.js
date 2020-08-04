const crypto = require('crypto');
const os = require('os');
const path = require('path');

const commandRemoveKeyframes = require('./remove-keyframes');
const commandShuffleFrames = require('./shuffle-frames');

module.exports = async (source, destination, options) => {
    const pathIntermediate1 = path.resolve(os.tmpdir(), `${crypto.randomBytes(32).toString('hex')}.avi`);

    await commandRemoveKeyframes(source, pathIntermediate1, {
        ...options,
        frameOffset: 0,
    });

    await commandShuffleFrames(pathIntermediate1, destination, {
        ...options,
        probability: 0.1,
        range: 2,
    });
};