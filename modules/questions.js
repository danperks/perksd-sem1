/* eslint-disable max-params */
/* eslint-disable max-statements */
/* eslint-disable max-lines-per-function */
/* eslint-disable max-len */
/* eslint-disable max-depth */
/* eslint-disable complexity */
/** @module Questions */

import sqlite from 'sqlite-async'

/**
 * Questions
 * ES6 module that handles storing and retrieving survey questions.
 */
class Questions {
	/**
     * Create an questions object
     */
	constructor(dbName, debug=true) {
		return (async() => {
			this.db = await sqlite.open(dbName)
			const tables = await this.db.all('SELECT name FROM sqlite_master WHERE type = \'table\' AND name NOT LIKE \'sqlite_%\';')
			if (tables) {
				let istable = false
				for (let i=0; i < tables.length; i++) {
					if (tables[i]['name'] === 'questions') {
						istable = true
					}
				}
				if(istable) {
					const questions = await this.db.all('SELECT * FROM questions')
					let dataexists = false
					for (let x=0; x < questions.length; x++) {
						if (questions[x]['surveyid'] === parseInt('1')) {
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
						console.log('[DBS] Creating "questions" table')
					}
					const sql = 'CREATE TABLE IF NOT EXISTS questions\
                    (questionid INTEGER PRIMARY KEY AUTOINCREMENT, surveyid INTEGER, \
                    questnum INTEGER, quest TEXT, type TEXT, reptype TEXT, icon TEXT, embed TEXT, choices TEXT);'
					await this.db.run(sql)
					await this.addSamples(debug)
					return this
				}
			} else {
				if (debug) {
					console.log('[DBS] Creating "questions" table - DB is blank')
				}
				const sql = 'CREATE TABLE IF NOT EXISTS questions\
				(questionid INTEGER PRIMARY KEY AUTOINCREMENT, surveyid INTEGER, \
				questnum INTEGER, quest TEXT, type TEXT, reptype TEXT, icon TEXT, embed TEXT, choices TEXT);'
				await this.db.run(sql)
				await this.addSamples(debug)
				return this
			}
		})()
	}


	/**
     * gets all questions for a given surveyid
     * @param {String} the surveyid for the desired survey
     * @returns {Object} returns a JSON Object with the survey question data
     */
	async getAll(surveyid=0) {
		const sql = `SELECT * FROM questions WHERE surveyid="${surveyid}";`
		const quests = await this.db.all(sql)
		return quests
	}

	/**
     * gets one question for a given surveyid
     * @param {String} the surveyid for the desired survey
	 * @param {String} the questid for the desired survey
     * @returns {Object} returns a JSON Object with the survey question data
     */
	async getOne(surveyid, questionid) {
		const sql = `SELECT * FROM questions WHERE surveyid="${surveyid}" AND questnum="${questionid}";`
		const quests = await this.db.all(sql)
		if (quests.length < 1) {
			throw new Error('This questionid does not exist in this surveyid')
		} else {
			return quests
		}
	}

	async addQuestion(surveyid, questnum, quest, type, reptype, icon, embed, choices) {
		const sql = `INSERT INTO questions (surveyid, questnum, quest, type, reptype, icon, embed, choices)
		VALUES (${surveyid}, ${questnum}, '${quest}', '${type}', '${reptype}', '${icon}', '${embed}', '${choices}');`
		this.db.run(sql)
		return true
	}

	async addSamples(debug) {
		if (debug) {
			console.log('[DBQ] Adding sample questions to \'questions\' table')
		}
		await this.addQuestion('1', '1', 'What is your name?', 'Text Question', '2', 'sort-alphabetically', '', '' )
		await this.addQuestion('1', '2', 'How old are you?', 'Text Question', '1', 'sort-numerically', '', '' )
		await this.addQuestion('1', '3', 'Which are you?', 'Multiple Choice', '3', 'clipboard', '', '["Male","Female]' )

		await this.addQuestion('2', '1', 'Default Scale Question', 'Multiple Choice', '0', 'plus', '', '' )
		await this.addQuestion('2', '2', 'Single Input Question', 'Text Question', '1', 'star', '', '' )
		await this.addQuestion('2', '3', 'Multiple Inputs Question', 'Multiple Question', '2', 'heart', '', '' )
		await this.addQuestion('2', '4', 'Multiple Choice Question', 'Multiple Choice', '3', 'camera', '', '["Yes","No"]' )
		await this.addQuestion('2', '5', 'Video Embed Question', 'Video Question', '1', 'chart-bar', 'https://www.youtube.com/watch?v=-bVzgpENLwo', '' )
		await this.addQuestion('2', '6', 'Photo Embed Question', 'Photo Question', '3', 'vendor-apple', 'https://www.coventry.ac.uk/globalassets/media/global/news-articles/january-2020/alan_berry_exterior_9673---web.jpg', '' )

		return true
	}

	async close() {
		await this.db.close()
	}
}

export default Questions
