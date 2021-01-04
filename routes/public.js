/* eslint-disable complexity */
/* eslint-disable max-statements */
/* eslint-disable max-lines-per-function */
import Router from 'koa-router'
import bodyParser from 'koa-body'
import fetch from 'node-fetch'

const router = new Router()
router.use(bodyParser({ multipart: true }))

import Accounts from '../modules/accounts.js'
import Surveys from '../modules/surveys.js'
import Responses from '../modules/responses.js'

/**
 * The secure home page.
 *
 * @name Home Page
 * @route {GET} /
 */
router.get('/', async ctx => {
	const surveysdb = await new Surveys('db/northsea.db')
	const responsesdb = await new Responses('db/northsea.db')
	if (surveysdb === null) {
		return ctx.redirect('/', ctx.hbs)
	}
	const surveys = await surveysdb.readAll()
	const comps = await responsesdb.getTotalComps()
	const status = await responsesdb.getStatus(ctx.session.username)
	for (const survey in surveys) {
		const correctsurvey = (parseInt(survey) + 1).toString()
		if (comps[correctsurvey] === undefined) {
			surveys[survey]['completions'] = 0
		} else {
			surveys[survey]['completions'] = comps[correctsurvey]
		}
		if (ctx.session.authorised) {
			if (status.indexOf(correctsurvey) >= 0) {
				surveys[survey]['statustxt'] = 'Completed'
				surveys[survey]['status'] = true
			} else {
				surveys[survey]['statustxt'] = 'Not Completed'
				surveys[survey]['status'] = false
			}
		} else {
			surveys[survey]['statustxt'] = 'Not Logged In'
			surveys[survey]['status'] = false
		}
	}
	ctx.hbs.surveys = surveys
	ctx.hbs.isadmin = false
	if (ctx.session.username === 'admin') {
		ctx.hbs.isadmin = false
	}
	ctx.hbs.name = ctx.session.name
	ctx.hbs.username = ctx.session.username
	if (ctx.session.error !== '') {
		ctx.hbs.msg = ` ${ ctx.session.error}`.slice(1)
		ctx.session.error = ''
	} else {
		ctx.session.error = ''
	}
	await ctx.render('index', ctx.hbs)
})


/**
 * The user registration page.
 *
 * @name Register Page
 * @route {GET} /register
 */
router.get('/register', async ctx => await ctx.render('register', ctx.hbs))

/**
 * The script to process new user registrations.
 *
 * @name Register Script
 * @route {POST} /register
 */
router.post('/register', async ctx => {
	const account = await new Accounts('db/northsea.db')
	try {
		// cl the functions in the module
		await account.register(ctx.request.body.username, ctx.request.body.name,
			ctx.request.body.password, ctx.request.body.email)
		ctx.session.error = 'Registered successfully - now log in'
		return ctx.redirect('/login', ctx.hbs)
	} catch (err) {
		ctx.session.error = err.message
		await ctx.render('register', ctx.hbs)
	} finally {
		account.close()
	}
})

router.get('/login', async ctx => {
	if (ctx.session.error !== '') {
		ctx.hbs.msg = ctx.session.error
		ctx.session.error = ''
	}
	await ctx.render('login', ctx.hbs)
})

router.post('/login', async ctx => {
	try {
		const account = await new Accounts('db/northsea.db')
		ctx.hbs.body = ctx.request.body
		const body = ctx.request.body
		const data = await account.login(body.username, body.password)
		ctx.session.authorised = true
		ctx.session.name = data[0]
		ctx.session.username = data[1]
		await ctx.redirect('/', ctx.hbs)
	} catch (error) {
		ctx.session.error = error.message
		console.log(error.message)
		await ctx.redirect('/login', ctx.hbs)
	}
})

router.get('/logout', async ctx => {
	ctx.session.authorised = false
	ctx.session.name = 'Session Timed Out'
	ctx.session.username = 'Relogin to refresh'
	return ctx.redirect('/')
})


router.post('/api', async ctx => {
	if (ctx.session.authorised) {
		const resp = await new Responses('db/northsea.db')
		const data = JSON.parse(ctx.request.body)
		const user = data['username']
		const surveyid = data['surveyid']
		const clientip = data['clientip']
		let location = null
		if (data['location']) {
			location = data['location']
		} else {
			const iprequrl = `http://api.ipstack.com/${clientip}?access_key=62935bc4369bcfbc1a19cce5cd6d8cbf`
			const ipdata = await (await fetch(iprequrl)).json()
			location = `${ipdata['latitude']}, ${ipdata['longitude']}`
		}

		const result = JSON.parse(data['data'])
		for (const questno in result) {
			resp.saveresp(user, surveyid, questno, location, result[questno])
		}
		ctx.session.error = 'Your results have been saved'
		await ctx.redirect('/', ctx.hbs)
	} else {
		ctx.session.error = 'You are not authorised to submit this survey'
		await ctx.redirect('/', ctx.hbs)
	}
})

export default router
