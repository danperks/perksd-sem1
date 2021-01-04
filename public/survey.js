/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable max-lines */
/* eslint-disable max-statements */
/* eslint-disable complexity */
/* eslint-disable max-lines-per-function */
/* survey.js */

function setButtonunlocked(status) {
	if (status === true) {
		document.getElementById('donebut').disabled = false
		document.getElementById('donebut').classList.add('unlockedbut')
		document.getElementById('buticon').classList.add('unlocked')
		document.getElementById('buticon').classList.remove('typcn-lock-closed')
		document.getElementById('buticon').classList.add('typcn-tick')
		document.getElementById('buttxt').classList.add('unlocked')
		document.getElementById('buttxt').innerHTML = 'Click above to submit'
	} else if (status === false) {
		document.getElementById('donebut').disabled = true
		document.getElementById('donebut').classList.remove('unlockedbut')
		document.getElementById('buticon').classList.remove('unlocked')
		document.getElementById('buticon').classList.remove('typcn-tick')
		document.getElementById('buticon').classList.add('typcn-lock-closed')
		document.getElementById('buttxt').classList.remove('unlocked')
		document.getElementById('buttxt').innerHTML = 'Complete all the questions to submit'
	}
}

function setQuestionNum(quest) {
	document.getElementById('curquesttxt').innerHTML = quest
	quest = quest.split('/')
	const cur = quest[0]
	const tot = quest[1]
	const perc = cur / tot * '100'
	if (perc === Number('100')) {
		setButtonunlocked(true)
	} else {
		setButtonunlocked(false)
	}
	const oldnum = parseInt(document.getElementById('percentage').innerHTML.slice(0, -1), 10)
	const newnum = parseInt(perc, 10)
	animateValue(document.getElementById('percentage'), oldnum, newnum, '1000')
	document.getElementById('percircle').style.strokeDasharray = `${perc}, 100`
}

function animateValue(obj, start, end, duration) {
	let startTimestamp = null
	const step = (timestamp) => {
		if (!startTimestamp)
			startTimestamp = timestamp
		const progress = Math.min((timestamp - startTimestamp) / duration, 1)
		const newval = Math.floor(progress * (end - start) + start)
		obj.innerHTML = `${newval}%`
		if (progress < 1) {
			window.requestAnimationFrame(step)
		}
	}
	window.requestAnimationFrame(step)
}


function searchFilter() {
	// Declare variables
	let a, i, txtValue
	const filter = document.getElementById('searchBox').value.toUpperCase()
	const cards = document.getElementsByClassName('gridelem')

	// Loop through all list items, and hide those who don't match the search query
	for (i = 0; i < cards.length; i++) {
		a = cards[i].getElementsByTagName('h2')[0]
		txtValue = a.textContent || a.innerText
		if (txtValue.toUpperCase().indexOf(filter) > -1) {
			cards[i].style.display = ''
		} else {
			cards[i].style.display = 'none'
		}
	}
}

function checkResoltion() {
	if (window.screen.width < window.screen.height) {
		alert('This site is not supported on your device.\nPlease visit on a desktop or laptop to avoid issues.')
	}
}


function readAnswers(surveyid) {
	let old = null
	const cookies = document.cookie.split(';')
	for (const cookie in cookies) {
		if (cookies[cookie].trim().slice('0','6') === 'ans-_-') {
			old = -1
			if(cookies[cookie].trim().slice('6', parseInt('6') + surveyid.toString().length)) {
				old = JSON.parse(cookies[cookie].split('=')[1])
			}
		}
	}
	return old
}

function readAnswer(surveyid, questid) {
	const old = readAnswers(surveyid, questid)
	let ans = null
	if (old[questid]) {
		ans = old[questid]
	}
	return ans
}

function writeAnswer(surveyid, questid, answer) {
	let anscook = readAnswers(surveyid)
	if (anscook === null) {
		anscook = {}
	}
	anscook[questid] = answer
	const txtanswers = JSON.stringify(anscook)
	console.log(txtanswers)
	document.cookie = `ans-_-${surveyid}=${txtanswers};`
}

function loadAnswers(surveyid, questionid) {
	console.log('to be made')
}

