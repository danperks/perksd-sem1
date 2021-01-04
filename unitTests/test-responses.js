/* eslint-disable max-len */

import test from 'ava'
import Responses from '../modules/responses.js'

test('WRITE    : saving response works as intended', async test => {
	test.plan(1)
	const responses = await new Responses('db/test.db')
	try {
		await responses.saveresp('testaccount','2','1','51.5074, 0.1278', 'Test,Answer')
		const outresp = await responses.getResponses('2')
		let good = false
		for (const out in outresp) {
			if (outresp[out]['userid'] === 'testaccount') {
				good = true
			}
		}
		test.is(good, true, 'data not returned as object')
	} catch(err) {
		console.log(err)
		test.fail('error thrown')
	} finally {
		responses.close()
	}
})

test('READ    : getting location for responses', async test => {
	test.plan(1)
	const responses = await new Responses('db/test.db')
	try {
		const outresp = await responses.getLocations('1')
		test.is(Object.keys(outresp).length, 3, 'data not returned as object')
	} catch(err) {
		console.log(err)
		test.fail('error thrown')
	} finally {
		responses.close()
	}
})

test('READ    : getting total responses per question', async test => {
	test.plan(1)
	const responses = await new Responses('db/test.db')
	try {
		const outresp = await responses.getTotalComps()
		test.is(Object.keys(outresp).length, 2, 'data not returned as object')
	} catch(err) {
		console.log(err)
		test.fail('error thrown')
	} finally {
		responses.close()
	}
})
