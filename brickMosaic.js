const imageFile = document.getElementById("imageFile");
const previewImage = document.getElementById("previewImg");
//const PreviewDefaultText = document.getElementById("image-preview__default-text");
const widthInput = document.getElementById("widthInputValue");
const heightInput = document.getElementById("heightInputValue");

var imageData = [];
var partList = [];

imageFile.addEventListener("change", function() {
    const file = this.files[0]
    //console.log(file);
    //if (file) {
    // Ensure it's an image
    if(file.type.match(/image.*/)) {
        const reader = new FileReader();

        //PreviewDefaultText.style.display = "none";
        previewImage.style.display = "block";
		
		previewImage.decode()
		.then(() => {
			console.log('previewImage decoded')
		})
		.catch((encodingError) => {
			console.log('previewImage decoding error')
			console.log(encodingError);
			//alert('Error loading image. Please try again or choose another image.')
		})

        reader.addEventListener("load", function() {
			//console.log('reader loaded')
			//console.log(this.result);
            previewImage.setAttribute("src", this.result);

			document.getElementById("buttonCalculate").disabled = false;
        })
		
		// Reset canvas
		var canvas = document.getElementById("previewMosaicCanvas");
		var context = canvas.getContext('2d');
		context.clearRect(0, 0, canvas.width, canvas.height); //clear html5 canvas

		//console.log('readingDataURL')
        reader.readAsDataURL(file);
    } else {
        //PreviewDefaultText.style.display = null;
        previewImage.style.display = null;

        document.getElementById("buttonCalculate").disabled = true;
		

        previewImage.setAttribute("src", "");
        RGBResultTextarea.value = "";
        if (file) {
            alert('The file you selected is not a valid image file');
        }
    }
})


/* var partListTableAddRowButton = document.getElementById("addTableRow")
partListTableAddRowButton.addEventListener('click', function () {
    var partListTable = document.getElementById("partTable")
    //console.log(partListTable.rows.length)
    var row = table.insertRow(partListTable.rows.length()-1);
}) */


var calculateButton = document.getElementById("buttonCalculate")
calculateButton.addEventListener('click', function () {
	var resizeCanvas = document.createElement('canvas');
	
	resizeCanvas.width = widthInput.value;
	resizeCanvas.height = heightInput.value;
	context = resizeCanvas.getContext('2d');
	
	setTimeout(() => { 
		context.drawImage(previewImage, 0, 0, resizeCanvas.width, resizeCanvas.height);
	}, 100);
	
	setTimeout(() => {  
		imageData = context.getImageData(0, 0, resizeCanvas.width, resizeCanvas.height);
		//generateValidColoring().then(function(im){drawMosaic()});
		//drawPreview();
		generateValidColoringAndDraw();
	}, 200);
    
})


// Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
//var cell1 = row.insertCell(0);

var myDropdown = document.getElementsByClassName("dropdown-item")
for (var i = 0; i < myDropdown.length; i++) {
    myDropdown[i].addEventListener('click', function () {
        getPartList(this.id);
        //console.log(partList)
        //setTableItemsFromPartList(partList)
    })
}


var myDropdown = document.getElementById("partListGroup").getElementsByClassName('list-group-item')
for (var i = 0; i < myDropdown.length; i++) {
	myDropdown[i].addEventListener('click', function () {
		for (var i = 0; i < myDropdown.length; i++) {
			myDropdown[i].classList.remove('active');
		}
		this.classList.add('active');
        getPartList(this.id);
        //setTableItemsFromPartList(partList)
    })
}


var myButtonGroup = document.getElementById("partLimitsBtnGroup").getElementsByClassName('btn')
for (var i = 0; i < myButtonGroup.length; i++) {
	myButtonGroup[i].addEventListener('click', function () {
		for (var i = 0; i < myButtonGroup.length; i++) {
			myButtonGroup[i].classList.remove('active');
		}
		this.classList.add('active');
    })
}



var drawPreview = function () {
    //console.log(imageData)
    var canvas = document.getElementById("previewMosaicCanvas")
    var context = canvas.getContext("2d");

    canvas.width = imageData.width*30;
    canvas.height = imageData.height*30;

    for (var x = 0; x < imageData.width; x++) {
        for (var y = 0; y < imageData.height; y++) {
            var index = (y*imageData.width + x) * 4;
            var red = imageData.data[index];
            var green = imageData.data[index + 1];
            var blue = imageData.data[index + 2];
            //var alpha = imageData.data[index + 3];

            var centerX = (x+0.5) * canvas.width / (imageData.width);
            var centerY = (y+0.5) * canvas.height / (imageData.height);
            var radius = canvas.width / (imageData.width+1)/2.1;

            context.fillStyle = rgbToHex(`(${red},${green},${blue})`);
            context.beginPath();
            context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
            context.closePath();
            context.fill();
        }
    }

    context.fillStyle = "black";
    context.globalCompositeOperation = 'destination-over'
    context.fillRect(0, 0, canvas.width, canvas.height);
}


