/* eslint-disable max-statements */
/* eslint-disable max-depth */
/* eslint-disable complexity */
/* eslint-disable max-lines-per-function */
/* eslint-disable max-len */
/** @module Accounts */

import bcrypt from 'bcrypt-promise'
import sqlite from 'sqlite-async'

const saltRounds = 10

/**
 * Accounts
 * ES6 module that handles registering accounts and logging in.
 */
class Accounts {
	/**
	 * Create an account object
	 */
	constructor(dbName, debug=true) {
		return (async() => {
			this.db = await sqlite.open(dbName)
			const tables = await this.db.all('SELECT name FROM sqlite_master WHERE type = \'table\' AND name NOT LIKE \'sqlite_%\';')
			if (tables) {
				let istable = false
				for (let i=0; i < tables.length; i++) {
					if (tables[i]['name'] === 'users') {
						istable = true
					}
				}
				if(istable) {
					const users = await this.db.all('SELECT * FROM users')
					let dataexists = false
					for (let x=0; x < users.length; x++) {
						if (users[x]['user'] === 'admin') {
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
						console.log('[DBS] Creating "accounts" table')
					}
					await this.db.run('CREATE TABLE IF NOT EXISTS users\
					(id INTEGER PRIMARY KEY AUTOINCREMENT, user TEXT, name TEXT, pass TEXT, email TEXT);')
					await this.addSamples(debug)
					return this
				}
			} else {
				if (debug) {
					console.log('[DBS] Creating "accounts" table - DB is blank')
				}
				await this.db.run('CREATE TABLE IF NOT EXISTS users\
				(id INTEGER PRIMARY KEY AUTOINCREMENT, user TEXT, name TEXT, pass TEXT, email TEXT);')
				await this.addSamples(debug)
				return this
			}
		})()
	}

	/**
	 * registers a new user
	 * @param {String} user the chosen username
	 * @param {String} pass the chosen password
	 * @param {String} email the chosen email
	 * @returns {Boolean} returns true if the new user has been added
	 */
	async register(user, name, pass, email) {
		Array.from(arguments).forEach(val => {
			if (val.length === 0) throw new Error('missing field')
		})
		let sql = `SELECT COUNT(id) as records FROM users WHERE user="${user}";`
		const data = await this.db.get(sql)
		if (data.records !== 0) throw new Error(`username "${user}" already in use`)
		sql = `SELECT COUNT(id) as records FROM users WHERE name="${name}";`
		const users = await this.db.get(sql)
		if (users.records !== 0) throw new Error(`name "${name}" is already in use`)
		sql = `SELECT COUNT(id) as records FROM users WHERE email="${email}";`
		const emails = await this.db.get(sql)
		if (emails.records !== 0) throw new Error(`email address "${email}" is already in use`)
		pass = await bcrypt.hash(pass, saltRounds)
		sql = `INSERT INTO users(user, name, pass, email) VALUES("${user}", "${name}", "${pass}", "${email}")`
		await this.db.run(sql)
		return true

	}

	/**
	 * checks to see if a set of login credentials are valid
	 * @param {String} username the username to check
	 * @param {String} password the password to check
	 * @returns {Boolean} returns true if credentials are valid
	 */
	async login(username, password) {
		let sql = `SELECT count(id) AS count FROM users WHERE user="${username}";`
		const records = await this.db.get(sql)
		if (!records.count) throw new Error(`username "${username}" not found`)
		sql = `SELECT name, pass FROM users WHERE user = "${username}";`
		const record = await this.db.get(sql)
		const valid = await bcrypt.compare(password, record.pass)
		if (valid === false) throw new Error(`invalid password for account "${username}"`)
		return [record.name,username]
	}

	/**
	 * registers the sample data from the requirements
	 * @returns {Boolean} returns true on completion
	 */
	async addSamples(debug) {
		if (debug) {
			console.log('[DBA] Adding example data to \'users\'')
		}
		await this.register('student1', 'Student 1', 'p455w0rd', 'student1@coventry.ac.uk')
		await this.register('student2', 'Student 2','p455w0rd', 'student2@coventry.ac.uk')
		await this.register('student3', 'Student 3','p455w0rd', 'student3@coventry.ac.uk')
		await this.register('student4', 'Student 4','p455w0rd', 'student4@coventry.ac.uk')
		await this.register('admin', 'Admin', 'p455w0rd', 'admin@coventry.ac.uk')
		return true
	}

	async close() {
		await this.db.close()
	}
}

export default Accounts
