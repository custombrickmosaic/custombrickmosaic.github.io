
const previewImage = document.getElementById("previewImg");
var imageData = [];
var partList = [];
var finalMosaicIm = [];
var validImagePresent = false;
var imageFilename = "";


function init() {
	document.getElementById("buttonCalculate").disabled = true;
	document.getElementById("buttonDownloadPDF").disabled = true;
	
	document.getElementById("hueRange").value = 0;
	document.getElementById("saturationRange").value = 0;
	document.getElementById("valueRange").value = 0;
	document.getElementById("contrastRange").value = 0;
	document.getElementById("widthInputValue").value = 48;
	document.getElementById("heightInputValue").value = 48
	document.getElementById("inputBeatles").value = 0;
	document.getElementById("inputMonroe").value = 0;
	document.getElementById("inputIronMan").value = 0;
	document.getElementById("inputSith").value = 0;
	document.getElementById("inputHogwarts").value = 0;
	document.getElementById("inputMickey").value = 0;
	document.getElementById("inputPortrait").value = 0;
	document.getElementById("inputWorld").value = 0;
	document.getElementById("inputArtProject").value = 0;

	var numReqParts = document.getElementById("heightInputValue").value * document.getElementById("widthInputValue").value;
	document.getElementById("requiredPartsString").innerHTML = `Required parts: ${numReqParts}`;

	var thumbnailCanvas = document.getElementById('thumbnailCanvas');
	thumbnailCanvas.height = thumbnailCanvas.width * document.getElementById("heightInputValue").value / document.getElementById("widthInputValue").value;
};
init();



document.getElementById("imageFile").addEventListener("change", function() {

	validImagePresent = false;
	if(this.files.length > 0 && this.files[0].type.match(/image.*/)) {
		var reader = new FileReader();
		reader.onload = function()
		{
			previewImage.src = reader.result;
			
			previewImage.decode()
				.then(() => {
					
					drawPreviewImage(true);
					
					document.getElementById("imageAdjustmentsRow").hidden = false;
					document.getElementById("buttonDownloadPDF").disabled = true;
					
					validImagePresent = true;
					if ((document.getElementById("widthInputValue").value * document.getElementById("heightInputValue").value) <= updatePartList()) {
						document.getElementById("buttonCalculate").disabled = false;
					} else {
						document.getElementById("buttonCalculate").disabled = true;
					}
				})
				.catch((encodingError) => {
					console.log(encodingError);
					document.getElementById("imageAdjustmentsRow").hidden = true;
					document.getElementById("buttonCalculate").disabled = true;
					document.getElementById("buttonDownloadPDF").disabled = true;
				})
		}
		reader.readAsDataURL(this.files[0]);
		imageFilename = this.files[0].name;
		console.log(imageFilename);
			
	} else {
		previewImage.setAttribute("src", "");
		imageFilename = "";
		previewImage.style.display = null;

        document.getElementById("imageAdjustmentsRow").hidden = true;
        document.getElementById("buttonCalculate").disabled = true;
		document.getElementById("buttonDownloadPDF").disabled = true;

        if (this.files[0]) {
            alert('The file you selected is not a valid image file');
        }
	}
	
	// Reset canvas
	var canvas = document.getElementById("previewMosaicCanvas");
	var context = canvas.getContext('2d');
	context.clearRect(0, 0, canvas.width, canvas.height); //clear html5 canvas
})




document.getElementById("buttonCalculate").addEventListener("click", async () => {
	await drawPreviewImage(false); // remove red stripes if "ignore black regions"
	var thumbnailCanvas = document.getElementById('thumbnailCanvas');
	
	var resizeCanvas = document.createElement('canvas');
	resizeCanvas.width = document.getElementById("widthInputValue").value;
	resizeCanvas.height = document.getElementById("heightInputValue").value;
	resizeContext = resizeCanvas.getContext('2d');
	
	resizeContext.drawImage(thumbnailCanvas, 0, 0, resizeCanvas.width, resizeCanvas.height);
	resizeContext = resizeCanvas.getContext('2d');
	
	await drawPreviewImage(true);
	
	imageData = resizeContext.getImageData(0, 0, resizeCanvas.width, resizeCanvas.height);
	generateValidColoringAndDraw();
    
})



document.getElementById("buttonDownloadPDF")
    .addEventListener("click", async () => {
        await generateInstructions();
    });
	
document.getElementById("widthInputValue").addEventListener('change', async () => {
	const widthInput = document.getElementById("widthInputValue");
	widthInput.value = Math.max(1,Math.min(200, Number(widthInput.value))).toString();
	
	var numReqParts = widthInput.value * document.getElementById("heightInputValue").value;
	document.getElementById("requiredPartsString").innerHTML = `Required parts: ${numReqParts}`;
	
	var thumbnailCanvas = document.getElementById('thumbnailCanvas')
	thumbnailCanvas.height = thumbnailCanvas.width * document.getElementById("heightInputValue").value / widthInput.value;
	
	var partCount = updatePartList();
	if (validImagePresent && (numReqParts <= partCount)) {
		document.getElementById("buttonCalculate").disabled = false;
	} else {
		document.getElementById("buttonCalculate").disabled = true;
	}
	if (numReqParts <= partCount) {
		document.getElementById("availablePartsString").innerHTML = `Available parts: ${partCount}`;
	} else {
		document.getElementById("availablePartsString").innerHTML = `Available parts: <span style="color:red; font-weight:bold;">${partCount}</span>`;
	}
	
	await drawPreviewImage(true);
})


document.getElementById("heightInputValue").addEventListener('change', async () => {
	const heightInput = document.getElementById("heightInputValue");
	heightInput.value = Math.max(1,Math.min(200, Number(heightInput.value))).toString();
	
	var numReqParts = document.getElementById("widthInputValue").value * heightInput.value;
	document.getElementById("requiredPartsString").innerHTML = `Required parts: ${numReqParts}`;
	
	var thumbnailCanvas = document.getElementById('thumbnailCanvas')
	thumbnailCanvas.height = thumbnailCanvas.width * heightInput.value / document.getElementById("widthInputValue").value;
	
	var partCount = updatePartList();
	if (validImagePresent && (numReqParts <= partCount)) {
		document.getElementById("buttonCalculate").disabled = false;
	} else {
		document.getElementById("buttonCalculate").disabled = true;
	}
	if (numReqParts <= partCount) {
		document.getElementById("availablePartsString").innerHTML = `Available parts: ${partCount}`;
	} else {
		document.getElementById("availablePartsString").innerHTML = `Available parts: <span style="color:red; font-weight:bold;">${partCount}</span>`;
	}
	
	await drawPreviewImage(true);
})



