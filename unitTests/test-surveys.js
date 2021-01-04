
import test from 'ava'
import Surveys from '../modules/surveys.js'

test('READ : readAll returns as expected', async test => {
	test.plan(1)
	const surveys = await new Surveys('db/test.db')
	try {
		const allsurvs = await surveys.readAll()
		const type = typeof allsurvs
		test.deepEqual(type, 'object', 'value not returned as object')
	} catch(err) {
		console.log(err)
		test.fail('error thrown')
	} finally {
		surveys.close()
	}
})

test('READ : survey name returns correctly', async test => {
	test.plan(1)
	const surveys = await new Surveys('db/test.db')
	try {
		const name = await surveys.getSurveyName(1)
		test.deepEqual(name, 'Real Example', 'name not correct')
	} catch(err) {
		console.log(err)
		test.fail('error thrown')
	} finally {
		surveys.close()
	}
})

test('WRITE : survey name returns correctly', async test => {
	test.plan(1)
	const surveys = await new Surveys('db/test.db')
	try {
		await surveys.writeNew('TEST TEST', '01/01/21', '31/01/21', 'mortar-board')
		const allsurvs = await surveys.readAll()
		let good = false
		for (const sur in allsurvs) {
			if (allsurvs[sur]['name'] === 'TEST TEST') {
				good = true
			}
		}
		test.is(good, true, 'new test not found')
	} catch(err) {
		console.log(err)
		test.fail('error thrown')
	} finally {
		surveys.close()
	}
})
