export const downloadFile = (billUrl, fileName) => {
    // Utiliser la solution file-saver pour télécharger un justificatif PDF
    fetch(billUrl)
    .then(res => res.blob())
    .then(blob => saveAs(blob, fileName));
}

export const viewFile = (billUrl, canvas) => {
    // Utiliser la librairie PDF.js
    // Obtenir un blob à partir de l'url du fichier justificatif
    fetch(billUrl)
    .then(res => res.blob())
    .then(blob => blob.arrayBuffer())
    .then(data => {
        // Utiliser la librairie Pdfjs pour générer le rendu du document
        // Préparer un fake worker 
        pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
        pdfjsLib.getDocument(data).promise.then(pdf => {
            // Ne prendre que la première page du justificatif
            let pageNumber = 1;
            pdf.getPage(pageNumber).then(function(page) {
            console.log("Page loaded");
            let scale =  1;
            let viewport = page.getViewport({scale: scale});
            // Préparer l'objet Canvas en utilisant les dimensions de la page du PDF
            let context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            // Afficher le rendu de la page PDF dans le contexte du Canvas
            let renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            let renderTask = page.render(renderContext);
            renderTask.promise.then(function () {
                console.log("Page rendered");
            });
            });
        })
    });
}