var myPartButtonGroup = document.getElementsByClassName("btn btn-secondary py-0")
for (var i = 0; i < myPartButtonGroup.length; i++) {
	if (myPartButtonGroup[i].id.includes('Minus') || myPartButtonGroup[i].id.includes('Plus')) {
		myPartButtonGroup[i].addEventListener('click', function () {
			if (this.id.includes('Minus')) {
				var myInputForm = document.getElementById(`input${this.id.substring(11,this.id.length)}`);
			} else {
				var myInputForm = document.getElementById(`input${this.id.substring(10,this.id.length)}`);
			}
			myInputForm.value = Math.max(0, Number(myInputForm.value) + 1 - 2*this.id.includes('Minus')).toString();
			
			var partCount = updatePartList();
			
			if (validImagePresent && ((document.getElementById("widthInputValue").value * document.getElementById("heightInputValue").value) <= partCount)) {
				document.getElementById("buttonCalculate").disabled = false;
			} else {
				document.getElementById("buttonCalculate").disabled = true;
			}
			if ((document.getElementById("widthInputValue").value * document.getElementById("heightInputValue").value) <= partCount) {
				document.getElementById("availablePartsString").innerHTML = `Available parts: ${partCount}`;
			} else {
				document.getElementById("availablePartsString").innerHTML = `Available parts: <span style="color:red; font-weight:bold;">${partCount}</span>`;
			}
		})
		// also add a callback to the input field itself
		if (myPartButtonGroup[i].id.includes('Minus')) {
			document.getElementById(myPartButtonGroup[i].id.replace('buttonMinus', 'input')).addEventListener('click', function () {
				var partCount = updatePartList();
				
				if (validImagePresent && ((document.getElementById("widthInputValue").value * document.getElementById("heightInputValue").value) <= partCount)) {
					document.getElementById("buttonCalculate").disabled = false;
				} else {
					document.getElementById("buttonCalculate").disabled = true;
				}
				if ((document.getElementById("widthInputValue").value * document.getElementById("heightInputValue").value) <= partCount) {
					document.getElementById("availablePartsString").innerHTML = `Available parts: ${partCount}`;
				} else {
					document.getElementById("availablePartsString").innerHTML = `Available parts: <span style="color:red; font-weight:bold;">${partCount}</span>`;
				}
			})
		}
	}
}

document.getElementById("buttonPlusWidth")
    .addEventListener("click", function () {
		var myInputForm = document.getElementById("widthInputValue");
		myInputForm.value = Math.min(200, Number(myInputForm.value) + 1).toString();
		myInputForm.dispatchEvent(new Event('change'));
	});

document.getElementById("buttonMinusWidth")
    .addEventListener("click", function () {
		var myInputForm = document.getElementById("widthInputValue");
		myInputForm.value = Math.max(1, Number(myInputForm.value) - 1).toString();
		myInputForm.dispatchEvent(new Event('change'));
	});
	
document.getElementById("buttonPlusHeight")
    .addEventListener("click", function () {
		var myInputForm = document.getElementById("heightInputValue");
		myInputForm.value = Math.min(200, Number(myInputForm.value) + 1).toString();
		myInputForm.dispatchEvent(new Event('change'));
	});

document.getElementById("buttonMinusHeight")
    .addEventListener("click", function () {
		var myInputForm = document.getElementById("heightInputValue");
		myInputForm.value = Math.max(1, Number(myInputForm.value) - 1).toString();
		myInputForm.dispatchEvent(new Event('change'));
	});

document.getElementById("cropCenterSquareButton")
    .addEventListener("click", async () => {
        document.getElementById("scaleToSquareButton").classList.remove('active');
		document.getElementById("cropCenterSquareButton").classList.add('active');
		await drawPreviewImage(true);
    });
	
document.getElementById("scaleToSquareButton")
    .addEventListener("click", async () => {
        document.getElementById("cropCenterSquareButton").classList.remove('active');
		document.getElementById("scaleToSquareButton").classList.add('active');
		await drawPreviewImage(true);
    });



document.getElementById("saturationRange")
	.addEventListener("change", async () => {
		const saturationValue = document.getElementById("saturationRange").value;
        document.getElementById("saturationRangeLabel").innerHTML = `Saturation: ${saturationValue}`;
        await drawPreviewImage(true);
    },
    false
);


document.getElementById("hueRange")
	.addEventListener("change", async () => {
		const hueValue = document.getElementById("hueRange").value;
        document.getElementById("hueRangeLabel").innerHTML = `Hue: ${hueValue}`;
        await drawPreviewImage(true);
    },
    false
);


document.getElementById("valueRange")
	.addEventListener("change", async () => {
		const valueValue = document.getElementById("valueRange").value;
        document.getElementById("valueRangeLabel").innerHTML = `Value: ${valueValue}`;
        await drawPreviewImage(true);
    },
    false
);


document.getElementById("contrastRange")
	.addEventListener("change", async () => {
		const contrastValue = document.getElementById("contrastRange").value;
        document.getElementById("contrastRangeLabel").innerHTML = `Contrast: ${contrastValue}`;
        await drawPreviewImage(true);
    },
    false
);


document.getElementById("ignoreBlackCheck")
	.addEventListener("change", async () => {
		await drawPreviewImage(true);
		updatePartList();
    },
    false
);



function rgb2hsv(r, g, b) {
	// r,g,b in [0,255], out: h in [0,360) and s,v in [0,1]
	r = r/255;
	g = g/255;
	b = b/255;
    let v = Math.max(r, g, b),
        n = v - Math.min(r, g, b);
    let h =
        n &&
        (v == r ? (g - b) / n : v == g ? 2 + (b - r) / n : 4 + (r - g) / n);
    return [60 * (h < 0 ? h + 6 : h), v && n / v, v];
}


function hsv2rgb(h, s, v) {
	// h in [0,360] and s,v in [0,1] - r,g,b in [0,255]
    let f = (n, k = (n + h / 60) % 6) =>
        v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    return [Math.round(f(5)*255), Math.round(f(3)*255), Math.round(f(1)*255)];
}



function adjustImageHSV(imgData, rawPixels, h, s, v) {  //h [0,360], s, v [-1,1]
	var ignoreBlack = document.getElementById("ignoreBlackCheck").checked;
	
    for(var i=0; i<imgData.data.length; i+=4){   //r,g,b,a
		if (ignoreBlack && rawPixels[i] == 0 && rawPixels[i+1] == 0 && rawPixels[i+2] == 0){
		} else {
			const HSV = rgb2hsv(imgData.data[i], imgData.data[i+1], imgData.data[i+2]);
			const newH = (HSV[0] + Math.round(h)) % 360;
			const newS = Math.min(Math.max(HSV[1] + s, 0), 1);
			const newV = Math.min(Math.max(HSV[2] + v, 0), 1);
			const RGB = hsv2rgb(newH, newS, newV);
			imgData.data[i]   = RGB[0];
			imgData.data[i+1] = RGB[1];
			imgData.data[i+2] = RGB[2];
		}
    }
    return imgData;
}


