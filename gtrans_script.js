var gtrans = new Object()

gtrans.handleTranslate = function(text) {
	var translation = this.translate(text)
	var viewElem = this.createView(translation)
	this.cleanTranslationView()
	this.show(viewElem)
	this.playSound(text)
}

gtrans.playSound = function(text) {
	new Audio('https://translate.google.pl/translate_tts?q='+encodeURI(text)+'&tl=en').play()
}

gtrans.show = function(viewElem) {
	var body = document.getElementsByTagName("body")[0]
	body.appendChild(viewElem)
}

gtrans.createView = function(translation) {
	var container = document.createElement("div")
	container.className = "gtrans-view"
	
	if(translation.basic) {
		var elem = document.createElement("div")
		elem.className = "basic-tl"
		elem.innerText = translation.basic[0]
		container.appendChild(elem)
	}

	if(translation.advanced) translation.advanced.forEach(function(e) {
		var elem = document.createElement("div")
		elem.className = "part-of-speech"
 		elem.innerText = e[0]
 		container.appendChild(elem)
		
		e[1].forEach(function(f) {
			var elem = document.createElement("div")
			elem.className = "advanced-tl"
	 		elem.innerText = f 	
	 		container.appendChild(elem)	
			})
		})

	return container
}

gtrans.translate = function(text) {
	var translateUrl = 'https://translate.google.com/translate_a/single?client=t&sl=en&tl=pl&dt=bd&dt=t&q='

	var req = new XMLHttpRequest()
	req.open('GET', translateUrl + encodeURI(text), false)
	req.send()

	var respText = req.responseText
	var resp = JSON.parse(respText.replace(/,,+/g,',').replace(/\[,/g,'[').replace(/,\]/g,']'))
	
	var basicTl 
	var advancedTl

	switch(resp.length) {
	case 2:
		if(typeof(resp[0][0][1]) == typeof('')) basicTl = resp[0][0]
		else advancedTl = resp[1]
		break;
	case 3:
		basicTl = resp[0][0]
		advancedTl = resp[1]
		break;
	}

	var translation = {basic: basicTl, advanced: advancedTl}

	return translation
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
