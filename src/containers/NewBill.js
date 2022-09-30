import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }
  handleChangeFile = e => {
    e.preventDefault()
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0]
    const filePath = e.target.value.split(/\\/g)
    const fileName = filePath[filePath.length-1]
    const formData = new FormData()
    const email = JSON.parse(localStorage.getItem("user")).email
    formData.append('file', file)
    formData.append('email', email)

    // Les types acceptés pour le fichier
    const filesTypeOk = ["image/jpeg", "image/jpg", "image/png",  "image/gif", "application/pdf"];
    if (!filesTypeOk.includes(file.type)) {
      console.error(
        "Le fichier justificatif doit être une image (jpeg, jpg ou png) ou un document PDF."
      );
      // Le fichier choisi n'est pas accepté 
      const input = this.document.querySelector(`input[data-testid="file"]`)
      $(input).val(""); // RaB -> affiche "Aucun fichier choisi"
      console.log("Aucun fichier choisi")
      // Raz du Dom
      let prevEle = $(input).prev()
      let newEle = $(input).clone()
      $(input).remove();
      $(prevEle).after(newEle);
    } else {
      // Le type de fichier est accepté
      this.store
        .bills()
        .create({
          data: formData,
          headers: {
            noContentType: true
          }
        })
        .then(({fileUrl, key}) => {
          // La propriété fileUrl n'est pas présente dans la réponse JSON du CREATE  
          // Elle est ajoutée par la fonction du Backend getFileURL(http://backurl + filePath) 
          // dans les réponses de GET et de LIST
          // Les notes de frais mockées simulent cette propriété fileURL
          // pour l'écrire sur la console et la tester dans Jest
          if (fileUrl !== undefined) console.log(fileUrl)
          this.billId = key
          this.fileUrl = fileUrl
          this.fileName = fileName
        }).catch(
           (error) => { console.error(error) }
        ).finally(
          () => console.info(this.billId)
        )
    }
  }
  handleSubmit = e => {
    e.preventDefault()
    let dateObject = e.target.querySelector(`input[data-testid="datepicker"]`).value
    console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', dateObject)
    const dateIsValid = (date) => { return date instanceof Date && !isNaN(date)};

    if (dateIsValid(new Date(dateObject))) {
      const email = JSON.parse(localStorage.getItem("user")).email
      const bill = {
        email,
        type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
        name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
        amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
        date:  dateObject,
        vat: e.target.querySelector(`input[data-testid="vat"]`).value,
        pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
        commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
        fileUrl: this.fileUrl,
        fileName: this.fileName,
        status: 'pending'
      }
      this.updateBill(bill)
      this.onNavigate(ROUTES_PATH['Bills'])
    } else {
      console.error(`La date de la note de frais est invalide ${dateObject}`);
    }
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}