function adjustImageContrast(imgData, rawPixels, contrast) {  //input range [-100,100]
    var ignoreBlack = document.getElementById("ignoreBlackCheck").checked;
	
    contrast = (contrast/100) + 1;  //convert to decimal & shift range: [0..2]
    var intercept = 128 * (1 - contrast);
    for(var i=0; i<imgData.data.length; i+=4){   //r,g,b,a
        if (ignoreBlack && rawPixels[i] == 0 && rawPixels[i+1] == 0 && rawPixels[i+2] == 0){
		} else {
			imgData.data[i]   = imgData.data[i]   * contrast + intercept;
			imgData.data[i+1] = imgData.data[i+1] * contrast + intercept;
			imgData.data[i+2] = imgData.data[i+2] * contrast + intercept;
		}
    }
    return imgData;
}


function drawIgnoredRegions(imgData, rawPixels) {
    var ignoreBlack = document.getElementById("ignoreBlackCheck").checked;
	
    for(var i=0; i<imgData.data.length; i+=4){   //r,g,b,a
        if (ignoreBlack && rawPixels[i] == 0 && rawPixels[i+1] == 0 && rawPixels[i+2] == 0 && ((i/4) % (imgData.width - 1) % 9) < 3){
			imgData.data[i] = 255;
		}
    }
    return imgData;
}


async function drawPreviewImage (drawIgnored) { //hsvChanged, contrastChanged
	const hueValue = document.getElementById("hueRange").value;
	const saturationValue = document.getElementById("saturationRange").value;
	const valueValue = document.getElementById("valueRange").value;
	const contrastValue = document.getElementById("contrastRange").value;
	const intermediateSize = 200;
	
	var tmpCanvas = document.createElement('canvas');
	tmpCanvas.width = intermediateSize;
	tmpCanvas.height = intermediateSize * previewImage.height/previewImage.width;
	
	const context = tmpCanvas.getContext("2d");
	context.drawImage(previewImage, 0, 0, previewImage.width, previewImage.height, 0, 0, tmpCanvas.width, tmpCanvas.height);
	var pixels = context.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height).data;
	
	var imgData = context.createImageData(tmpCanvas.width, tmpCanvas.height);
	Object.keys(pixels).forEach(pixel => {
		imgData.data[pixel] = pixels[pixel];
	});
	
	if ((hueValue != 0) || (saturationValue != 0) || (valueValue != 0) || (contrastValue != 0)) {
		imgData = adjustImageHSV(imgData, pixels, hueValue, saturationValue/100, valueValue/100);
		
		imgData = adjustImageContrast(imgData, pixels, contrastValue);
	}
	
	if (drawIgnored) {
		imgData = drawIgnoredRegions(imgData, pixels);
	}
	
	context.putImageData(imgData, 0, 0);
	
	var dataURL = tmpCanvas.toDataURL();
	tmpImage = new Image(tmpCanvas.width, tmpCanvas.height);
	tmpImage.src = dataURL;
	
	await tmpImage.decode()
	
	var thumbnailCanvas = document.getElementById('thumbnailCanvas');
	var thumbnailContext = thumbnailCanvas.getContext('2d');
	
	if (document.getElementById('cropCenterSquareButton').classList.value.includes("active")) {
		thumbnailContext.drawImage(tmpImage, 
						Math.max(0,(tmpImage.width-tmpImage.height/thumbnailCanvas.height*thumbnailCanvas.width)/2),
						Math.max(0,(tmpImage.height-tmpImage.width/thumbnailCanvas.width*thumbnailCanvas.height)/2),
						tmpImage.width - Math.max(0,(tmpImage.width-tmpImage.height/thumbnailCanvas.height*thumbnailCanvas.width)),
						tmpImage.height - Math.max(0,(tmpImage.height-tmpImage.width/thumbnailCanvas.width*thumbnailCanvas.height)),
						0, 0,
						thumbnailCanvas.width, thumbnailCanvas.height);
	} else {
		thumbnailContext.drawImage(tmpImage, 
						0, 0,
						tmpImage.width, tmpImage.height,
						0, 0,
						thumbnailCanvas.width, thumbnailCanvas.height);
	}
	
}


var drawMosaic = function (im) {
	
    width = im.length;
	height = im[0].length;
	
    var canvas = document.getElementById("previewMosaicCanvas")
    var context = canvas.getContext("2d");

    canvas.width = width*30;
    canvas.height = height*30;

    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
			if (im[x][y][4] != 3) {
				var red = im[x][y][0];
				var green = im[x][y][1];
				var blue = im[x][y][2];

				var centerX = (x+0.5) * canvas.width / (width);
				var centerY = (y+0.5) * canvas.height / (height);
				var radius = canvas.width / (width+1)/2.1;

				context.strokeStyle = rgbToHex(`(0,0,0)`);
				context.fillStyle = rgbToHex(`(${red},${green},${blue})`);
				context.beginPath();
				if (im[x][y][4] == 3024) {
					context.rect(centerX-radius, centerY-radius, 2*radius, 2*radius);
				} else {
					context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
				}
				context.closePath();
				context.fill();
				if (im[x][y][4] == 3024 || im[x][y][4] == 6141) {
					context.beginPath();
					contrastRGB = getContrastColor(red, green, blue);
					context.strokeStyle = rgbToHex(`(${contrastRGB[0]},${contrastRGB[1]},${contrastRGB[2]})`);
					context.arc(centerX, centerY, radius*0.6, 0, 2 * Math.PI, false);
					context.closePath();
					context.stroke();
				}
			} else {
				// Ignored part
				var startX = x * canvas.width / (width);
				var startY = (y+1) * canvas.height / (height);
				var endX = (x+1) * canvas.width / (width);
				var endY = y * canvas.height / (height);
				context.strokeStyle = rgbToHex(`(255,0,0)`);
				context.lineWidth = 3;
				context.beginPath();
				context.moveTo(startX, startY);
				context.lineTo(endX, endY);
				context.closePath();
				context.stroke();
				context.lineWidth = 1;
			}
        }
    }

    context.fillStyle = "black";
    context.globalCompositeOperation = 'destination-over'
    context.fillRect(0, 0, canvas.width, canvas.height);
}


function rgbToHex(rgb) {
    var a = rgb.split("(")[1].split(")")[0].split(",");
    return "#" + a.map(function(x) {
      x = parseInt(x).toString(16);
      return (x.length == 1) ? "0"+x : x;
    }).join("");
  }


