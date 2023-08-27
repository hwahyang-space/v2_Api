import fs from 'fs';
import path from 'path';
import colors from 'colors/safe';

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

const config = require('../../config/config.json');

const enum LogLevel {
	DEBUG,
	LOG,
	WARNING,
	ERROR,
}

class LogManager {
	private readonly from;

	constructor(from: string) {
		dayjs.extend(customParseFormat);
		dayjs.extend(utc);
		dayjs.extend(timezone);
		dayjs.tz.setDefault('Asia/Seoul');
		this.from = from;
	}

	// 무조건 병렬(비동기) 처리 !!
	public log = async (logLevel: LogLevel, message: string) => {
		const now = dayjs();

		let printMessage = colors.green(`<${now.format('YYYY-MM-DD HH:mm:ss Z')}> `);
		let stringLevel;
		switch (logLevel) {
			case LogLevel.DEBUG:
				stringLevel = 'DEBUG';
				printMessage += `[${stringLevel}] ${this.from} >> `;
				break;
			case LogLevel.LOG:
				stringLevel = 'LOG';
				printMessage += colors.cyan(`[${stringLevel}] ${this.from} >> `);
				break;
			case LogLevel.WARNING:
				stringLevel = 'WARNING';
				printMessage += colors.yellow(`[${stringLevel}] ${this.from} >> `);
				break;
			case LogLevel.ERROR:
				stringLevel = 'ERROR';
				printMessage += colors.red(`[${stringLevel}] ${this.from} >> `);
				break;
		}
		printMessage += message;

		console.log(printMessage);

		if (logLevel === LogLevel.DEBUG) return; // 파일에 저장 안함

		const logMessage = `<${now.format('YYYY-MM-DD HH:mm:ss Z')}> [${stringLevel}] ${
			this.from
		} >> ${message}`;
		LogWorker.Instance().addLog(logMessage);
	};
}

class LogWorker {
	private static instance: LogWorker;
	public static Instance = () => {
		if (!this.instance) {
			this.instance = new LogWorker();
		}
		return this.instance;
	};

	private readonly rootPath = path.join('logs');

	private messageQueue = '';

	constructor() {
		dayjs.extend(customParseFormat);
		dayjs.extend(utc);
		dayjs.extend(timezone);
		dayjs.tz.setDefault('Asia/Seoul');

		setInterval(this.processWorker, config.log.workerInterval);
	}

	public addLog = (message: string) => {
		this.messageQueue += message + '\n';
	};

	private processWorker = async () => {
		if (this.messageQueue === '') return;

		const now = dayjs();
		const fullPath = path.join(this.rootPath, now.format(config.log.logFileFormat));

		const currentQueue = this.messageQueue;
		this.messageQueue = '';

		if (!await fs.existsSync(this.rootPath)) {
			await fs.mkdirSync(this.rootPath);
		}

		if (await fs.existsSync(fullPath)) {
			await fs.appendFileSync(fullPath, currentQueue, { encoding: 'utf-8' });
		} else {
			await fs.writeFileSync(fullPath, currentQueue, { encoding: 'utf-8' });
		}
	};
}

export { LogLevel, LogManager, LogWorker };
