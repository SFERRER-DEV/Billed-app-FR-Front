/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom"
import {screen, waitFor} from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
// Objects des tests
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
// Navigation
import { ROUTES, ROUTES_PATH} from "../constants/routes.js"
import router from "../app/Router.js";
// Fixtures
import { bills } from "../fixtures/bills.js"
// Mocks
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"
import mockStoreRotten from "../__mocks__/storeRotten"
import  * as pdf from "../app/pdf"

beforeAll(() => {
  // Local Storage
  Object.defineProperty(window, 'localStorage', { value: localStorageMock })
  window.localStorage.setItem('user', JSON.stringify({
    type: 'Employee'
  }))
})
afterAll(() => {

})

describe("Given I am connected as an employee", () => {    
    // Arrange
    let containerBills

    // Préparation commune aux tests
    beforeEach(() => {
      // Le conteneur HTML
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      // Une fonction nécessaire
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      // L'objet Bills
      containerBills = new Bills({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      })
    })
    // Nettoyage
    afterEach(() => {
      document.body.innerHTML = ''
    });
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      // Act
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')

      // Assert: to-do write expect expression
      expect(windowIcon).toBeTruthy()
    })
    test("Then bills should be ordered from earliest to latest", () => {
      // Arrange
      // Les dates sont affichées avec un format custom français.
      // Les fixtures factures  contiennent ces données brutes : 01/01/01 02/02/02, 03/03/03, 04/04/04
      // affichées en '4 Avr. 04, 3 Mar. 03, 2 Fév. 02, 1 Jan 01'
      let re = /^(0?[1-9]|[12][0-9]|3[01])\s(Jan.|Fév.|Mar.|Avr.|Mai|Jui.|Jui.|Aoû.|Sep.|Oct.|Nov.|Déc.)\s([0-9]{2})$/i
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      document.body.innerHTML = BillsUI({ data: bills })

      // Act
      const dates = screen.getAllByText(re).map(a => a.innerHTML)      
      // Attention le choix des dates dans la fixture peut faire échouer le test, recpecter la règle
      const datesSorted = [...dates].sort(antiChrono)
      
      // Assert
      expect(dates).toEqual(datesSorted)
    })
    test("then je clique sur le bouton une nouvelle note de frais", async () => {
      // Arrange
      containerBills.getBills().then(data => {
        root.innerHTML = BillsUI({ data })
      })
      // Attendre l'affiche du bouton "Nouvelle note de frais"
      .then(await waitFor(() => screen.getByTestId('btn-new-bill')))

      const handleClickNewBill = jest.fn(containerBills.handleClickNewBill)
      const newBill = screen.getByTestId('btn-new-bill')
      newBill.addEventListener('click', handleClickNewBill)
      
      // Act
      userEvent.click(newBill)

      // Assert
      expect(handleClickNewBill).toHaveBeenCalled()
      expect(await screen.findByText('Envoyer une note de frais')).toBeInTheDocument()
    })
    test("then je clique sur un icone pour voir le justificatif image", async () => {
      // Arrange
      containerBills.getBills().then(data => {
        root.innerHTML = BillsUI({ data })
      })
      // Attendre l'affiche des icones eye
      .then(await waitFor(() => screen.getAllByTestId('icon-eye')))
      
      // Obtenir tous les div contenant des icones Eye pour afficher un justifiactif jpg
      const divEyesJpg = screen.getAllByTestId('icon-eye')
                            .filter(ico => ico.attributes['data-file-ext'].value === 'jpg')
      // Prendre le premier div
      const iconEye = divEyesJpg[0]

      // Définir la fonction appelée par l'action
      const handleClickIconEye = jest.fn(() => containerBills.handleClickIconEye(iconEye))

      // Ajouter l'évènement à l'icone pour voir un justificatif image
      iconEye.addEventListener('click', handleClickIconEye)

      // Act
      userEvent.click(iconEye)

      // Assert
      expect(handleClickIconEye).toHaveBeenCalled()
      expect(await waitFor(() => screen.getByTestId('justificatif-image'))).toBeTruthy()
    })
    test("then je clique sur un icone pour voir le justificatif pdf", async () => {
      // Arrange
      containerBills.getBills().then(data => {
        root.innerHTML = BillsUI({ data })
      })
      // Attendre l'affichage des icones eye
      .then(await waitFor(() => screen.getAllByTestId('icon-eye')))

      // Obtenir tous les div contenant des icones Eye pour afficher un justificatif jpg
      const divEyesPdf = screen.getAllByTestId('icon-eye')
                            .filter(ico => ico.attributes['data-file-ext'].value === 'pdf')
      // Prendre le premier div
      const iconEye = divEyesPdf[0]

      // Définir la fonction appelée par l'action
      const handleClickIconEye = jest.fn(() => containerBills.handleClickIconEye(iconEye))
      // Ajouter l'évènement à l'icone pour voir un justificatif PDF
      iconEye.addEventListener('click', handleClickIconEye)

      // Mock de la fonction viewFile qui utilise la librairie Pdfjs
      jest.spyOn(pdf, 'viewFile')
      pdf.viewFile.mockImplementation((billUrl, canvas) => {})
      
      // Act
      userEvent.click(iconEye)

      // Assert
      expect(handleClickIconEye).toHaveBeenCalled()
      expect(screen.getByTestId('justificatif-pdf')).toBeTruthy()
    })
    test("then je clique sur un icone pour télécharger le justificatif pdf", async () => {
      // Arrange
      containerBills.getBills().then(data => {
        root.innerHTML = BillsUI({ data })
      })
      // Attendre l'affichage des icones download
      .then(await waitFor(() => screen.getAllByTestId('icon-download')))

      // Obtenir tous les div contenant des icones Download pour téléchager un justificatif PDF
      const divDownloadsPdf = screen.getAllByTestId('icon-download')
                            .filter(ico => ico.attributes['data-file-ext'].value === 'pdf')
      // Prendre le premier div
      const iconDownload = divDownloadsPdf[0]

      // Définir la fonction appelée par l'action
      const handleClickIconDownload = jest.fn(() => containerBills.handleClickIconDownload(iconDownload))
      // Ajouter l'évènement à l'icone pour télécharger un justificatif pdf
      iconDownload.addEventListener('click', handleClickIconDownload)

      // Mock de la fonction downloadFile qui utilise la librairie File-Saver
      jest.spyOn(pdf, 'downloadFile')
      pdf.downloadFile.mockImplementation((billUrl, canvas) => {})
      
      // Act
      userEvent.click(iconDownload)

      // Assert
      expect(handleClickIconDownload).toHaveBeenCalled()
      expect(screen.getByText("Le justificatif PDF a été téléchargé")).toBeTruthy()
    })
  })
})

