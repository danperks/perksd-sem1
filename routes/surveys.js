/* eslint-disable max-lines-per-function */

import Router from 'koa-router'

const router = new Router({ prefix: '/map' })

import Responses from '../modules/responses.js'
import Surveys from '../modules/surveys.js'

async function checkAuth(ctx, next) {
	if(ctx.hbs.authorised !== true) {
		ctx.session.error = 'You need to log in first!'
		return ctx.redirect('/login', ctx.hbs)
	}
	await next()
}

router.use(checkAuth)


router.get('/', async ctx => {
	try {
		await ctx.redirect('/', ctx.hbs)
	} catch(err) {
		ctx.session.error = err.message
		await ctx.redirect('/', ctx.hbs)
	}
})

router.get('/:surveyid', async ctx => {
	if (isNaN(ctx.params.surveyid)) {
		return ctx.redirect('/')
	}
	ctx.hbs.name = ctx.session.name
	ctx.hbs.username = ctx.session.username
	const surveyid = ctx.params.surveyid
	const responsesdb = await new Responses('db/northsea.db')
	const surveysdb = await new Surveys('db/northsea.db')
	const locs = await responsesdb.getLocations(surveyid)
	const newlocs = []
	for (const temploc in locs) {
		newlocs.push({lat: locs[temploc]['location'].split(', ')[1], lon: locs[temploc]['location'].split(', ')[0]})
	}
	ctx.hbs.responselocation = newlocs
	ctx.hbs.testName = await surveysdb.getSurveyName(surveyid)
	await ctx.render('map', ctx.hbs)
})

export default router