function saveAndGoTo(surveyid, questid, url) {
	const inputnumcol = document.getElementsByTagName('input')
	const inputnum = Array.prototype.slice.call(inputnumcol)
	let typed = 0
	let radio = 0
	for (const num of inputnum) {
		if (num.type === 'text') {
			typed += 1
		} else if (num.type === 'radio') {
			radio += 1
		}
	}
	console.log(typed)
	let value1, value2
	switch(inputnum.length.toString()) {
		case '1':
			console.log('[LSJ] Page with 0 inputs checked?')
			return null
		case '2':
			console.log('1 input')
			const val = document.getElementById('ans1').value
			if (val) {
				value1 = val
			}
			break
		case '3':
			if (radio > typed) {
				console.log('2 radio')
				for (let i = 0; i < document.getElementsByTagName('input').length; i++) {
					if(document.getElementsByTagName('input')[i].checked) {
						value1 = document.getElementsByTagName('input')[i].parentElement.textContent.trim()
					}
				}
				break

			} else {
				console.log('2 inputs')
				value1 = document.getElementById('ans1').value
				value2 = document.getElementById('ans2').value
				if (!value1 || !value2) {
					console.log('e')
				}
			}
			break
		case '4':
			console.log('3 button')
			break
		case '5':
			console.log('four but')
			break
		case '6':
			console.log('default setup')
			for (let i = 0; i < document.getElementsByTagName('input').length; i++) {
				if(document.getElementsByTagName('input')[i].checked) {
					value1 = document.getElementsByTagName('input')[i].parentElement.textContent.trim()
				}
			}
			break
	}
	if (value2) {
		writeAnswer(surveyid, questid, [value1, value2])
	} else {
		if (value1) {
			writeAnswer(surveyid, questid, value1)
		}
	}
	if (url !== '') {
		window.location.href = url
	}
	return false
}

function getMyIp() {
	return fetch('https://api.ipify.org?format=json').then((response) => response.json())
}

async function getMyCoords() {
	const myCoords = async() => {
		const pos = await new Promise((resolve, reject) => {
			navigator.geolocation.getCurrentPosition(resolve, reject)
		})

		return `${pos.coords.longitude }, ${ pos.coords.latitude}`
	}
	return await myCoords()
}

async function sendData(surveyid, username, questid) {
	await saveAndGoTo(surveyid, questid, '')
	const data = await readAnswers(surveyid)
	const datatxt = await JSON.stringify(data)
	const clientip = await getMyIp()
	const location = await getMyCoords()
	const out = {'username': username, 'surveyid': surveyid, 'clientip': clientip['ip'],
	 'location': location, 'data': datatxt}
	const outtxt = await JSON.stringify(out)


	fetch('/api', {
		method: 'POST',
		body: outtxt
	  }).then(res => {
		if (res.redirected) {
			window.location.href = res.url
		}
	}
	)
}

function htmlDecode(input) {
	const e = document.createElement('textarea')
	e.innerHTML = input
	// handle case of empty input
	return e.childNodes.length === 0 ? '' : e.childNodes[0].nodeValue
}


const colours = ['#efaaa6', '#ed9973', '#f2bf67', '#cecd95', '#acccc5', '#b2c1cd', '#c8c3cf','#eac4b5','#dcd9cf']

function getCol() {
	let num = Math.round(Math.random() * colours.length) - 1
	if (num < 0) {
		num = 0
	} else if (num > colours.length) {
		num = colours.length
	}
	return colours[num]
}

function makeCharts(occurances) {
	const occur = JSON.parse(htmlDecode(occurances))
	const crts = document.getElementsByTagName('canvas')
	for (const crt in crts) {
		if (!isNaN(crt)) {
			new Chart(crts[crt].getContext('2d'), {
				type: 'bar',
				data: {
					labels: Object.keys(occur[crt]),
					datasets: [{
						data: Object.values(occur[crt]),
						backgroundColor: getCol,
					}]
				},
				options: {
					legend: {
						display: false
					  },
					responsive: false,
					scales: {
						yAxes: [{
							ticks: {
								beginAtZero: true
							}
						}]
					}
				}
			})
		}
	}
}

function connectSidebar() {
	listelems = document.getElementsByClassName('questitem')
	for (elem in listelems) {
		if (!isNaN(elem)) {
			console.log(elem)
			listelems[elem].childNodes[0].href = `#result${elem}`
		}
	}
}

checkResoltion()