var getPartListOfOneSet = function (id) {
    switch (id) {
        case "Beatles":
            var partList = [
                [5, 19, 29, 710, 98138, 6284070], // r, g, b, count, type (98138 = tile, 6141 = stud, 3024 = 1x1 plate), element_id
				[255, 255, 255, 157, 98138, 6284572],
				[228, 205, 158, 288, 98138, 6284573],
				[254, 138, 24, 76, 98138, 6284582],
				[149, 138, 115, 144, 98138, 6322841],
				[88, 42, 18, 255, 98138, 6284586],
				[160, 165, 169, 53, 98138, 6284071],
				[108, 110, 104, 152, 98138, 6284596],
				[204, 112, 42, 30, 98138, 6284589],
				[248, 187, 61, 66, 98138, 6322822],
				[159, 195, 233, 58, 98138, 6322823],
				[10, 52, 99, 123, 98138, 6284584],
				[53, 33, 0, 560, 98138, 6322813],
				[96, 116, 161, 53, 98138, 6322842],
				[169, 85, 0, 87, 98138, 6322840]
				];
            return partList;
        case "Monroe":
            var partList = [
                [5, 19, 29, 629, 98138, 6284070],
				[200, 112, 160, 587, 98138, 6322821],
				[242, 205, 55, 587, 98138, 6284577],
				[146, 57, 120, 46, 98138, 6322816],
				[228, 173, 200, 587, 98138, 6284587],
				[108, 110, 104, 131, 98138, 6284596],
				[54, 174, 191, 587, 98138, 6322819]
				];
            return partList;
        case "IronMan":
            var partList = [
				[5, 19, 29, 476, 6141, 614126],
				[201, 26, 9, 308, 6141, 614121],
				[255, 255, 255, 61, 6141, 614101],
				[228, 205, 158, 155, 6141, 4161734],
				[149, 138, 115, 97, 6141, 6315781],
				[88, 42, 18, 191, 6141, 4216581],
				[160, 165, 169, 31, 6141, 4211525],
				[108, 110, 104, 91, 6141, 4210633],
				[204, 112, 42, 208, 6141, 6167641],
				[10, 52, 99, 529, 6141, 6021623],
				[170, 127, 46, 232, 6141, 4523159],
				[53, 33, 0, 196, 6141, 6315780],
				[114, 14, 15, 214, 6141, 6314247],
				[96, 116, 161, 23, 6141, 6315783],
				[169, 85, 0, 162, 6141, 6315782]
				];
            return partList;
		case "Sith":
            var partList = [
				[5, 19, 29, 897, 6141, 614126],
				[201, 26, 9, 292, 6141, 614121],
				[255, 255, 255, 195, 6141, 614101],
				[254, 138, 24, 127, 6141, 4157103],
				[160, 165, 169, 112, 6141, 4211525],
				[108, 110, 104, 162, 6141, 4210633],
				[87, 88, 87, 271, 6141, 6038201],
				[255, 240, 58, 94, 6141, 6319958],
				[10, 52, 99, 450, 6141, 6021623],
				[53, 33, 0, 212, 6141, 6315780],
				[114, 14, 15, 334, 6141, 6314247],
				[96, 116, 161, 145, 6141, 6315783]
				];
			return partList;
		case "Hogwarts":
            var partList = [
				[5, 19, 29, 593, 6141, 614126],
				[0, 85, 191, 431, 6141, 614123],
				[35, 120, 65, 499, 6141, 4569058],
				[201, 26, 9, 15, 6141, 614121],
				[75, 159, 74, 4, 6141, 6109808],
				[255, 255, 255, 369, 6141, 614101],
				[160, 165, 169, 236, 6141, 4211525],
				[87, 88, 87, 153, 6141, 6038201],
				[137, 135, 136, 630, 6141, 4633691],
				[170, 127, 46, 604, 6141, 4523159],
				[114, 14, 15, 503, 6141, 6314247],
				[54, 174, 191, 10, 6141, 6102986]
				];
			return partList;
		case "Portrait":
            var partList = [
				[5, 19, 29, 900, 3024, 302426],
				[242, 205, 55, 900, 3024, 302424],
				[255, 255, 255, 900, 3024, 302401],
				[160, 165, 169, 900, 3024, 4211399],
				[108, 110, 104, 900, 3024, 4210719]
				];
			return partList;
		case "Mickey":
            var partList = [
				[5, 19, 29, 662, 98138, 6284070],
				[201, 26, 9, 213, 98138, 6284574],
				[255, 255, 255, 835, 98138, 6284572],
				[228, 205, 158, 32, 98138, 6284573],
				[160, 165, 169, 59, 98138, 6284071],
				[108, 110, 104, 79, 98138, 6284596],
				[10, 52, 99, 409, 98138, 6284584],
				[53, 33, 0, 76, 98138, 6322813],
				[114, 14, 15, 96, 98138, 6284585]
				];
			return partList;
		case "World":
            var partList = [
				[255, 255, 255, 3064, 6141, 614101],
				[0, 143, 155, 1879, 98138, 6311437],
				[75, 159, 74, 601, 98138, 6353793],
				[228, 205, 158, 725, 98138, 6284573],
				[254, 138, 24, 601, 98138, 6284582],
				[187, 233, 11, 1060, 98138, 6284583],
				[248, 187, 61, 599, 98138, 6322822],
				[10, 52, 99, 393, 98138, 6284584],
				[54, 174, 191, 1607, 98138, 6322819],
				[255, 105, 143, 601, 98138, 6311436]
				];
			return partList;
		case "ArtProject":
            var partList = [
				[5, 19, 29, 268, 98138, 6284070],
				[201, 26, 9, 198, 98138, 6284574],
				[75, 159, 74, 155, 98138, 6353793],
				[242, 205, 55, 317, 98138, 6284577],
				[255, 255, 255, 495, 98138, 6284572],
				[228, 205, 158, 257, 98138, 6284573],
				[254, 138, 24, 142, 98138, 6284582],
				[187, 233, 11, 176, 98138, 6284583],
				[228, 173, 200, 60, 98138, 6284587],
				[88, 42, 18, 322, 98138, 6284586],
				[204, 112, 42, 296, 98138, 6284589],
				[248, 187, 61, 175, 98138, 6322822],
				[255, 240, 58, 122, 98138, 6343806],
				[10, 52, 99, 690, 98138, 6284584],
				[7, 139, 201, 130, 98138, 6322824],
				[173, 195, 192, 331, 98138, 6322818]
				];
			return partList;

        default:
            console.log("unknown");
            break;
      }
}