var drawMosaic = function (im) {
	
    //console.log(im)
	width = im.length;
	height = im[0].length;
	
    var canvas = document.getElementById("previewMosaicCanvas")
    var context = canvas.getContext("2d");

    canvas.width = width*30;
    canvas.height = height*30;

    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            //var index = (y*width + x) * 4;
            var red = im[x][y][0];
            var green = im[x][y][1];
            var blue = im[x][y][2];

            var centerX = (x+0.5) * canvas.width / (width);
            var centerY = (y+0.5) * canvas.height / (height);
            var radius = canvas.width / (width+1)/2.1;

            context.fillStyle = rgbToHex(`(${red},${green},${blue})`);
            context.beginPath();
            context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
            context.closePath();
            context.fill();
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


var getPartList = function (id) {
    switch (id) {
        case "dropdownButtonBeatles":
            console.log("beatles");
            partList = [
                [5, 19, 29, 698], // r, g, b, count
                [159, 195, 233, 57],
                [248, 187, 61, 65],
                [10, 52, 99, 121],
                [108, 110, 104, 141],
                [53, 33,  0, 554],
                [169, 85,  0, 85],
                [149, 138, 115, 137],
                [160, 165, 169, 51],
                [204, 112, 42, 29],
                [254, 138, 24, 74],
                [88, 42, 18, 250],
                [96, 116, 161, 52],
                [228, 205, 158, 283],
                [255, 255, 255, 149]
				];
            return;
        case "dropdownButtonMonroe":
            console.log("monroe");
			partList = [
                [5, 19, 29, 629],
				[228, 173, 200, 587],
				[108, 110, 104, 131],
				[200, 112, 160, 587],
				[146, 57, 120, 46],
				[54, 174, 191, 587],
				[242, 205, 55, 587]
				];
            return;
        case "dropdownButtonIronman":
            console.log("ironman");
			partList = [
				[5, 19, 29, 476],
				[10, 52, 99, 529],
				[108, 110, 104, 91],
				[53, 33, 0, 196],
				[169, 85, 0, 162],
				[114, 14, 15, 214],
				[149, 138, 115, 97],
				[160, 165, 169, 31],
				[204, 112, 42, 208],
				[170, 127, 46, 232],
				[201, 26, 9, 308],
				[88, 42, 18, 191],
				[96, 116, 161, 23],
				[228, 205, 158, 155],
				[255, 255, 255, 61]
				];
            return;
		case "dropdownButtonSith":
            console.log("sith");
			partList = [
				[5, 19, 29, 877],
				[255, 240, 58, 92],
				[10, 52, 99, 447],
				[108, 110, 104, 151],
				[53, 33, 0, 200],
				[114, 14, 15, 328],
				[160, 165, 169, 110],
				[254, 138, 24, 125],
				[87, 88, 87, 271],
				[201, 26, 9, 286],
				[96, 116, 161, 139],
				[255, 255, 255, 187]
				];
			return;
		case "dropdownButtonHogwarts":
            console.log("hogwarts");
			partList = [
				[5, 19, 29, 593],
				[0, 85, 191, 431],
				[75, 159, 74, 4],
				[114, 14, 15, 503],
				[137, 135, 136, 630],
				[35, 120, 65, 499],
				[160, 165, 169, 236],
				[54, 174, 191, 10],
				[87, 88, 87, 153],
				[170, 127, 46, 604],
				[201, 26, 9, 15],
				[255, 255, 255, 369]
				];
			return;
        default:
            console.log("unknown");
            break;
      }
}
getPartList('dropdownButtonBeatles');


var setTableItemsFromPartList = function (partList) {
    //var partListTable = document.getElementById("partTable")
    //console.log(partListTable)
}



const generateValidColoringAndDraw = async () => {
    const im = await generateValidColoring();
	console.log('coloring done -> drawing')
    drawMosaic(im);
}



var generateValidColoring = function () {
	
	var colorList = JSON.parse(JSON.stringify(partList)); // bad way to do a deep copy, but it works
	
	var usePartLimitsButton = document.getElementById("unlimitedPartsButton");
	var limitedParts = !(usePartLimitsButton.classList.value.includes("active"));
	console.log(limitedParts);
	if (limitedParts) {
		var partLimits1Button = document.getElementById("partLimits1Button");
		if (partLimits1Button.classList.value.includes("active")) { var partMultiplier = 1; }
		var partLimits2Button = document.getElementById("partLimits2Button");
		if (partLimits2Button.classList.value.includes("active")) { var partMultiplier = 2; }
		var partLimits3Button = document.getElementById("partLimits3Button");
		if (partLimits3Button.classList.value.includes("active")) { var partMultiplier = 3; }
		var partLimits4Button = document.getElementById("partLimits4Button");
		if (partLimits4Button.classList.value.includes("active")) { var partMultiplier = 4; }
		console.log(partMultiplier);
		// Adjust number of parts in partList
		console.log(colorList[1][3]);
		for (var col = 0; col < colorList.length; col++) {
			colorList[col][3] = colorList[col][3] * partMultiplier;
		}
		console.log(colorList[1][3]);
	}
	
	// Calculate distance of all pixels to all colors
	// Add a bit of randomness into color for jittering
	var pxCount = 0;
	var distMat = createArray(imageData.width, imageData.height, colorList.length);
	var outIm = createArray(imageData.width, imageData.height, 3);
	var outCol = createArray(imageData.width, imageData.height);
	
	console.log('starting first coloring for loop');
	for (var x = 0; x < imageData.width; x++) {
        for (var y = 0; y < imageData.height; y++) {
			var index = (y*imageData.width + x) * 4;
            var red = imageData.data[index] + Math.random()-0.5;
            var green = imageData.data[index + 1] + Math.random()-0.5;
            var blue = imageData.data[index + 2] + Math.random()-0.5;
			
			// Calculate distance of color of each pixel 
			// to each color in the list
			// and get best available color at the same time
			var bestCol = 0;
			var bestDist = Infinity;
			for (var col = 0; col < colorList.length; col++) {
				distMat[x][y][col] = Math.pow(red-colorList[col][0], 2) + Math.pow(green-colorList[col][1], 2) + Math.pow(blue-colorList[col][2], 2);
				if (distMat[x][y][col] < bestDist && colorList[col][3] > 0) { // check that best color is still available
					bestDist = distMat[x][y][col];
					bestCol = col;
				}
			}
			outIm[x][y][0] = colorList[bestCol][0];
			outIm[x][y][1] = colorList[bestCol][1];
			outIm[x][y][2] = colorList[bestCol][2];
			outCol[x][y] = bestCol;
			pxCount = pxCount + 1;
			if (limitedParts) {
				colorList[bestCol][3] = colorList[bestCol][3] - 1;
			}
		}
	}
	console.log('first coloring done');
	
	var stillPartsAvailable = false;
	for (var col = 0; col < colorList.length; col++){
		if (colorList[col][3] > 0) {
			stillPartsAvailable = true;
		}
	}
	
	if (!stillPartsAvailable) {
		alert('Insufficient parts for this specific mosaic size.')
		return outIm;
	}
	
	var distMatOrig = distMat;
	
	if (limitedParts) {
		console.log('optimizing');
		var keepRunning = true;
        var count = 0;
		
		while (keepRunning && count < 100) {
			count = count +1;
			keepRunning = false;
			console.log(`  iteration ${count}`);
			for (var x = 0; x < imageData.width; x++) {
				for (var y = 0; y < imageData.height; y++) {
					bestCols = [];
					bestDist = Infinity;
					for (var col = 0; col < colorList.length; col++) {
						if (distMatOrig[x][y][col] < distMatOrig[x][y][outCol[x][y]]) { // check that best color is still available
							bestDist = distMat[x][y][col];
							bestCols.push(col);
						}
					}
					if (bestCols.length > 0) {
						// There would be a better choice for this pixel -> can we swap?
						for (var col = 0; col < bestCols.length; col++) {
							var loss = distMatOrig[x][y][outCol[x][y]] - distMatOrig[x][y][bestCols[col]]; // what did we loose by suboptimal choice?
							
							x2loop: // This is a label name
								for (var x2 = 0; x2 < imageData.width; x2++) {
									for (var y2 = 0; y2 < imageData.height; y2++) {
										if (outCol[x2][y2] == bestCols[col]) {
											// Possible swap candidate
											var gain = distMatOrig[x2][y2][outCol[x][y]] - distMatOrig[x2][y2][bestCols[col]]; // what can we gain by swapping?
											if (gain - loss < 0) {
												// -> swap
												outIm[x][y][0] = colorList[bestCols[col]][0];
												outIm[x][y][1] = colorList[bestCols[col]][1];
												outIm[x][y][2] = colorList[bestCols[col]][2];
												outIm[x2][y2][0] = colorList[outCol[x][y]][0];
												outIm[x2][y2][1] = colorList[outCol[x][y]][1];
												outIm[x2][y2][2] = colorList[outCol[x][y]][2];
												outCol[x][y] = bestCols[col];
												outCol[x2][y2] = outCol[x][y];
												
												keepRunning = true;
												break x2loop;
											} else if (colorList[bestCols[col]][3] > 0) {
												// There is a better color left in the pool -> swap
												colorList[bestCols[col]][3] = colorList[bestCols[col]][3] - 1;
												colorList[outCol[x][y]][3] = colorList[outCol[x][y]][3] + 1;
												outIm[x][y][0] = colorList[bestCols[col]][0];
												outIm[x][y][1] = colorList[bestCols[col]][1];
												outIm[x][y][2] = colorList[bestCols[col]][2];
												keepRunning = true;
												break x2loop;
											}
										}
									}
								}
						}
					}
				}
			}
		}
	}
	
	
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
