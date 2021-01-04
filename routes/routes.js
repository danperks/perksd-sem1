
import Router from 'koa-router'

import publicRouter from './public.js'
import surveyRouter from'./surveys.js'
import mapRouter from'./map.js'
import resultRouter from'./results.js'

const mainRouter = new Router()

const nestedRoutes = [publicRouter, surveyRouter, mapRouter, resultRouter]
for (const router of nestedRoutes) {
	mainRouter.use(router.routes())
	mainRouter.use(router.allowedMethods())
}

export default mainRouter
