/* eslint-disable max-depth */
/* eslint-disable complexity */
/* eslint-disable max-statements */
/* eslint-disable max-len */
/* eslint-disable max-lines-per-function */
/** @module Surveys */

import sqlite from 'sqlite-async'

/**
 * Surveys
 * ES6 module that handles storing and retrieving survey metadata.
 */
class Surveys {
	/**
	 * Create an survey object
	 */
	constructor(dbName, debug=true) {
		return (async() => {
			this.db = await sqlite.open(dbName)
			const tables = await this.db.all('SELECT name FROM sqlite_master WHERE type = \'table\' AND name NOT LIKE \'sqlite_%\';')
			if (tables) {
				let istable = false
				for (let i=0; i < tables.length; i++) {
					if (tables[i]['name'] === 'surveys') {
						istable = true
					}
				}
				if(istable) {
					const surveynames = await this.db.all('SELECT name FROM surveys')
					if (surveynames) {
						let isfilled = false
						for (let i=0; i < tables.length; i++) {
							if (tables[i]['name'] === 'Test Survey 1') {
								isfilled = true
							}
						}
						if (isfilled) {
							this.addSamples(debug)
						}
					}
				} else {
					if(debug) {
						console.log('[DBS] Creating "surveys" table')
					}
					const createsql = 'CREATE TABLE IF NOT EXISTS surveys\
					(surveyid INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, open TEXT, close TEXT, icon TEXT);'
					await this.db.run(createsql)
					this.addSamples(debug)
				}
			} else {
				if(debug) {
					console.log('[DBS] Creating "surveys" table - DB is blank')
				}
				const createsql = 'CREATE TABLE IF NOT EXISTS surveys\
					(surveyid INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, open TEXT, close TEXT, icon TEXT);'
				await this.db.run(createsql)
				this.addSamples(debug)
			}
			return this
		})()
	}

	/**
	 * registers a new user
	 * @param {String} user the chosen username
	 * @param {String} pass the chosen password
	 * @param {String} email the chosen email
	 * @returns {Boolean} returns true if the new user has been added
	 */
	async readAll() {
		const sql = 'SELECT * FROM surveys'
		const surveys = await this.db.all(sql)
		return surveys
	}

	/**
	 * checks to see if a set of login credentials are valid
	 * @param {String} username the username to check
	 * @param {String} password the password to check
	 * @returns {Boolean} returns true if credentials are valid
	 */
	async writeNew(name, open, close, icon) {
		const sql = `INSERT INTO surveys (name, open, close, icon)\
		VALUES ('${name}', '${open}', '${close}', '${icon}');`
		await this.db.run(sql)
		return true
	}

	async getSurveyName(surveyid) {
		const sql = `SELECT name FROM surveys WHERE surveyid='${surveyid}'`
		const name = await this.db.get(sql)
		return name['name']
	}

	async addSamples(debug) {
		if(debug) {
			console.log('[DBS] Adding sample surveys to "surveys"')
		}
		await this.writeNew('Real Example', '01/01/21', '31/01/21', 'mortar-board')
		await this.writeNew('Answer Types', '01/01/21', '1/05/21', 'spanner')
		return true
	}

	async close() {
		await this.db.close()
	}
}

export default Surveys
