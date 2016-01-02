var tkkCache = new Object()

tkkCache.getTkk = function() {
	if(!this._tkk) {
		var req = new XMLHttpRequest();
		req.open('GET', 'https://translate.google.pl/', false); 
		req.send(null);
		this._tkk = Number(req.response.match(/TKK='(\d+)'/)[1]);
	}
	return this._tkk;
}

tkkCache.getTkk();

var gtrans = new Object()

gtrans.handleTranslate = function(text) {
	var translation = this.translate(text)
	var viewElem = this.createView(translation)
	this.cleanTranslationView()
	this.show(viewElem)
	this.playSound(text)
}

gtrans.playSound = function(text) {
	var tkk = tkkCache.getTkk();
	var tk = this.genTk(text, tkk);
	new Audio(`https://translate.google.pl/translate_tts?tl=en&client=t&tk=${tk}&q=${encodeURI(text)}`).play()
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
		elem.innerText = translation.basic
		container.appendChild(elem)
	}

	if(translation.phonetic) {
		var elem = document.createElement("div")
		elem.className = "phonetic"
		elem.innerText = '♫ ' + translation.phonetic
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
	var tkk = tkkCache.getTkk();
	var tk = this.genTk(text, tkk);

	var translateUrl = `https://translate.google.com/translate_a/single` + 
			   `?client=t&sl=en&tl=pl&dt=bd&dt=t&dt=rm&tk=${tk}&q=${encodeURI(text)}`

	var req = new XMLHttpRequest()
	req.open('GET', translateUrl, false)
	req.send()

	var respText = req.responseText
	var resp = JSON.parse(respText.replace(/,,+/g,',').replace(/\[,/g,'[').replace(/,\]/g,']'))
	
	var basicTl 
	var advancedTl
	var phonetic

	switch(resp.length) {
	case 2:
		if(typeof(resp[0][0][1]) == typeof('')) basicTl = resp[0][0][0];
		else advancedTl = resp[1];
		break;
	case 3:
		basicTl = resp[0][0][0];
		advancedTl = resp[1];
		if(resp[0].length > 1) phonetic = resp[0][1][0];
		break;
	}

	var translation = {basic: basicTl, advanced: advancedTl, phonetic: phonetic}

	return translation
}

gtrans.cleanTranslationView = function() {
	views =	document.getElementsByClassName("gtrans-view")
	for (var i = 0; i < views.length; i++) views[i].remove()
}

gtrans.someTransform = function (someNum0, someStr) {
    for (var i = 0; i < someStr.length - 2; i += 3) {
        var someChar = someStr.charAt(i + 2);
        var someNum1 = someChar >= "a" ? someChar.charCodeAt(0) - 87 : Number(someChar);
        someNum1 = someStr.charAt(i + 1) == "+" ? someNum0 >>> someNum1 : someNum0 << someNum1;
        someNum0 = someStr.charAt(i) == "+" ? someNum0 + someNum1 & 4294967295 : someNum0 ^ someNum1;
    }
    return someNum0;
}

gtrans.genTk = function (text, tkk) {
    var someArr = [];
    for (var i = 0, j = 0; i < text.length; i++) {
        var charCode = text.charCodeAt(i);
        128 > charCode
            ? someArr[j++] = charCode
            : (2048 > charCode
            ? someArr[j++] = charCode >> 6 | 192
            : (55296 == (charCode & 64512) && i + 1 < text.length && 56320 == (text.charCodeAt(i + 1) & 64512)
            ? (charCode = 65536 + ((charCode & 1023) << 10) + (text.charCodeAt(++i) & 1023), someArr[j++] = charCode >> 18 | 240, someArr[j++] = charCode >> 12 & 63 | 128)
            : someArr[j++] = charCode >> 12 | 224, someArr[j++] = charCode >> 6 & 63 | 128), someArr[j++] = charCode & 63 | 128)
    }

    var someNum = tkk;
    for (i = 0; i < someArr.length; i++) {
        someNum += someArr[i];
        someNum = this.someTransform(someNum, "+-a^+6");
    }

    someNum = this.someTransform(someNum, "+-3^+b+-f");
    0 > someNum && (someNum = (someNum & 2147483647) + 2147483648);
    someNum %= 1E6;
    return someNum + "." + (someNum ^ tkk);
}

window.addEventListener("click", function() {
	gtrans.cleanTranslationView()
})

window.addEventListener("TRANSLATE", function(event) {
	gtrans.handleTranslate(event.detail.selectionText)
})