var updatePartList = function () {
	var totalCount = 0;
	fullPartList = [];
	for (var i = 0; i < myPartButtonGroup.length; i+=2) {
		var setName = myPartButtonGroup[i].id.substring(11,myPartButtonGroup[i].id.length);
		var multiplier = Number(document.getElementById(`input${setName}`).value);
		
		var partList = getPartListOfOneSet(setName);
		// Adjust number of parts in partList
		for (var col = 0; col < partList.length; col++) {
			partList[col][3] = Math.floor(partList[col][3] * multiplier); // floor in case of non-integer multiplier
			totalCount += partList[col][3];
		}
		
		if (fullPartList.length == 0) {
			if (multiplier > 0) {
				fullPartList = partList;
			}
		} else {
			for (var col1 = 0; col1 < partList.length; col1++) {
				if (partList[col1][3] > 0) {
					var alreadyPresent = false;
					for (var col2 = 0; col2 < fullPartList.length; col2++) {
						if ((fullPartList[col2][0] == partList[col1][0]) && (fullPartList[col2][1] == partList[col1][1]) && (fullPartList[col2][2] == partList[col1][2]) && (fullPartList[col2][5] == partList[col1][5])) {
							alreadyPresent = true;
							fullPartList[col2][3] = fullPartList[col2][3] + partList[col1][3];
						}
					}
					if (!alreadyPresent) {
						fullPartList.push(partList[col1]);
					}
				}
			}
		}
	}
	
	const ignoreBlack = document.getElementById("ignoreBlackCheck").checked;
	if (ignoreBlack) {
		// add extra color to encode ignored regions
		fullPartList.push([0, 0, 0, 1000000, 3]); // 1000000 is big enough to be unlimited
	}
	
	return totalCount;
}



const generateValidColoringAndDraw = async () => {
    const im = await generateValidColoring();
	if (im === undefined) {
		return
	}
	console.log('coloring done -> drawing')
    finalMosaicIm = im;
	drawMosaic(im);
	await sleep(50);
	document.getElementById("buttonDownloadPDF").disabled = false;
}



async function generateValidColoring () {
	
	document.getElementById("calculate-progress-bar").style.width = "5%";
	document.getElementById("calculate-progress-container").hidden = false;
	document.getElementById("buttonCalculate").hidden = true;
	await sleep(5);
	
	var colorList = JSON.parse(JSON.stringify(fullPartList)); // bad way to do a deep copy, but it works
	var colorList2 = JSON.parse(JSON.stringify(fullPartList)); // bad way to do a deep copy, but it works

	var limitedParts = true;
	
	// We need to get the raw pixels if we want to exclude black regions
	const ignoreBlack = document.getElementById("ignoreBlackCheck").checked;
	if (ignoreBlack) {
		var tmpCanvas = document.createElement('canvas');
		tmpCanvas.width = imageData.width;
		tmpCanvas.height = imageData.height;
		const context = tmpCanvas.getContext("2d");
		context.drawImage(previewImage, 0, 0, previewImage.width, previewImage.height, 0, 0, imageData.width, imageData.height);
		var rawPixels = context.getImageData(0, 0, imageData.width, imageData.height).data;
	}
	
	
	// Calculate distance of all pixels to all colors
	// Add a bit of randomness into color for jittering
	var pxCount = 0;
	var distMat = createArray(imageData.width, imageData.height, colorList.length);
	var outIm = createArray(imageData.width, imageData.height, 5);
	var outCol = createArray(imageData.width, imageData.height);

	console.log('starting coloring');
	var allBlack = true;
	for (var x = 0; x < imageData.width; x++) {
        for (var y = 0; y < imageData.height; y++) {
			var index = (y*imageData.width + x) * 4;
            var red = imageData.data[index] + Math.random()*3-1.5;
            var green = imageData.data[index + 1] + Math.random()*3-1.5;
            var blue = imageData.data[index + 2] + Math.random()*3-1.5;
			
			if (imageData.data[index] != 0 || imageData.data[index + 1] != 0 || imageData.data[index + 2] != 0) {
				allBlack = false
			}
			
			if (ignoreBlack && rawPixels[index] == 0 && rawPixels[index + 1] == 0 && rawPixels[index + 2] == 0) {
				// Ignore pixel -> set all distances to Inf, the last color is the ignore flag
				for (var col = 0; col < colorList.length-1; col++) {
					distMat[x][y][col] = 3*256*256;
				}
				distMat[x][y][colorList.length-1] = 0;
			} else {
				// Calculate distance of pixel color to each color in the list
				for (var col = 0; col < colorList.length; col++) {
					distMat[x][y][col] = Math.pow(red-colorList[col][0], 2) + Math.pow(green-colorList[col][1], 2) + Math.pow(blue-colorList[col][2], 2);
					//distMat[x][y][col] = deltaE(rgb2lab([red, green, blue]), rgb2lab(colorList[col].slice(0,3)));
				}
				if (ignoreBlack) {
					distMat[x][y][colorList.length-1] = 3*256*256; // Do not use the ignore flag
				}
			}
		}
	}
	
	if (allBlack) {
		alert('Oops! Something went wrong while decoding the image. Please start again from step 1.');
		document.getElementById("calculate-progress-container").hidden = true;
		document.getElementById("buttonCalculate").hidden = false;
		return;
	}
	
	document.getElementById("calculate-progress-bar").style.width = "15%";
	document.getElementById("calculate-progress-bar").innerHTML = "Initial guess";
	await sleep(5);
	
	// Deep copy distMat
	var distMatOrig = JSON.parse(JSON.stringify(distMat));
	
	var keepRunning = true;
	while (keepRunning) {
		// Get next best brick to place with minimal dist
		var bestDist = Infinity;
		var bestX = -1;
		var bestY = -1;
		var bestCol = -1;
		for (var x = 0; x < imageData.width; x++) {
			for (var y = 0; y < imageData.height; y++) {
				for (var col = 0; col < colorList.length; col++) {
					if (distMat[x][y][col] < bestDist && ((colorList[col][3] > 0) || !limitedParts)) { // check that best color is still available
						bestDist = distMat[x][y][col];
						bestX = x;
						bestY = y;
						bestCol = col;
					}
				}
			}
		}
		
		// place part
		outCol[bestX][bestY] = bestCol;
		
		for (var col = 0; col < colorList.length; col++) { // this x,y pos is filled now
			distMat[bestX][bestY][col] = Infinity;
		}
		
		// Reduce count of that color in pool
		if (limitedParts) {
			colorList[bestCol][3] = colorList[bestCol][3] - 1;
		}
		
		// Exit while loop if every pixel is filled
		pxCount = pxCount + 1;
		if (pxCount == (imageData.width * imageData.height)) {
			keepRunning = false;
		}
		
		if (pxCount % 200 == 0) {
			document.getElementById("calculate-progress-bar").style.width = `${15+20*pxCount/(imageData.width*imageData.height)}%`;
			await sleep(5);
		}
	}
	
	/*outCol2 = JSON.parse(JSON.stringify(outCol));
	var finalDist = 0;
	for (var x = 0; x < imageData.width; x++) {
        for (var y = 0; y < imageData.height; y++) {
			for (var col = 0; col < colorList.length; col++) {
				finalDist += distMatOrig[x][y][col];
			}
		}
	}*/
	console.log('first coloring done');
	
	if (limitedParts) {
		console.log('optimizing');
		keepRunning = true;
        var count = 0;
		
		while (keepRunning && count < 100) {
			count = count +1;
			
			// Update waitbar
			document.getElementById("calculate-progress-bar").style.width = `${35+(Math.sqrt(count) / 10) * 65}%`;
			document.getElementById("calculate-progress-bar").innerHTML = `Optimizing - Iteration ${count}`;
			await sleep(5);

			keepRunning = false;
			var swapCount = 0;
			var swapPoolCount = 0;
			console.log(`iteration ${count}`);
			for (var x = 0; x < imageData.width; x++) {
				for (var y = 0; y < imageData.height; y++) {
					
					var bestCols = [];
					for (var col = 0; col < colorList.length; col++) {
						if (distMatOrig[x][y][col] < distMatOrig[x][y][outCol[x][y]]) {
							bestCols.push(col);
						}
					}
					if (bestCols.length > 0) {
						// There would be a better choice for this pixel -> can we swap?
						var bestCoice = Infinity;
						var bestCol = -1;
						var bestX = -1;
						var bestY = -1;
						
						for (var col = 0; col < bestCols.length; col++) {
							var loss = distMatOrig[x][y][outCol[x][y]] - distMatOrig[x][y][bestCols[col]]; // what did we loose by suboptimal choice?
							var gain = 0;
							for (var x2 = 0; x2 < imageData.width; x2++) {
								for (var y2 = 0; y2 < imageData.height; y2++) {
									if (outCol[x2][y2] == bestCols[col]) {
										// Possible swap candidate
										gain = distMatOrig[x2][y2][outCol[x][y]] - distMatOrig[x2][y2][bestCols[col]]; // what can we gain by swapping?
										if (gain - loss < bestCoice) {
											bestCoice = gain - loss;
											bestCol = col;
											bestX = x2;
											bestY = y2;
										}
									}
								}
							}
						}
						if (bestCoice < 0) {
							swapCount += 1;
							// -> swap
							outCol[bestX][bestY] = outCol[x][y];
							outCol[x][y] = bestCols[bestCol];
							
							keepRunning = true;
						} else {
							// Check pool
							var bestLoss = -Infinity;
							var bestCol = -1;
							for (var col = 0; col < bestCols.length; col++) {
								if (colorList[bestCols[col]][3] > 0) {
									loss = distMatOrig[x][y][outCol[x][y]] - distMatOrig[x][y][bestCols[col]];
									if (loss > bestLoss) {
										bestLoss = loss;
										bestCol = col;
									}
								}
							}
							if (bestLoss > 0) {
								swapPoolCount += 1;
								// There is a better color left in the pool -> swap
								colorList[bestCols[bestCol]][3] = colorList[bestCols[bestCol]][3] - 1;
								colorList[outCol[x][y]][3] = colorList[outCol[x][y]][3] + 1;
								outCol[x][y] = bestCols[bestCol];
								keepRunning = true;
							}
						}
					}
				}
			}
			console.log(`   swapped ${swapCount} parts + ${swapPoolCount} with pool`);
		}
	}
	
	// Produce final outIm from outCol and colorList
	var finalDist = 0;
	for (var x = 0; x < imageData.width; x++) {
        for (var y = 0; y < imageData.height; y++) {
			finalDist += distMatOrig[x][y][outCol[x][y]];
			outIm[x][y][0] = colorList[outCol[x][y]][0];
			outIm[x][y][1] = colorList[outCol[x][y]][1];
			outIm[x][y][2] = colorList[outCol[x][y]][2];
			outIm[x][y][3] = outCol[x][y]; // color number
			outIm[x][y][4] = colorList[outCol[x][y]][4]; // brick type
			outIm[x][y][5] = colorList[outCol[x][y]][5]; // brick element_id
		}
	}
	//console.log(outIm)
	document.getElementById("calculate-progress-container").hidden = true;
	document.getElementById("buttonCalculate").hidden = false;
	document.getElementById("pdf-progress-container").hidden = true;
	document.getElementById("buttonDownloadPDF").hidden = false;
	return outIm;
	
}


