
import test from 'ava'
import Accounts from '../modules/accounts.js'

test('REGISTER : register and log in with a valid account', async test => {
	test.plan(1)
	const account = await new Accounts('db/test.db')
	try {
		await account.register('doej', 'testname', 'password', 'doej@gmail.com')
	  const login = await account.login('doej', 'password')
		test.deepEqual(login, ['testname','doej'], 'unable to log in')
	} catch(err) {
		test.fail('error thrown')
	} finally {
		account.close()
	}
})

test('REGISTER : register a duplicate username', async test => {
	test.plan(1)
	const account = await new Accounts('db/test.db')
	try {
		await account.register('doej', 'testname', 'password', 'doej@gmail.com')
		await account.register('doej', 'testname', 'password', 'doej@gmail.com')
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'username "doej" already in use', 'incorrect error message')
	} finally {
		account.close()
	}
})

test('REGISTER : error if blank username', async test => {
	test.plan(1)
	const account = await new Accounts('db/test.db')
	try {
		await account.register('', 'testname', 'password', 'doej@gmail.com')
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'missing field', 'incorrect error message')
	} finally {
		account.close()
	}
})

test('REGISTER : error if blank password', async test => {
	test.plan(1)
	const account = await new Accounts('db/test.db')
	try {
		await account.register('doej', 'testname', '', 'doej@gmail.com')
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'missing field', 'incorrect error message')
	} finally {
		account.close()
	}
})

test('REGISTER : error if blank email', async test => {
	test.plan(1)
	const account = await new Accounts('db/test.db')
	try {
		await account.register('doej', 'testname', 'password', '')
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'missing field', 'incorrect error message')
	} finally {
		account.close()
	}
})

test('REGISTER : error if duplicate email', async test => {
	test.plan(1)
	const account = await new Accounts('db/test.db')
	try {
		await account.register('poiu', 'emailname', 'password', 'poiu@gmail.com')
		await account.register('uiop', 'emailname2', 'newpassword', 'poiu@gmail.com')
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'email address "poiu@gmail.com" is already in use', 'incorrect error message')
	} finally {
		account.close()
	}
})

test('REGISTER : error if duplicate name', async test => {
	test.plan(1)
	const account = await new Accounts('db/test.db')
	try {
		await account.register('asdf', 'dupnametest', 'password', 'asdf@gmail.com')
		await account.register('asdfg', 'dupnametest', 'newpassword', 'asdfg@gmail.com')
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'name "dupnametest" is already in use', 'incorrect error message')
	} finally {
		account.close()
	}
})

test('LOGIN    : invalid username', async test => {
	test.plan(1)
	const account = await new Accounts('db/test.db')
	try {
		await account.register('doej', 'testname', 'password', 'doej@gmail.com')
		await account.login('roej', 'password')
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'username "roej" not found', 'incorrect error message')
	} finally {
		account.close()
	}
})

test('LOGIN    : invalid password', async test => {
	test.plan(1)
	const account = await new Accounts('db/test.db')
	try {
		await account.register('doej', 'testname', 'password', 'doej@gmail.com')
		await account.login('doej', 'bad')
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'invalid password for account "doej"', 'incorrect error message')
	} finally {
		account.close()
	}
})