describe("Given je suis connecté comme employé avec des notes aux dates corrompues", () => {
  describe("When je suis sur la page des factures", () => {
    // Arrange
    let containerBills
    let logSpy
    // Préparation commune aux tests
    beforeEach(() => {
      // Le conteneur HTML
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      // Une fonction nécessaire
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      // Le container Bills est instancié avec un Store corrompu
      containerBills = new Bills({
        document, onNavigate, store: mockStoreRotten, localStorage: window.localStorage
      })
      // Remplace l'implémentation sur le terminal
      logSpy = jest.spyOn(console, 'log').mockImplementation(()=>{});  
    })
    // Nettoyage
    afterEach(() => {
      logSpy.mockRestore();
      document.body.innerHTML = ''
    });
    test("Then la console écrit avoir reçu un nombre de notes de frais", async () => {
      // Arrange
      // Il n'y a pas d'élement hmtl avec un data-id commun aux deux pages
      let elementId;

      // Act
      containerBills.getBills().then(data => {
        // Afficher avec des données corrompues
        root.innerHTML = BillsUI({ data })
        elementId = 'tbody'
      }).catch(error => {
        // Si les dates invalides n'étaient pas filtrées alors elles 
        // lèveraient lors du rendu une exception levée par leur custom formatage.
        root.innerHTML = ROUTES({pathname: ROUTES_PATH.Bills, error })
        elementId = 'error-message'
      })

      // Assert
      expect(await waitFor(() => screen.getByTestId(elementId))).toBeTruthy()
      // Il ya a 3 notes de frais corrompues mockées
      expect(console.log.mock.calls).toEqual([["length", 3]]);
    })
    test("Then le tableau dans la page n'affiche pas de ligne html pour ces notes de frais.", async () => {
      // Arrange
      // Il n'y a pas d'élement hmtl avec un data-id commun aux deux pages
      let elementId;

      // Act
      containerBills.getBills().then(data => {
        // Afficher avec des données corrompues
        root.innerHTML = BillsUI({ data })
        elementId = 'tbody'
      })
      .catch(error => {
        // Si les dates invalides n'étaient pas filtrées alors elles 
        // lèveraient lors du rendu une exception levée par leur custom formatage.
        root.innerHTML = ROUTES({pathname: ROUTES_PATH.Bills, error })
        elementId = 'error-message'
      })

      // Assert
      expect(await waitFor(() => screen.getByTestId(elementId))).toBeTruthy()
      // aucune notes de frais ne doit pas être affichée
      // (attention aux sauts de lignes \n)
      expect(screen.getByTestId('tbody').innerHTML.trim().length).toBe(0)
    })
    test("Then ces notes de frais ne redirigent pas vers la page du message d'erreur", async () => {
      // Arrange
      // Il n'y a pas d'élement hmtl avec un data-id commun aux deux pages
      let elementId;

      // Act
      await containerBills.getBills().then(data => {
        // Afficher avec des données corrompues
        root.innerHTML = BillsUI({ data })
        elementId = 'tbody'
      }).catch(error => {
        // Si les dates invalides n'étaient pas filtrées alors elles 
        // lèveraient lors du rendu une exception levée par leur custom formatage:
        // 'RangeError: Invalid time value'
        root.innerHTML =  ROUTES({pathname: ROUTES_PATH.Bills, error })     
        elementId = 'error-message'
      })

      // Assert
      expect(await waitFor(() => screen.getByTestId(elementId))).toBeTruthy()
      // Les dates invalides ont été filtrées et ne sont pas envoyées au rendu
      expect(screen.queryByText(/RangeError/)).not.toBeInTheDocument();
    })
  })
})
