import { ROUTES_PATH } from '../constants/routes.js'
//import { formatDate, formatStatus } from "../app/format.js"
import Logout from "./Logout.js"
import { downloadFile, viewFile } from '../app/pdf.js'

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
      const location = $("#modaleFile").find(".modal-body");

      // il faut créer un objet Canvas pour l'utiliser ~ BillsUI 
      let canvas = document.createElement("canvas");
      $(canvas).addClass("bill-proof-container");
      $(canvas).attr("data-testid","justificatif-pdf");
      // Ajouter le Canvas pour contenir le PDF dans la modale
      $(location).append(canvas);
      // Voir la 1ere page pdf du justificatif
      viewFile(billUrl, canvas);

    } else {
      // Afficher un justificatif de type image
      const imgWidth = Math.floor($('#modaleFile').width() * 0.5)
      $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;' class='bill-proof-container' data-testid='justificatif-image'><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`)
    }

    // En environnement Jest: 
    // The promise rejected with the reason "TypeError: $(...).modal is not a function".] 
    // { code: 'ERR_UNHANDLED_REJECTION'}
    if (typeof jest === 'undefined') {
      $('#modaleFile').modal('show')
    }
  }

  handleClickIconDownload = async (icon) => {
    const billUrl = icon.getAttribute("data-bill-url")
    const fileExt = icon.getAttribute("data-file-ext")
    if (fileExt !== "pdf") return

    // Effacer d'éventuels éléments précédement affichés dans la modale
    $(".bill-proof-container").remove();

    const fileName = "Justificatif.pdf";

    // Utiliser la solution file-saver pour télécharger un justificatif PDF
    downloadFile(billUrl, fileName);

    // Afficher la modale
    $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;' class='bill-proof-container'>
      Le justificatif PDF a été téléchargé
      </div>`)

    // En environnement Jest: 
    // The promise rejected with the reason "TypeError: $(...).modal is not a function".] 
    // { code: 'ERR_UNHANDLED_REJECTION'}
    if (typeof jest === 'undefined') {
      $('#modaleFile').modal('show')
    }
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
                // Obtenir les données brutes telles qu'en base de données.
                // Les données sont formatées lors du rendu et non maintenant:
                //  - formatDate et formatStatus sont dans BillsUI
                ...doc
              }
            } catch(e) {
              // if for some reason, corrupted data was introduced, we manage here failing formatDate function
              // log the error and return unformatted date in that case
              console.log(e,'for',doc)
              return {
                ...doc,
                // Ce remplacement des propriétés lors d'une erreur pendant la décomposition 
                /// n'est plus utile car le formatage ne se fait plus ici
                // date: doc.date,
                // status: doc.status
              }
            }
          })
          console.log('length', bills.length)
        return bills
      })
    }
  }
}
