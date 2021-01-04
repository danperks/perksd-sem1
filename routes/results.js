/* eslint-disable max-lines-per-function */
/* eslint-disable complexity */
/* eslint-disable max-statements */
/* eslint-disable max-depth */

import Router from 'koa-router'

const router = new Router({ prefix: '/results' })

async function checkAuth(ctx, next) {
	if(ctx.hbs.authorised !== true) {
		ctx.session.error = 'You need to log in first!'
		return ctx.redirect('/login', ctx.hbs)
	}
	await next()
}

router.use(checkAuth)

import Responses from '../modules/responses.js'
import Surveys from '../modules/surveys.js'
import Questions from '../modules/questions.js'

router.get('/', async ctx => {
	try {
		ctx.redirect('/', ctx.hbs)
	} catch(err) {
		ctx.session.error = err.message
		ctx.redirect('/', ctx.hbs)
	}
})

router.get('/:surveyid', async ctx => {
	const responsesdb = await new Responses
	const surveysdb = await new Surveys
	const questionsdb = await new Questions

	const surveyid = ctx.params.surveyid
	const responses = await responsesdb.getResponses(surveyid)
	const sname = await surveysdb.getSurveyName(surveyid)
	const questions = await questionsdb.getAll(surveyid)
	ctx.hbs.name = ctx.session.name
	ctx.hbs.username = ctx.session.username
	ctx.hbs.testName = sname
	ctx.hbs.questions = questions
	const result = []
	const occurances = {}
	for (const quest in questions) {
		const answers = []
		for (const ans in responses) {
			if (responses[ans]['surveyid'] === surveyid) {
				if (responses[ans]['questionid'] === (parseInt(quest) + 1).toString()) {
					answers.push(responses[ans]['answer'])
				}
			}
		}
		const tempoccurs = {}
		for (let i = 0; i < answers.length; i++) {
			const num = answers[i]
			tempoccurs[num] = tempoccurs[num] ? tempoccurs[num] + 1 : 1
		}
		occurances[quest] = tempoccurs
		const com = answers.sort((a,b) => answers.filter(v => v===a).length- answers.filter(v => v===b).length).pop()
		const uni = answers.length + 1
		let iseven = false
		if (parseInt(quest) % parseInt('2') === 0) {
			iseven = true
		}
		const temp = {
			question: questions[quest]['quest'],
			common: com,
			unique: uni,
			out: [{entry: '1', amount: '4'}, {entry: '96', amount: '1'}],
			even: iseven
		}
		result.push(temp)
	}

	ctx.hbs.results = result
	ctx.hbs.occurances = JSON.stringify(occurances)

	await ctx.render('results', ctx.hbs)
})

export default router
