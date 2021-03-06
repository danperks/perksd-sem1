import Koa from 'koa'
import serve from 'koa-static'
import views from 'koa-views'
import session from 'koa-session'
import { openSync, closeSync, existsSync, mkdirSync } from 'fs'

import router from './routes/routes.js'

const app = new Koa()
app.keys = ['darkSecret']

if (!existsSync('db')) {
	mkdirSync('db')
}
closeSync(openSync('db/northsea.db', 'w'))

const defaultPort = 8080
const port = process.env.PORT || defaultPort

async function getHandlebarData(ctx, next) {
	console.log(`[SRV] ${ctx.method} - ${ctx.path}`)
	ctx.hbs = {
		authorised: ctx.session.authorised,
		host: `https://${ctx.host}`
	}
	for(const key in ctx.query) ctx.hbs[key] = ctx.query[key]
	await next()
}

app.use(serve('public'))
app.use(session(app))
app.use(views('views', { extension: 'handlebars' }, {map: { handlebars: 'handlebars' }}))

app.use(getHandlebarData)

app.use(router.routes())
app.use(router.allowedMethods())

app.use(function *() {
	this.redirect('/')
})

app.listen(port, async() => console.log(`\n-----------------\n\n[SRV] !!! Server Initalised on Port ${port} !!!`))
