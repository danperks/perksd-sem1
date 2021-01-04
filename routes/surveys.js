import Router from 'koa-router'
import bodyParser from 'koa-body'

const router = new Router({ prefix: '/survey' })
router.use(bodyParser({ multipart: true }))

async function checkAuth(ctx, next) {
	if(ctx.hbs.authorised !== true) {
		ctx.session.error = 'ERROR: You need to login to access this page...'
		return ctx.redirect('/login', ctx.hbs)
	}
	await next()
}

router.use(checkAuth)

import Surveys from '../modules/surveys.js'
import Questions from '../modules/questions.js'
import Responses from '../modules/responses.js'


/**
 * Redirect for empty survey URL
 *
 * @name Survey Redirect
 * @route {GET} /
 */
router.get('/', async ctx => {
	try {
		ctx.redirect('/')
	} catch (err) {
		await ctx.render('error', ctx.hbs)
	}
})

/**
 * Redirects to first question in survey url
 *
 * @name Survey Page
 * @route {GET} /
 */
router.get('/:surveyid', async ctx => {
	try {
		const surveyid = ctx.params.surveyid
		const surveryurl = `/survey/${surveyid}/1`
		console.log(`[SRV] Redirect to ${surveyid}/1`)
		ctx.redirect(surveryurl)
	} catch (err) {
		await ctx.render('error', ctx.hbs)
	}
})

/**
 * Redirects to question + 1
 *
 * @name Survey Page
 * @route {GET} /
 */
router.get('/:surveyid/r/:questid', async ctx => {
	try {
		const surveyid = ctx.params.surveyid
		const questid = (parseInt(ctx.params.questid, 10) + 1).toString()
		const surveryurl = `/survey/${surveyid}/${questid}`
		console.log(`[SRV] Redirect to ${surveyid}/1`)
		ctx.redirect(surveryurl)
	} catch (err) {
		await ctx.render('error', ctx.hbs)
	}
})

/**
 * Gets the requested question for survey
 *
 * @name Question Page
 * @route {GET} /
 */
router.get('/:surveyid/:questid', async ctx => {
	const surveysdb = await new Surveys('db/northsea.db')
	const questionsdb = await new Questions('db/northsea.db')
	const responsesdb = await new Responses('db/northsea.db')
	const status = await responsesdb.getStatus(ctx.session.username)
	const surveyid = ctx.params.surveyid
	const questid = ctx.params.questid
	if (status.indexOf(parseInt(surveyid).toString()) >= 0) {
		ctx.session.error = 'You have already completed this survey'
		ctx.redirect('/', ctx.hbs)
	}
	console.log(`[SRV] Getting survey ${surveyid}`)
	const quests = await questionsdb.getAll(surveyid)
	quests.sort((a,b) => { // needs sorting by questnun
		if(a.questnum< b.questnum) return -1
		if(a.questnum >b.questnum) return 1
		if(a.questnum< b.questnum) return -1
		if(a.questnum >b.questnum) return 1
		return 0
	  })
	ctx.hbs.questions = quests
	ctx.hbs.totalquests = ctx.hbs.questions.length
	if (ctx.hbs.totalquests < 1) {
		ctx.session.error = 'This survey does not exsist'
		ctx.redirect('/', ctx.hbs)
	} else if (questid.match(/^[0-9]+$/) === null) {
		await ctx.redirect(`/survey/${surveyid}/1`)
	} else if (parseInt(questid) < parseInt('1', 10)) {
		await ctx.redirect(`/survey/${surveyid}/1`)
	} else if (parseInt(questid) > parseInt(ctx.hbs.totalquests, 10)) {
		await ctx.redirect(`/survey/${surveyid}/${ctx.hbs.totalquests}`)
	} else {
		ctx.hbs.testName = await surveysdb.getSurveyName(surveyid)
		ctx.hbs.username = ctx.session.username
		ctx.hbs.name = ctx.session.name

		const embed = ctx.hbs.questions[questid - 1]['embed']

		if (embed === '') {
			ctx.hbs.isembed = false
			ctx.hbs.isyoutube = false
			ctx.hbs.youtube = ''
			ctx.hbs.isimage = false
			ctx.hbs.image = ''
		} else if (embed.indexOf('youtube') > '0') {
			ctx.hbs.isembed = true
			ctx.hbs.isyoutube = true
			ctx.hbs.youtube = embed.replace('/watch?v=','/embed/')
		} else {
			ctx.hbs.isembed = true
			ctx.hbs.isimage = true
			ctx.hbs.image = embed
		}

		ctx.hbs.surveyno = surveyid
		ctx.hbs.questno = questid
		ctx.hbs.responsetype = '1'
		// 0 is Single Input, 1 is Two Inputs, 2 is multiplechoice
		const intquestid = parseInt(questid)
		ctx.hbs.lastquest = intquestid - 1
		if (ctx.hbs.lastquest < 1) {
			ctx.hbs.islastquest = false
		} else {
			ctx.hbs.islastquest = true
		}
		ctx.hbs.nextquest = intquestid + 1
		if (ctx.hbs.nextquest > ctx.hbs.totalquests) {
			ctx.hbs.isnextquest = false
		} else {
			ctx.hbs.isnextquest = true
		}
		ctx.hbs.question = ctx.hbs.questions[questid - 1]['quest']
		const reptype = ctx.hbs.questions[questid - 1]['reptype']

		ctx.hbs.scresp = false
		ctx.hbs.dcresp = false
		ctx.hbs.mcresp = false
		ctx.hbs.default = false

		switch (reptype) {
			case '0':
				ctx.hbs.default = true
				break
			case '1':
				ctx.hbs.scresp = true
				break
			case '2':
				ctx.hbs.scresp = true
				ctx.hbs.dcresp = true
				break
			case '3':
				try {
					ctx.hbs.choices = JSON.parse(ctx.hbs.questions[questid - 1]['choices'])
				} catch(e) {
					console.log(e.message)
					ctx.hbs.choices = ['ERROR', 'ERROR']
				}
				console.log('ctx.hbs.choices', ctx.hbs.choices)
				ctx.hbs.mcresp = true
				ctx.hbs.twobutl = false
				ctx.hbs.twobutr = false
				const lenchoices = ctx.hbs.choices.length.toString()
				if (lenchoices === '3') {
					ctx.hbs.twobutl = true
				} else if (lenchoices === '4') {
					ctx.hbs.twobutl = true
					ctx.hbs.twobutr = true
				} else {
					ctx.hbs.twobutl = false
					ctx.hbs.twobutr = false
				}

		}
	}

	await ctx.render('survey', ctx.hbs)

})

export default router
