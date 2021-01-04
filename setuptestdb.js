/* eslint-disable max-lines-per-function */
import { unlinkSync } from 'fs'
import sqlite from 'sqlite-async'

import Accounts from '../workspace/modules/accounts.js'
import Surveys from '../workspace/modules/surveys.js'
import Responses from '../workspace/modules/responses.js'
import Questions from '../workspace/modules/questions.js'

const path = 'db/test.db'

async function deltable(debug) {
	try {
		unlinkSync(path)
		if (debug) {
			console.log('----DATABASE DELETED----')
		}
	} catch(err) {
		if (debug) {
			console.log('----DATABASE NOT EXSIST----')
		}
	}
}

async function init() {
	const db = await sqlite.open(path)
	await db.run('PRAGMA busy_timeout = 60000')
}

async function start(debug) {
	const a = await new Accounts('db/test.db', debug)
	await a.close()
	if (debug) {
		console.log('----ACCOUNTS DONE----')
	}
	const s = await new Surveys('db/test.db', debug)
	await s.close()
	if (debug) {
		console.log('----SURVEYS DONE----')
	}
	const r = await new Responses('db/test.db', debug)
	await r.close()
	if (debug) {
		console.log('----RESPONSES DONE----')
	}
	const q = await new Questions('db/test.db', debug)
	await q.close()
	if (debug) {
		console.log('----QUESTIONS DONE----')
	}
}

async function clearTestDB(debug=false) {
	await deltable(debug)
	await init()
	await start(debug)
}

clearTestDB()

