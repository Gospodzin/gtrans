var gtrans = new Object()

gtrans.handleTranslate = function(text) {
	var firstWord = text.trim().split(" ")[0].replace(/\W/g,"")
	var translations = this.translate(firstWord)
	var viewElem = this.createView(translations)
	this.cleanTranslationView()
	this.show(viewElem)
	this.playSound(firstWord)
}

gtrans.playSound = function(text) {
	new Audio('https://translate.google.pl/translate_tts?q='+encodeURI(text)+'&tl=en').play()
}

gtrans.show = function(viewElem) {
	viewElem.style.position = "fixed"
	viewElem.style.left = "10px"
	viewElem.style.top = "10px"
	viewElem.style.zIndex = 1<<10

	var body = document.getElementsByTagName("body")[0]
	body.appendChild(viewElem)
}

gtrans.createView = function(translations) {
	var container = document.createElement("div")
	container.className = "gtrans-view"
	translations.forEach(function(e) {
		var elem = document.createElement("div")
 		elem.innerText = e.word+" ["+e.freq+"]"
 		container.appendChild(elem)
		})
	return container
}

gtrans.translate = function(text) {
	var translateUrl = 'https://translate.google.com/translate_a/single?client=t&sl=en&tl=pl&dt=at&q='

	var req = new XMLHttpRequest()
	req.open('GET', translateUrl + encodeURI(text), false)
	req.send()

	var resp = req.responseText
	var cleanJson = resp.substr(10, resp.length-10-1)
	var translation = JSON.parse(cleanJson)[0]

	return translation[2].map(function(e){return {word: e[0], freq: e[1]}})
}

gtrans.cleanTranslationView = function() {
	views =	document.getElementsByClassName("gtrans-view")
	for (var i = 0; i < views.length; i++) views[i].remove()
}

window.addEventListener("click", function() {
	gtrans.cleanTranslationView()
})

window.addEventListener("TRANSLATE", function(event) {
	gtrans.handleTranslate(event.detail.selectionText)
})
