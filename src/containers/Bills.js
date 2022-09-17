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
    new Logout({ document, localStorage, onNavigate })
  }

  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH['NewBill'])
  }

   handleClickIconEye = async (icon) => {
    const billUrl = icon.getAttribute("data-bill-url")
    const fileExt = icon.getAttribute("data-file-ext")
    const fileName = "Justificatif.pdf";

    if (fileExt === "pdf") {
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
    } else {
      // Afficher un justificatif de type image
      const imgWidth = Math.floor($('#modaleFile').width() * 0.5)
      $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`)
    } 
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
