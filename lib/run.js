const { spawn } = require('child_process');

module.exports = function run(command, args = [], options = {
    cwd: process.cwd(),
    stdio: 'inherit',
}) {
    return new Promise((resolve, reject) => {
        const program = spawn(command, args, options);

        program.on('error', error => reject(error));

        program.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Process ended with code: ${code}`));
            }
        });
    });
}
