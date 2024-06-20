const TransportStream = require('winston-transport');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

class CustomRotateFile extends TransportStream {
    constructor(opts) {
        super(opts);
        this.filename = opts.filename;
        this.dirname = opts.dirname || '.';
        this.datePattern = opts.datePattern || 'YYYY-MM-DD';
        this.maxFiles = opts.maxFiles || '14d';
        this.createStream();
    }

    createStream() {
        const filename = path.join(this.dirname, this.filename.replace('%DATE%', moment().format(this.datePattern)));
        this.ensureDirectoryExistence(filename);
        this.stream = fs.createWriteStream(filename, { flags: 'a' });
    }

    ensureDirectoryExistence(filePath) {
        const dirname = path.dirname(filePath);
        if (fs.existsSync(dirname)) {
            return true;
        }
        this.ensureDirectoryExistence(dirname);
        fs.mkdirSync(dirname);
    }

    log(info, callback) {
        setImmediate(() => this.emit('logged', info));
        this.stream.write(`${info.timestamp} [${info.level.toUpperCase()}] >>> ${info.message} \n`);
        callback();
    }

    rotate() {
        this.stream.end();
        this.createStream();
        this.cleanup();
    }

    cleanup() {
        const files = fs.readdirSync(this.dirname)
            .filter(file => file.startsWith(this.filename.split('%DATE%')[0]))
            .sort((a, b) => fs.statSync(path.join(this.dirname, b)).mtime - fs.statSync(path.join(this.dirname, a)).mtime);

        while (files.length > this.maxFiles) {
            fs.unlinkSync(path.join(this.dirname, files.pop()));
        }
    }
}

module.exports = CustomRotateFile;