function createArray(length) {
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }

    return arr;
}


function getContrastColor(r, g, b) {
	var out = [];
	if (r+g+b > 255*1.5) {
		out[0] = r * 0.7;
		out[1] = g * 0.7;
		out[2] = b * 0.7;
	} else {
		out[0] = 255 - (255 - r) * 0.7;
		out[1] = 255 - (255 - g) * 0.7;
		out[2] = 255 - (255 - b) * 0.7;
	}
	return out;
}



function generatePDFTitlePage(pdf, timeString) {
	
	const pdfWidth = pdf.internal.pageSize.getWidth();
	const pdfHeight = pdf.internal.pageSize.getHeight();
	
	const canvas = document.getElementById("previewMosaicCanvas");
    const ctx = canvas.getContext("2d");
	
	const imgData = canvas.toDataURL("image/jpeg", 0.5);

	const sectionSize = 16;
	const width = Math.ceil(finalMosaicIm.length/sectionSize)*sectionSize;
	const height = Math.ceil(finalMosaicIm[0].length/sectionSize)*sectionSize;
	const realWidth = finalMosaicIm.length;
	const realHeight = finalMosaicIm[0].length;
	const numSections = Math.ceil(width / sectionSize) * Math.ceil(height / sectionSize);

	document.getElementById("pdf-progress-bar").style.width = `${1 / (numSections + 1) * 100}%`;
	//await sleep(10);

	const canvasWidthMM = Math.min(pdfWidth * 0.6, ((pdfHeight - 100) * width) / height);
	const canvasHeightMM = Math.min((pdfHeight - 100), (pdfWidth * 0.6 * height) / width);
	pdf.addImage(imgData, "JPEG",
		pdfWidth * 0.25,	50,
		canvasWidthMM * realWidth / width, canvasHeightMM * realHeight / height,
		"",	"MEDIUM");

	
	pdf.setFontSize(28);
	pdf.setTextColor(0,0,0); 
	pdf.text(30, 25, 'Custom Brick Mosaic');
	
	pdf.setFontSize(14);
	pdf.text(30, 34, `Source: ${imageFilename}`);
	pdf.text(30, 40, `Resolution: ${width} x ${height}`);
	
	const numSectionsX = Math.ceil(width / sectionSize);
	const numSectionsY = Math.ceil(height / sectionSize);
	
	pdf.setLineWidth(1.5)
	pdf.setDrawColor(200,200,200);
	pdf.setFontSize(28);
	pdf.setTextColor(200,200,200); 
	for (var x = 0; x < numSectionsX; x++) {
		for (var y = 0; y < numSectionsY; y++) {
			pdf.rect(pdfWidth * 0.25 + x / numSectionsX * canvasWidthMM, 50 + y / numSectionsY * canvasHeightMM, canvasWidthMM / numSectionsX, canvasHeightMM / numSectionsY, 'S');
			pdf.text(pdfWidth * 0.25 + (x + 0.4) / numSectionsX * canvasWidthMM, 50 + (y + 0.5) / numSectionsY * canvasHeightMM, `${x + y*Math.ceil(height / sectionSize) + 1}`);
		}
	}
	
	// Part list
	// if there are unused colors in the colorList, we don't want to include them
	// so we need to adjust the color numbers
	var colorCounts = [];
	for (var x = 0; x < realWidth; x++) {
		for (var y = 0; y < realHeight; y++) {
			if (colorCounts[finalMosaicIm[x][y][3]] === undefined) {
				colorCounts[finalMosaicIm[x][y][3]] = 1;
			} else {
				colorCounts[finalMosaicIm[x][y][3]] = colorCounts[finalMosaicIm[x][y][3]] + 1;
			}
		}
	}
	
	var reassignedColors = [];
	var count = 0;
	for (var i = 0; i < colorCounts.length; i++) {
		if (!(colorCounts[i] === undefined)) {
			reassignedColors[count] = i;
			count += 1;
		}
	}
	
	// Draw part list
	pdf.setFillColor(40,40,40);
	var radius = pdfWidth * 0.013;
	var contrastDifference = 0;
	pdf.setFontSize(10);
	if (reassignedColors.length < 23) {
		radius = pdfWidth * 0.02;
		pdf.setFontSize(12);
	}
	pdf.rect(pdfWidth * 0.07, 50, pdfWidth * 0.05, pdfWidth * 0.005 + (reassignedColors.length * 2 * (radius+0.0025*pdfWidth)), 'F');
	pdf.setLineWidth(0.3);
	for (var i = 0; i < reassignedColors.length; i++) {
		if ((fullPartList[reassignedColors[i]][0]+fullPartList[reassignedColors[i]][1]+fullPartList[reassignedColors[i]][2]) > 380) {
			pdf.setDrawColor(0,0,0);
			pdf.setTextColor(0,0,0);
			contrastDifference = -40;
		} else {
			pdf.setDrawColor(255,255,255);
			pdf.setTextColor(255,255,255);
			contrastDifference = 40;
		}
		pdf.setFillColor(fullPartList[reassignedColors[i]][0],fullPartList[reassignedColors[i]][1],fullPartList[reassignedColors[i]][2]);

		const x2 = pdfWidth * 0.075 + radius;
		const y2 = 50 + pdfWidth * 0.005 * (i+1) + ((i+0.5) * 2 * radius);
		//pdf.circle(x2, y2, radius-0.5, 'FD');
		
		if (fullPartList[reassignedColors[i]][4] == 3024) {
			pdf.rect(x2-radius,y2-radius,radius*2,radius*2,'FD');
		} else {
			pdf.circle(x2, y2, radius-0.5, 'FD');
		}
		
		if (fullPartList[reassignedColors[i]][4] == 6141 || fullPartList[reassignedColors[i]][4] == 3024) {
			contrastRGB = getContrastColor(fullPartList[reassignedColors[i]][0], fullPartList[reassignedColors[i]][1], fullPartList[reassignedColors[i]][2]);
			pdf.setDrawColor(contrastRGB[0],contrastRGB[1], contrastRGB[2]);
			pdf.circle(x2, y2, (radius*0.7)-0.5, 'S');
		}
		
		if (fullPartList[reassignedColors[i]][4] == 3){
			pdf.text(x2-1, y2+1.5, '?');
		} else {
			colorNumber = i+1;
			pdf.text(x2-1-1.5*(colorNumber > 9), y2+1.5, colorNumber.toString());
		}
		
		pdf.setTextColor(0,0,0);
		pdf.text(x2 + 2.5 * radius, y2-0.1, `${colorCounts[reassignedColors[i]]} x`);
		pdf.setFontSize(pdf.getFontSize()-6);
		pdf.text(x2 + 2.6 * radius, y2+2.6, `${fullPartList[reassignedColors[i]][5]}`);
		pdf.setFontSize(pdf.getFontSize()+6);
	}
	
	// Footer
	pdf.setFontSize(11);
	pdf.text(30, pdfHeight - 20, 'Downloaded from custombrickmosaic.github.io ');
	pdf.text(30, pdfHeight - 15, `${timeString}`);
	pdf.text(pdfWidth - 40, pdfHeight - 15, `Page 1 / ${numSectionsX*numSectionsY+1}`);
	
}




