const imageFile = document.getElementById("imageFile");
const previewImage = document.getElementById("previewImg");
const widthInput = document.getElementById("widthInputValue");
const heightInput = document.getElementById("heightInputValue");

document.getElementById("buttonCalculate").disabled = true;
document.getElementById("buttonDownloadPDF").disabled = true;

var imageData = [];
var partList = [];
var finalMosaicIm = [];

imageFile.addEventListener("change", function() {
    const file = this.files[0]

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
            previewImage.setAttribute("src", this.result);

			document.getElementById("buttonCalculate").disabled = false;
			document.getElementById("buttonDownloadPDF").disabled = true;
        })
		
		// Reset canvas
		var canvas = document.getElementById("previewMosaicCanvas");
		var context = canvas.getContext('2d');
		context.clearRect(0, 0, canvas.width, canvas.height); //clear html5 canvas

        reader.readAsDataURL(file);
    } else {
        //PreviewDefaultText.style.display = null;
        previewImage.style.display = null;

        document.getElementById("buttonCalculate").disabled = true;
		document.getElementById("buttonDownloadPDF").disabled = true;

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


document.getElementById("buttonCalculate").addEventListener('click', function () {
	var resizeCanvas = document.createElement('canvas');
	
	resizeCanvas.width = widthInput.value;
	resizeCanvas.height = heightInput.value;
	context = resizeCanvas.getContext('2d');
	
	setTimeout(() => { 
		context.drawImage(previewImage, 0, 0, resizeCanvas.width, resizeCanvas.height);
	}, 100);
	
	setTimeout(() => {  
		imageData = context.getImageData(0, 0, resizeCanvas.width, resizeCanvas.height);
		generateValidColoringAndDraw();
	}, 200);
    
})


document.getElementById("buttonDownloadPDF")
    .addEventListener("click", async () => {
        await generateInstructions();
    });


// Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
//var cell1 = row.insertCell(0);

var myDropdown = document.getElementsByClassName("dropdown-item")
for (var i = 0; i < myDropdown.length; i++) {
    myDropdown[i].addEventListener('click', function () {
        getPartList(this.id);
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
		case "dropdownButtonPortrait":
			partList = [
				[5, 19, 29, 900],
				[108, 110, 104, 900],
				[160, 165, 169, 900],
				[255, 255, 255, 900],
				[242, 205, 55, 900]
				];
			return;
		case "dropdownButtonMickey":
			partList = [
				[5, 19, 29, 662],
				[10, 52, 99, 409],
				[108, 110, 104, 79],
				[53, 33, 0, 76],
				[114, 14, 15, 96],
				[160, 165, 169, 59],
				[201, 26, 9, 213],
				[228, 205, 158, 32],
				[255, 255, 255, 835]
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
	if (im === undefined) {
		return
	}
	console.log('coloring done -> drawing')
    drawMosaic(im);
	finalMosaicIm = im;
	document.getElementById("buttonDownloadPDF").disabled = false;
}



async function generateValidColoring () {
	
	document.getElementById("calculate-progress-bar").style.width = "100%";
	document.getElementById("calculate-progress-bar").style.width = "0%";
	document.getElementById("calculate-progress-container").hidden = false;
	document.getElementById("buttonCalculate").hidden = true;
	await sleep(5);
	
	var colorList = JSON.parse(JSON.stringify(partList)); // bad way to do a deep copy, but it works
	var colorList2 = JSON.parse(JSON.stringify(partList)); // bad way to do a deep copy, but it works
	
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

		// Adjust number of parts in partList
		for (var col = 0; col < colorList.length; col++) {
			colorList[col][3] = colorList[col][3] * partMultiplier;
		}
		console.log(colorList);
	}
	
	// Calculate distance of all pixels to all colors
	// Add a bit of randomness into color for jittering
	var pxCount = 0;
	var distMat = createArray(imageData.width, imageData.height, colorList.length);
	var outIm = createArray(imageData.width, imageData.height, 3);
	var outCol = createArray(imageData.width, imageData.height);
	
	console.log(imageData.data)
	
	console.log('starting coloring');
	var allBlack = true;
	for (var x = 0; x < imageData.width; x++) {
        for (var y = 0; y < imageData.height; y++) {
			var index = (y*imageData.width + x) * 4;
            var red = imageData.data[index] + Math.random()*3-1.5;
            var green = imageData.data[index + 1] + Math.random()*3-1.5;
            var blue = imageData.data[index + 2] + Math.random()*3-1.5;
			
			if (red != 0 || green != 0 || blue != 0) {
				allBlack = false
			}
			
			// Calculate distance of color of each pixel 
			// to each color in the list
			// and get best available color at the same time
			//var bestCol = 0;
			//var bestDist = Infinity;
			for (var col = 0; col < colorList.length; col++) {
				distMat[x][y][col] = Math.pow(red-colorList[col][0], 2) + Math.pow(green-colorList[col][1], 2) + Math.pow(blue-colorList[col][2], 2);
				//if (distMat[x][y][col] < bestDist && colorList[col][3] > 0) { // check that best color is still available
				//	bestDist = distMat[x][y][col];
				//	bestCol = col;
				//}
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
		outIm[bestX][bestY][0] = colorList[bestCol][0];
		outIm[bestX][bestY][1] = colorList[bestCol][1];
		outIm[bestX][bestY][2] = colorList[bestCol][2];
		
		for (var col = 0; col < colorList.length; col++) { // this x,y pos is set now
			distMat[bestX][bestY][col] = Infinity;
		}
		
		outCol[bestX][bestY] = bestCol;
		pxCount = pxCount + 1;
		
		if (pxCount % 100 == 0) {
			document.getElementById("calculate-progress-bar").style.width = `${15+20*pxCount/(imageData.width*imageData.height)}%`;
			await sleep(5);
		}
		
		// Reduce count of that color in pool
		if (limitedParts) {
			colorList[bestCol][3] = colorList[bestCol][3] - 1;
		}
		
		// Check that there are still parts left, otherwise exit
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
		
		// Exit while loop if done
		if (pxCount == (imageData.width * imageData.height)) {
			keepRunning = false;
		}
	}
	
	outCol2 = JSON.parse(JSON.stringify(outCol));
	var finalDist = 0;
	for (var x = 0; x < imageData.width; x++) {
        for (var y = 0; y < imageData.height; y++) {
			for (var col = 0; col < colorList.length; col++) {
				finalDist += distMatOrig[x][y][col];
			}
		}
	}
	console.log('first coloring done');
	drawMosaic(outIm);
	//document.getElementById("calculate-progress-bar").style.width = "20%";
	//await sleep(5);
	
	if (limitedParts) {
		console.log('optimizing');
		keepRunning = true;
        var count = 0;
		
		while (keepRunning && count < 100) {
			count = count +1;
			
			document.getElementById("calculate-progress-bar").style.width = `${35+(Math.sqrt(count) / 10) * 65}%`;
			document.getElementById("calculate-progress-bar").innerHTML = `Optimizing - Iteration ${count}`;
			await sleep(5);

			keepRunning = false;
			var swapCount = 0;
			var swapPoolCount = 0;
			console.log(`  iteration ${count}`);
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
							outIm[x][y][0] = colorList[bestCols[bestCol]][0];
							outIm[x][y][1] = colorList[bestCols[bestCol]][1];
							outIm[x][y][2] = colorList[bestCols[bestCol]][2];
							outIm[bestX][bestY][0] = colorList[outCol[x][y]][0];
							outIm[bestX][bestY][1] = colorList[outCol[x][y]][1];
							outIm[bestX][bestY][2] = colorList[outCol[x][y]][2];
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
								outIm[x][y][0] = colorList[bestCols[bestCol]][0];
								outIm[x][y][1] = colorList[bestCols[bestCol]][1];
								outIm[x][y][2] = colorList[bestCols[bestCol]][2];
								outCol[x][y] = bestCols[bestCol];
								keepRunning = true;
							}
						}
					}
				}
			}
			console.log(`swapped ${swapCount} parts + ${swapPoolCount} with pool`);
		}
	}
	
	var finalDist = 0;
	for (var x = 0; x < imageData.width; x++) {
        for (var y = 0; y < imageData.height; y++) {
			finalDist += distMatOrig[x][y][outCol[x][y]];
			outIm[x][y][3] = outCol[x][y];
		}
	}
	
	document.getElementById("calculate-progress-container").hidden = true;
	document.getElementById("buttonCalculate").hidden = false;
	
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
		pdfWidth * 0.2,	50,
		canvasWidthMM * realWidth / width, canvasHeightMM * realHeight / height,
		"",	"MEDIUM");
		
	console.log(`w ${width} h ${height} rw ${realWidth} rh ${realHeight} ns ${numSections} cw ${canvasWidthMM} ch ${canvasHeightMM} iw ${canvasWidthMM * realWidth / width} ih ${canvasHeightMM * realHeight / height}`);

	
	pdf.setFontSize(28);
	pdf.setTextColor(0,0,0); 
	pdf.text(30, 25, 'Custom Brick Mosaic');

	pdf.setFontSize(14);
	pdf.text(30, 38, `Resolution: ${width} x ${height}`);
	
	const numSectionsX = Math.ceil(width / sectionSize);
	const numSectionsY = Math.ceil(height / sectionSize);
	
	pdf.setLineWidth(1.5)
	pdf.setDrawColor(200,200,200);
	pdf.setFontSize(28);
	pdf.setTextColor(200,200,200); 
	for (var x = 0; x < numSectionsX; x++) {
		for (var y = 0; y < numSectionsY; y++) {
			pdf.rect(pdfWidth * 0.2 + x / numSectionsX * canvasWidthMM, 50 + y / numSectionsY * canvasHeightMM, canvasWidthMM / numSectionsX, canvasHeightMM / numSectionsY, 'S');
			pdf.text(pdfWidth * 0.2 + (x + 0.4) / numSectionsX * canvasWidthMM, 50 + (y + 0.5) / numSectionsY * canvasHeightMM, `${x + y*Math.ceil(height / sectionSize) + 1}`);
		}
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
	
	console.log(`section ${sectionNumber} xoff ${xOffset} yoff ${yOffset}`)

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
				if ((finalMosaicIm[x + xOffset][y + yOffset][0]+finalMosaicIm[x + xOffset][y + yOffset][1]+finalMosaicIm[x + xOffset][y + yOffset][2]) > 300) {
					pdf.setDrawColor(0,0,0);
					pdf.setTextColor(0,0,0);
				} else {
					pdf.setDrawColor(255,255,255);
					pdf.setTextColor(255,255,255);
				}
				pdf.setFillColor(finalMosaicIm[x + xOffset][y + yOffset][0], finalMosaicIm[x + xOffset][y + yOffset][1], finalMosaicIm[x + xOffset][y + yOffset][2]);

				const x2 = pdfWidth * 0.15 + (x * 2 + 1) * radius;
				const y2 = pdfHeight * 0.15 + (y * 2 + 1) * radius;
				pdf.circle(x2, y2, radius-0.5, 'FD');
				pdf.text(x2-1-1.5*(finalMosaicIm[x + xOffset][y + yOffset][3] > 8), y2+1.5, `${finalMosaicIm[x + xOffset][y + yOffset][3]+1}`);
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
	pdf.save("Custom-Brick-Mosaic-Instructions.pdf");
	
	document.getElementById("pdf-progress-container").hidden = true;
    document.getElementById("buttonDownloadPDF").hidden = false;
}



function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


