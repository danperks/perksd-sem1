/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
/* eslint-disable max-statements */
/* eslint-disable max-depth */
/* eslint-disable complexity */
/* eslint-disable max-len */
/** @module Responses */

import sqlite from 'sqlite-async'

/**
 * Responses
 * ES6 module that handles registering accounts and logging in.
 */
class Responses {
	constructor(dbName, debug=true) {
		return (async() => {
			this.db = await sqlite.open(dbName)
			const tables = await this.db.all('SELECT name FROM sqlite_master WHERE type = \'table\' AND name NOT LIKE \'sqlite_%\';')
			if (tables) {
				let istable = false
				for (let i=0; i < tables.length; i++) {
					if (tables[i]['name'] === 'responses') {
						istable = true
					}
				}
				if(istable) {
					const questions = await this.db.all('SELECT * FROM responses')
					let dataexists = false
					for (let x=0; x < questions.length; x++) {
						if (questions[x]['surveyid'] === '1') {
							dataexists = true
						}
					}
					if (!dataexists) {
						await this.addSamples(debug)
						return this
					} else {
						return this
					}
				} else {
					if (debug) {
						console.log('[DBS] Creating "responses" table')
					}
					const sql = 'CREATE TABLE IF NOT EXISTS responses\
				(respid INTEGER PRIMARY KEY AUTOINCREMENT, \
				userid TEXT, surveyid TEXT, questionid TEXT, location TEXT, time TEXT, answer TEXT);'
					await this.db.run(sql)
					await this.addSamples(debug)
					return this
				}
			} else {
				if (debug) {
					console.log('[DBS] Creating "responses" table - DB is blank')
				}
				const sql = 'CREATE TABLE IF NOT EXISTS responses\
			(respid INTEGER PRIMARY KEY AUTOINCREMENT, \
			userid TEXT, surveyid TEXT, questionid TEXT, location TEXT, time TEXT, answer TEXT);'
				await this.db.run(sql)
				await this.addSamples(debug)
				return this
			}
		})()
	}

	/**
     * saves a users response to a survey
     * @param {String} userid for the user answering the survey
     * @param {String} surveyid for the survey being answered
     * @param {String} questionid for the question being answered
	 * @param {String} object containing text-based answered
	 * @param {String} the value of a multiple choice answer
     * @returns {Boolean} returns true if detected
     */
	async saveresp(userid, surveyid, questionid, location, answer) {
		const time = Math.round(Date.now() / '1000')
		const sql = `INSERT INTO responses \
		(userid, surveyid, questionid, answer, location, time) \
		VALUES ('${ userid }', '${ surveyid }', '${ questionid }', '${ this.safeString(answer) }', '${ location }', '${ time }');`.replace(/\s\s+/g, ' ')
		await this.db.run(sql)
		return true
	}

	safeString(str) {
		if (typeof str === 'string' || str instanceof String) {
			return str
		} else if (typeof str === 'array' || str instanceof Array) {
			const that = this
			str.forEach(function(part, index) {
				this[index] = that.safeString(this[index])
			  }, str)
			return str
		} else {
			return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (char) => {
				switch (char) {
					case '\0':
						return '\\0'
					case '\x08':
						return '\\b'
					case '\x09':
						return '\\t'
					case '\x1a':
						return '\\z'
					case '\n':
						return '\\n'
					case '\r':
						return '\\r'
					case '"':
					case '\'':
					case '\\':
					case '%':
						return `\\${char}` // prepends a backslash to backslash, percent,
									  // and double/single quotes
					default:
						return char
				}
			})
		}
	}

	/**
     * reads all responses to a question
     * @param {String} userid for the user answering the survey
     * @param {String} surveyid for the survey being answered
     * @param {String} questionid for the question being answered
	 * @param {String} object containing text-based answered
	 * @param {String} the value of a multiple choice answer
     * @returns {Boolean} returns true if detected
     */
	async getResponses(surveyid='0') {
		const sql = `SELECT * FROM responses WHERE surveyid=${surveyid}`
		return await this.db.all(sql)
	}

	async getLocations(surveyid) {
		const sql = `SELECT location FROM responses WHERE surveyid="${surveyid}" AND questionid="1"`
		const out = await this.db.all(sql)
		return out
	}

	async getTotalComps() {
		const comps = []
		const counts = {}
		const sql = 'SELECT * FROM responses WHERE questionid="1";'
		const data = await this.db.all(sql)
		for (const rec in data) {
			comps.push(data[rec]['surveyid'])
		}
		for (let i = 0; i < comps.length; i++) {
			const num = comps[i]
			counts[num] = counts[num] ? counts[num] + 1 : 1
		  }
		return counts
	}

	async getStatus(userid) {
		const done = []
		const sql = `SELECT * FROM responses WHERE userid="${userid}" AND questionid="1";`
		const data = await this.db.all(sql)
		for (const rec in data) {
			done.push(data[rec]['surveyid'])
		}
		return done.sort()
	}

	async addSamples(debug) {
		if (debug) {
			console.log('[DBQ] Adding sample responses to \'responses\' table')
		}
		this.saveresp('student2','1','1','51.5074, 0.1278', 'Student,Two')
		this.saveresp('student2','1','2','51.5074, 0.1278', '23')
		this.saveresp('student2','1','3','51.5074, 0.1278', 'Male')
		this.saveresp('student3','1','1','52.4068, 1.5197', 'Student,Three')
		this.saveresp('student3','1','2','52.4068, 1.5197', '22')
		this.saveresp('student3','1','3','52.4068, 1.5197', 'Female')
		this.saveresp('student4','1','1','41.1533, 20.1683', 'Student,Four')
		this.saveresp('student4','1','2','41.1533, 20.1683', '23')
		this.saveresp('student4','1','3','41.1533, 20.1683', 'Male')

		this.saveresp('student2','2','1','51.5074, 0.1278', 'Strongly Agree')
		this.saveresp('student2','2','2','51.5074, 0.1278', 'Test 1')
		this.saveresp('student2','2','3','51.5074, 0.1278', 'Choice,Test')
		this.saveresp('student2','2','4','51.5074, 0.1278', 'Yes')
		this.saveresp('student2','2','5','51.5074, 0.1278', 'Cool Video')
		this.saveresp('student2','2','6','51.5074, 0.1278', 'Wow cool uni')

		this.saveresp('student3','2','1','52.4068, 1.5197', 'Agree')
		this.saveresp('student3','2','2','52.4068, 1.5197', 'Test 1')
		this.saveresp('student3','2','3','52.4068, 1.5197', 'Choice,Test')
		this.saveresp('student3','2','4','52.4068, 1.5197', 'No')
		this.saveresp('student3','2','5','52.4068, 1.5197', 'Nice video')
		this.saveresp('student3','2','6','52.4068, 1.5197', 'I would attend this uni')


		return true
	}

	async close() {
		await this.db.close()
	}
}

export default Responses