function generatePDFSectionPage( pdf, sectionNumber, timeString ) {
	
	const pdfWidth = pdf.internal.pageSize.getWidth();
	const pdfHeight = pdf.internal.pageSize.getHeight();

	const sectionSize = 16;
	const radius = pdfWidth * 0.7 / sectionSize / 2;
	
	const width = finalMosaicIm.length;
	const height = finalMosaicIm[0].length;
	const numSectionsX = Math.ceil(width / sectionSize);
	const numSectionsY = Math.ceil(height / sectionSize);
	const xOffset = (sectionNumber) % numSectionsX * sectionSize;
	const yOffset = Math.floor((sectionNumber) / numSectionsX) * sectionSize;
	
	// if there are unused colors in the colorList, we don't want to include them
	// so we need to adjust the color numbers
	var colorCounts = [];
	for (var x = 0; x < width; x++) {
		for (var y = 0; y < height; y++) {
			if (colorCounts[finalMosaicIm[x][y][3]] === undefined) {
				colorCounts[finalMosaicIm[x][y][3]] = 1;
			} else {
				colorCounts[finalMosaicIm[x][y][3]] = colorCounts[finalMosaicIm[x][y][3]] + 1;
			}
		}
	}
	var reassignedColors = [];
	var count = 0;
	for (var i = 0; i < colorCounts.length; i++) {
		if (!(colorCounts[i] === undefined)) {
			reassignedColors[i] = count;
			count += 1;
		}
	}
	
	pdf.setFontSize(28);
	pdf.setTextColor(0,0,0); 
	pdf.text(30, 25, `Section ${sectionNumber+1}`);
	
	pdf.setFillColor(0,0,0);
	pdf.rect(pdfWidth * 0.15, pdfHeight * 0.15, pdfWidth * 0.7, pdfWidth * 0.7, 'F');
	
	pdf.setLineWidth(0.3);
	pdf.setFontSize(12); 
	for (var x = 0; x < sectionSize; x++) {
		for (var y = 0; y < sectionSize; y++) {
			if (((x + xOffset) < width) && ((y + yOffset) < height)) {
				if ((finalMosaicIm[x + xOffset][y + yOffset][0]+finalMosaicIm[x + xOffset][y + yOffset][1]+finalMosaicIm[x + xOffset][y + yOffset][2]) > 380) {
					pdf.setDrawColor(0,0,0);
					pdf.setTextColor(0,0,0);
					contrastDifference = -40;
				} else {
					pdf.setDrawColor(255,255,255);
					pdf.setTextColor(255,255,255);
					contrastDifference = 40;
				}
				pdf.setFillColor(finalMosaicIm[x + xOffset][y + yOffset][0], finalMosaicIm[x + xOffset][y + yOffset][1], finalMosaicIm[x + xOffset][y + yOffset][2]);

				const x2 = pdfWidth * 0.15 + (x * 2 + 1) * radius;
				const y2 = pdfHeight * 0.15 + (y * 2 + 1) * radius;
				
				if (fullPartList[finalMosaicIm[x + xOffset][y + yOffset][3]][4] == 3024) {
					pdf.rect(x2-radius+0.5,y2-radius+0.5,radius*2-1,radius*2-1,'FD');
				} else {
					pdf.circle(x2, y2, radius-0.5, 'FD');
				}
				
				if (fullPartList[finalMosaicIm[x + xOffset][y + yOffset][3]][4] == 6141 || fullPartList[finalMosaicIm[x + xOffset][y + yOffset][3]][4] == 3024)  {
					contrastRGB = getContrastColor(fullPartList[finalMosaicIm[x + xOffset][y + yOffset][3]][0], fullPartList[finalMosaicIm[x + xOffset][y + yOffset][3]][1], fullPartList[finalMosaicIm[x + xOffset][y + yOffset][3]][2]);
					pdf.setDrawColor(contrastRGB[0],contrastRGB[1], contrastRGB[2]);
					pdf.circle(x2, y2, (radius*0.7)-0.5, 'FD');
				}
				
				if (fullPartList[finalMosaicIm[x + xOffset][y + yOffset][3]][4] == 3){
					pdf.text(x2-1, y2+1.5, '?');
				} else {
					colorNumber = reassignedColors[finalMosaicIm[x + xOffset][y + yOffset][3]]+1;
					pdf.text(x2-1-1.5*(colorNumber > 9), y2+1.5, colorNumber.toString());
				}
			}
		}
	}
	
	// Footer
	pdf.setFontSize(11);
	pdf.setTextColor(200,200,200);
	pdf.text(30, pdfHeight - 20, 'Downloaded from custombrickmosaic.github.io ');
	pdf.text(30, pdfHeight - 15, `${timeString}`);
	pdf.text(pdfWidth - 40, pdfHeight - 15, `Page ${sectionNumber+2} / ${numSectionsX*numSectionsY+1}`);
}	



