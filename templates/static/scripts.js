var image = new Image();
image.onload = imageLoaded;
image.src = "2.jpeg";

function imageLoaded() {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    canvas.width = image.width;
    canvas.height = image.height;
    
    ctx.drawImage(image, 0, 0, image.width, image.height);
    blancoNegro(canvas);

    var resultado = document.getElementById("resultado");
    convolucionar(canvas, resultado);
}

function blancoNegro(canvas) {
    var ctx = canvas.getContext("2d");
    var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var pixeles = imgData.data;

    for (var p = 0; p < pixeles.length; p += 4) {
        var gris = (pixeles[p] + pixeles[p+1] + pixeles[p+2]) / 3;
        pixeles[p] = gris;
        pixeles[p+1] = gris;
        pixeles[p+2] = gris;
    }

    ctx.putImageData(imgData, 0, 0);
}

function convolucionar(canvasFuente, canvasDestino) {
    var ctxFuente = canvasFuente.getContext("2d");
    var imgDataFuente = ctxFuente.getImageData(0, 0, canvasFuente.width, canvasFuente.height);
    var pixelesFuente = imgDataFuente.data;

    canvasDestino.width = canvasFuente.width;
    canvasDestino.height = canvasFuente.height;

    var ctxDestino = canvasDestino.getContext("2d");
    var imgDataDestino = ctxDestino.createImageData(canvasDestino.width, canvasDestino.height);
    var pixelesDestino = imgDataDestino.data;

    var sobelVertical = [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1],
    ];

    var sobelHorizontal = [
        [-1, -2, -1],
        [ 0,  0,  0],
        [ 1,  2,  1],
    ];

    for (var y = 1; y < canvasFuente.height - 1; y++) {
        for (var x = 1; x < canvasFuente.width - 1; x++) {
            var idx = (y * canvasFuente.width + x) * 4;
            var totalX = 0, totalY = 0;

            for (var ky = 0; ky < 3; ky++) {
                for (var kx = 0; kx < 3; kx++) {
                    var pixelIdx = ((y + ky - 1) * canvasFuente.width + (x + kx - 1)) * 4;
                    var gray = pixelesFuente[pixelIdx];
                    totalX += sobelHorizontal[ky][kx] * gray;
                    totalY += sobelVertical[ky][kx] * gray;
                }
            }

            var mag = Math.sqrt(totalX * totalX + totalY * totalY);
            mag = mag < 100 ? 0 : mag;

            pixelesDestino[idx] = mag;
            pixelesDestino[idx + 1] = mag;
            pixelesDestino[idx + 2] = mag;
            pixelesDestino[idx + 3] = 255;
        }
    }

    ctxDestino.putImageData(imgDataDestino, 0, 0);
}