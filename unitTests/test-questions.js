/* eslint-disable max-len */

import test from 'ava'
import Questions from '../modules/questions.js'

test('READ    : sample data as object', async test => {
	test.plan(1)
	const questions = await new Questions('db/test.db')
	try {
		const questOb = await questions.getAll('1')
		test.is(typeof questOb, typeof {}, 'data not returned as object')
	} catch(err) {
		test.fail('error thrown')
	} finally {
		questions.close()
	}
})

test('READ    : sample data returns correctly', async test => {
	test.plan(1)
	const questions = await new Questions('db/test.db')
	try {
		const questOb = await questions.getAll('1')
		const len = Object.keys(questOb).length
		test.is(len, 3, 'wrong amount of questions grabbed')
	} catch(err) {
		test.fail('error thrown')
	} finally {
		questions.close()
	}
})


test('READ    : bad surveyid query is handeled', async test => {
	test.plan(1)
	const questions = await new Questions('db/test.db')
	try {
		const questOb = await questions.getAll('999')
		const len = Object.keys(questOb).length
		test.is(len, 0, 'did not return 0 questions')
	} catch(err) {
		test.fail('error thrown')
	} finally {
		questions.close()
	}
})

test('READ    : no surveyid query is handeled', async test => {
	test.plan(1)
	const questions = await new Questions('db/test.db')
	try {
		const questOb = await questions.getAll()
		const len = Object.keys(questOb).length
		test.is(len, 0, 'did not return 0 questions')
	} catch(err) {
		test.fail('error thrown')
	} finally {
		questions.close()
	}
})

test('READ  : reading one question is successful', async test => {
	test.plan(1)
	const questions = await new Questions('db/test.db')
	try {
		const testout = await questions.getOne('1', '1')
		test.is(testout[0]['quest'],'What is your name?','expected value not returned')
	} catch(err) {
		console.log(err.message)
		test.fail('error thrown')
	} finally {
		questions.close()
	}
})

test('WRITE  : adding new question is successful', async test => {
	test.plan(1)
	const questions = await new Questions('db/test.db')
	try {
		await questions.addQuestion('888', '4', 'TEST QUESTION', 'Question Type', '1', 'sort-alphabetically', '', '' )
		const testout = await questions.getOne('888', '4')
		test.is(testout[0]['quest'],'TEST QUESTION','expected value not returned')
	} catch(err) {
		console.log(err.message)
		test.fail('error thrown')
	} finally {
		questions.close()
	}
})
