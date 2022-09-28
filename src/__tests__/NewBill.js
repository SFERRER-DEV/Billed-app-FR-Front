/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom"
import { screen,
         fireEvent,
         waitFor,
         getByRole,
         getByTestId } from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
// Objects des tests
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
// Navigation
import { ROUTES, ROUTES_PATH} from "../constants/routes.js"
import router from "../app/Router.js";
// Fixtures
import  *  as fixtures from "../fixtures/billsPost"
// Mocks
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/storeEmpty"
//import { readyException } from "jquery"

beforeAll(() => {
  // Mock du Local Storage
  Object.defineProperty(window, 'localStorage', { value: localStorageMock })
  window.localStorage.setItem('user', JSON.stringify({
    type: 'Employee',
    email: "b@b"
  }))
})
afterAll(() => {

})

describe("Given I am connected as an employee", () => {
    // Arrange
    let errSpy
    let logSpy
    // Préparation commune aux tests
    beforeEach(() => {
      // Le conteneur HTML
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      // Remplace l'implémentation sur le terminal
      errSpy = jest.spyOn(console, 'error').mockImplementation(()=>{});
      logSpy = jest.spyOn(console, 'log').mockImplementation(()=>{});
    })
    // Nettoyage
    afterEach(() => {
      errSpy.mockRestore();
      logSpy.mockRestore();
      document.body.innerHTML = ''
    });

  describe("When I am on NewBill Page", () => {
    test("Then le formulaire pour envoyer une note de frais est affiché", async() => {
      // Arrange
      // Routage: page login
      router()

      // Act
      // se placer sur #employee/bill/new
      window.onNavigate(ROUTES_PATH.NewBill)

      // Assert
      expect(await waitFor(() => screen.getByTestId('form-new-bill'))).toBeTruthy()
      expect(await screen.findByText('Envoyer une note de frais')).toBeInTheDocument()
    })

    test("Then une date corrompue saisie à la place du calendrier est traitée", () => {
      // Arrange
      // Routage: page login
      router()
      // se placer sur #employee/bill/new
      window.onNavigate(ROUTES_PATH.NewBill) 

      // Le formulaire
      const form = getByTestId(document.body, 'form-new-bill')
      // Le calendrier
      const datepicker = getByTestId(form, 'datepicker')
      // Le calendrier est modifié en zone de saisie pour pouvoir ...
      datepicker.type = 'text'
      // ... soumettre une date corrompue comme en manipulant le HTML du formulaire
      datepicker.value = '3131-31-31'
      // Le bouton Envoyer
      const button = getByRole(form, 'button');

      // Act
      userEvent.click(button)

      // Assert
      expect(console.error.mock.calls).toEqual([['La date de la note de frais est invalide 3131-31-31']])
    })

    test("Then certains champs sont obligatoires et doivent être renseignés", async() => {
      // Arrange 
      // Afficher le formulaire de créattion vierge
       document.body.innerHTML = NewBillUI()
      
      // Le formulaire
      const form = screen.getByTestId('form-new-bill')
      // ses champs obligatoires et non obligatoires
      const expenseType = getByTestId(form, 'expense-type') // required
      const expenseName = getByTestId(form, 'expense-name')
      const datePicker = getByTestId(form, 'datepicker') // required
      const amount = getByTestId(form, 'amount') // required
      const vat = getByTestId(form, 'vat')
      const pct = getByTestId(form, 'pct') // required
      const commentary = getByTestId(form, 'commentary')
 
      // Comment tester la validité d'un champ html file ?
      // InvalidStateError: This input element accepts a filename, 
      // which may only be programmatically set to the empty string.
      const file = getByTestId(form, 'file') // required

      // toute les prorpiétées de cette note de test sont renseignées
      const bill =  fixtures.bills[0]
  
      const p1 = fireEvent.change(expenseType, { target: { value: bill.type } }) // true
      const p2 = fireEvent.change(expenseName, { target: { value: bill.name } }) // true
      const p3 = fireEvent.change(datePicker, { target: { value: bill.date } }) // true
      const p4 = fireEvent.change(amount, { target: { value: bill.amount } }) // true
      const p5 = fireEvent.change(vat, { target: { value: bill.vat } }) // true
      const p6 = fireEvent.change(pct, { target: { value: bill.pct } }) // true
      const p7 = fireEvent.change(commentary, { target: { value: bill.commentary } }) // true
      
      Promise.all([p1, p2, p3, p4, p5, p6, p7])
        .then((values) => {
          // console.info(values);
        })
        .catch((error) => {
          console.warn(error.message)
        });

      // Assert les champs du formulaire doivent être valides (api validation)
      expect(expenseType.validity.valid).toBeTruthy()
      expect(expenseName.validity.valid).toBeTruthy()
      expect(amount.validity.valid).toBeTruthy()
      expect(datePicker.validity.valid).toBeTruthy()
      expect(vat.validity.valid).toBeTruthy()
      expect(pct.validity.valid).toBeTruthy()
      expect(commentary.validity.valid).toBeTruthy()
    })

    test("Then un justificatif doit être téléchargé et peut être changé lors de la création", async() => {
      // Arrange
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
        console.log(pathname)
      }
      // Afficher le formulaire de créattion vierge
      document.body.innerHTML = NewBillUI()
      // Instancier le container avec un store vide 
      // Ce store simule la fonction Create et renvoie un fake fileUrl dans sa réponse JSON
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
      // Le formulaire
      const form = screen.getByTestId('form-new-bill')
      // Le champ pour l'upload
      const file = getByTestId(form, 'file') // required
      // Deux justificatifs avec deux extensions acceptées
      const ficImage = new File(['Dummy content'], 'image.png', {'type': 'image/png'});
      const ficDocument = new File(['Dummy content'], 'document.pdf', {'type': 'application/pdf'});

      // Act 
      // Télécharger un justificatif image
      userEvent.upload(file, ficDocument)
      // puis changer pour télécharger un justificatif pdf
      fireEvent.change(file, { target:{files:[ficImage]} })

      // Assert
      // Les uploads écrivent toujours le même fake fileUrl sur la console
      await waitFor(() => expect(logSpy).toBeCalledTimes(2))
      expect(console.log.mock.calls).toEqual([['https://fakeurl:5678/fakepath/edcba'],
                                              ['https://fakeurl:5678/fakepath/edcba']])
    })
  })

  describe("When Je renseigne complètement une note de frais dans le formulaire de création", () => {
        // Arrange
        // Le container de création d'un note de frais
        let newBill
        // Fonction utile routage ~ route()
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
          console.info(pathname)
        }
        // Une note de test valide
        let bill
        // Formulaire
        let form 
        // Champs html
        let expenseType // required
        let expenseName
        let datePicker // required
        let amount // required
        let vat 
        let pct // required
        let commentary 
        let file // required

        // Préparation commune aux tests qui suivent
        beforeEach(() => {
          // Tous les champs de cette note de test sont renseignés
          bill =  fixtures.bills[0]

          // 1) Afficher le formulaire de création vierge pour saisir
          document.body.innerHTML = NewBillUI()
          // 2) Instancier le container avec un store vide 
          // Ce store simule la fonction Create et renvoie un fake fileUrl dans sa réponse JSON
          newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })

          // Le formulaire
          form = screen.getByTestId('form-new-bill')

          // ses champs obligatoires et non obligatoires
          expenseType = getByTestId(form, 'expense-type') // required
          expenseName = getByTestId(form, 'expense-name')
          datePicker = getByTestId(form, 'datepicker') // required
          amount = getByTestId(form, 'amount') // required
          vat = getByTestId(form, 'vat')
          pct = getByTestId(form, 'pct') // required
          commentary =  getByTestId(form, 'commentary')
          file = getByTestId(form, 'file') // required
          // Justificatif 
          const ficImage = new File(['Dummy content'], 'image.png', {'type': 'image/png'});
          
          // Renseigner les champs du formulaire avec les valeurs des prorpiétés de la note de test
          const p1 = fireEvent.change(expenseType, { target: { value: bill.type } }) // true
          const p2 = fireEvent.change(expenseName, { target: { value: bill.name } }) // true
          const p3 = fireEvent.change(datePicker, { target: { value: bill.date } }) // true
          const p4 = fireEvent.change(amount, { target: { value: bill.amount } }) // true
          const p5 = fireEvent.change(vat, { target: { value: bill.vat } }) // true
          const p6 = fireEvent.change(pct, { target: { value: bill.pct } }) // true
          const p7 = fireEvent.change(commentary, { target: { value: bill.commentary } }) // true
          const p8 = fireEvent.change(file, { target:{files:[ficImage]} }) // true
          
          Promise.all([p1, p2, p3, p4, p5, p6, p7, p8])
            .then((values) => {
              // console.info(values); // 8 x true
            })
            .catch((error) => {
              console.warn(error.message)
            });
        })
        // Nettoyage
        afterEach(() => {
        });

    test("Then ma note de frais est complètement valide", async() => {
      // Arrange : beforeEach()
      // Act : beforeEach()
      // Assert
      expect(expenseType.validity.valid && 
            expenseName.validity.valid &&
            datePicker.validity.valid &&
            amount.validity.valid &&
            vat.validity.valid &&
            pct.validity.valid &&
            commentary.validity.valid).toBeTruthy()
      await waitFor(() => expect(logSpy).toBeCalledTimes(1))
      expect(console.log.mock.calls).toEqual([['https://fakeurl:5678/fakepath/edcba']])
    })
    test("Then je remplace le justificatif par un fichier au format non accepté", () => {
      // Arrange
      let compteur = 0;
      // compteur = 1 (fichier image uploadé dans beforeEach())
      compteur = screen.getByTestId('file').files.length 
      // Justificatif archive zip
      const ficNotAccepted = new File(['Dummy content'], 'archive.zip', {'type': 'application/zip'});

      // Act 
      // Changer le fichier image précédent par un fichier archive zip non accepté
      fireEvent.change(file, { target:{files:[ficNotAccepted]} })
      // compteur = 0  (un fichier non accepté est enlevé du DOM via jQuery)
      compteur = screen.getByTestId('file').files.length 

      // Assert
      expect(compteur).toBe(0) // HTML File a été enlevé du DOM
      expect(logSpy).toBeCalledTimes(2) // Ecrire fakeurl pour fichier accepté, écrire 'Aucun fichier choisi' pour fichier refusé
      expect(errSpy).toBeCalledTimes(1) // Ecrire l'erreur concernant extension non valide
      expect(console.log.mock.calls).toEqual([['https://fakeurl:5678/fakepath/edcba'], // fichier image beforeEach()
                                              ['Aucun fichier choisi']]) // fichier archive.zip
      expect(console.error.mock.calls).toEqual([['Le fichier justificatif doit être une image (jpeg, jpg ou png) ou un document PDF.']])
    })
  })
})

