import { ROUTES_PATH } from '../constants/routes.js'
import { formatDate, formatStatus } from "../app/format.js"
import Logout from "./Logout.js"

export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
    if (buttonNewBill) buttonNewBill.addEventListener('click', this.handleClickNewBill)
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
    if (iconEye) iconEye.forEach(icon => {
      icon.addEventListener('click', () => this.handleClickIconEye(icon))
    })
    // Ajouter l'évènement pour télécharger un document
    const iconDownload = document.querySelectorAll(`div[data-testid="icon-download"]`)
    if (iconDownload) iconDownload.forEach(icon => {
      icon.addEventListener('click', () => this.handleClickIconDownload(icon))
    })

    new Logout({ document, localStorage, onNavigate })
  }

  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH['NewBill'])
  }

   handleClickIconEye = async (icon) => {
    const billUrl = icon.getAttribute("data-bill-url")
    const fileExt = icon.getAttribute("data-file-ext")
    const fileName = "Justificatif.pdf";

    // Effacer d'éventuels éléments précédement affichés dans la modale
    $(".bill-proof-container").remove();

    if (fileExt === "pdf") {
      // Le document PDF est à afficher dans un canvas
      const location = $("#modaleFile").find(".modal-content");

      // il faut créer un objet Canvas pour l'utiliser
      let canvas = document.createElement("canvas");
      $(canvas).addClass("bill-proof-container");
      // Ajouter le Canvas pour contenir le PDF dans la modale
      $(location).append(canvas);

      // La librairie PDF.js : nécessite deux scripts 
      const urls = ["https://cdn.jsdelivr.net/npm/pdfjs-dist@2.16.105/build/pdf.js",
                    "https://cdn.jsdelivr.net/npm/pdfjs-dist@2.16.105/build/pdf.worker.js"];
      // qui sont téléchargés depuis un CDN
      await Promise.all(
        urls.map(async url => {
          const response = await fetch(url);
          return response.text();
        }))
      // et exécutés pour être utilisés
      .then(scripts => scripts.map(script => eval(script)))
      .then(() => {
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
        })
      });


    } else {
      // Afficher un justificatif de type image
      const imgWidth = Math.floor($('#modaleFile').width() * 0.5)
      $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`)
    }
    $('#modaleFile').modal('show')
  }

  handleClickIconDownload = async (icon) => {
    const billUrl = icon.getAttribute("data-bill-url")
    const fileExt = icon.getAttribute("data-file-ext")
    if (fileExt !== "pdf") return

    // Effacer d'éventuels éléments précédement affichés dans la modale
    $(".bill-proof-container").remove();

    const fileName = "Justificatif.pdf";
    // Utiliser la solution file-saver pour télécharger un justificatif PDF
    fetch("https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.js")
    .then(response => response.text())
    .then(script => eval(script))
    .then(() => { 
      fetch(billUrl)
      .then(res => res.blob())
      .then(blob => saveAs(blob, fileName))
      });
    // Afficher la modale
    $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;' class="bill-proof-container">
      Le justificatif PDF a été téléchargé
      </div>`)
    $('#modaleFile').modal('show')
  }

  getBills = () => {
    if (this.store) {
      return this.store
      .bills()
      .list()
      .then(snapshot => {
        const bills = snapshot
          .map(doc => {
            try {
              return {
                // Obtenir les données décomposées telles qu'en base de données (=brutes).
                ...doc
              }
            } catch(e) {
              // if for some reason, corrupted data was introduced, we manage here failing formatDate function
              // log the error and return unformatted date in that case
              console.log(e,'for',doc)
              return {
                ...doc,
                // Ce remplacement des propriétés après la décomposition n'est plus utile car il n'y a plus de formatage
                date: doc.date,
                status: doc.status
              }
            }
          })
          console.log('length', bills.length)
        return bills
      })
    }
  }
}