async function generateInstructions() {
	
	const today = new Date(Date.now());
	
	document.getElementById("pdf-progress-bar").style.width = "0%";
	document.getElementById("pdf-progress-container").hidden = false;
	document.getElementById("buttonDownloadPDF").hidden = true;
	
	const sectionSize = 16;
	const numSections = Math.ceil(finalMosaicIm.length / sectionSize) * Math.ceil(finalMosaicIm[0].length / sectionSize);
	
	let pdf = new jsPDF({orientation: "p", unit: "mm", format: "a4"});
	
	generatePDFTitlePage(pdf, today.toUTCString());
	document.getElementById("pdf-progress-bar").style.width = `${1/(numSections + 1) * 100}%`;
	await sleep(50);

	// Add one page per section
	for (var i = 0; i < numSections; i++) {
		pdf.addPage();
		
		generatePDFSectionPage(pdf, i, today.toUTCString());
		document.getElementById("pdf-progress-bar").style.width = `${(i + 2)/(numSections + 1) * 100}%`;
		await sleep(50);
    }
	const fn = imageFilename.split('.').slice(0, -1).join('.');
	pdf.save(`Custom-Brick-Mosaic-Instructions_${fn}.pdf`);
	
	document.getElementById("pdf-progress-container").hidden = true;
    document.getElementById("buttonDownloadPDF").hidden = false;
}



function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}







function lab2rgb(lab){
  var y = (lab[0] + 16) / 116,
      x = lab[1] / 500 + y,
      z = y - lab[2] / 200,
      r, g, b;

  x = 0.95047 * ((x * x * x > 0.008856) ? x * x * x : (x - 16/116) / 7.787);
  y = 1.00000 * ((y * y * y > 0.008856) ? y * y * y : (y - 16/116) / 7.787);
  z = 1.08883 * ((z * z * z > 0.008856) ? z * z * z : (z - 16/116) / 7.787);

  r = x *  3.2406 + y * -1.5372 + z * -0.4986;
  g = x * -0.9689 + y *  1.8758 + z *  0.0415;
  b = x *  0.0557 + y * -0.2040 + z *  1.0570;

  r = (r > 0.0031308) ? (1.055 * Math.pow(r, 1/2.4) - 0.055) : 12.92 * r;
  g = (g > 0.0031308) ? (1.055 * Math.pow(g, 1/2.4) - 0.055) : 12.92 * g;
  b = (b > 0.0031308) ? (1.055 * Math.pow(b, 1/2.4) - 0.055) : 12.92 * b;

  return [Math.max(0, Math.min(1, r)) * 255, 
          Math.max(0, Math.min(1, g)) * 255, 
          Math.max(0, Math.min(1, b)) * 255]
}


function rgb2lab(rgb){
  var r = rgb[0] / 255,
      g = rgb[1] / 255,
      b = rgb[2] / 255,
      x, y, z;

  r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
  z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

  x = (x > 0.008856) ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
  y = (y > 0.008856) ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
  z = (z > 0.008856) ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;

  return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
}


function deltaE(labA, labB){
  var deltaL = labA[0] - labB[0];
  var deltaA = labA[1] - labB[1];
  var deltaB = labA[2] - labB[2];
  var c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2]);
  var c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2]);
  var deltaC = c1 - c2;
  var deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
  deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
  var sc = 1.0 + 0.045 * c1;
  var sh = 1.0 + 0.015 * c1;
  var deltaLKlsl = deltaL / (1.0);
  var deltaCkcsc = deltaC / (sc);
  var deltaHkhsh = deltaH / (sh);
  var i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
  return i < 0 ? 0 : Math.sqrt(i);
}