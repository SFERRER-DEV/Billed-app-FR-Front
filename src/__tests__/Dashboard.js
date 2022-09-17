/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import {toHaveTextContent} from "@testing-library/jest-dom"
import userEvent from '@testing-library/user-event'
import DashboardFormUI from "../views/DashboardFormUI.js"
import DashboardUI from "../views/DashboardUI.js"
import Dashboard, { filteredBills, cards } from "../containers/Dashboard.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"
import { bills } from "../fixtures/bills"
import router from "../app/Router"
import { readyException } from "jquery"

jest.mock("../app/store", () => mockStore)

describe('Given I am connected as an Admin', () => {
  describe('When I am on Dashboard page, there are bills, and there is one pending', () => {
    test('Then, filteredBills by pending status should return 1 bill', () => {
      const filtered_bills = filteredBills(bills, "pending")
      expect(filtered_bills.length).toBe(1)
    })
  })
  describe('When I am on Dashboard page, there are bills, and there is one accepted', () => {
    test('Then, filteredBills by accepted status should return 1 bill', () => {
      const filtered_bills = filteredBills(bills, "accepted")
      expect(filtered_bills.length).toBe(1)
    })
  })
  describe('When I am on Dashboard page, there are bills, and there is two refused', () => {
    test('Then, filteredBills by accepted status should return 2 bills', () => {
      const filtered_bills = filteredBills(bills, "refused")
      expect(filtered_bills.length).toBe(2)
    })
  })
  describe('When I am on Dashboard page but it is loading', () => {
    test('Then, Loading page should be rendered', () => {
      document.body.innerHTML = DashboardUI({ loading: true })
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })
  describe('When I am on Dashboard page but back-end send an error message', () => {
    test('Then, Error page should be rendered', () => {
      document.body.innerHTML = DashboardUI({ error: 'some error message' })
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })

  describe('When I am on Dashboard page and I click on arrow', () => {
    test('Then, tickets list should be unfolding, and cards should appear', async () => {

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Admin'
      }))

      const dashboard = new Dashboard({
        document, onNavigate, store: null, bills:bills, localStorage: window.localStorage
      })
      document.body.innerHTML = DashboardUI({ data: { bills } })

      const handleShowTickets1 = jest.fn((e) => dashboard.handleShowTickets(e, bills, 1))
      const handleShowTickets2 = jest.fn((e) => dashboard.handleShowTickets(e, bills, 2))
      const handleShowTickets3 = jest.fn((e) => dashboard.handleShowTickets(e, bills, 3))

      const icon1 = screen.getByTestId('arrow-icon1')
      const icon2 = screen.getByTestId('arrow-icon2')
      const icon3 = screen.getByTestId('arrow-icon3')

      icon1.addEventListener('click', handleShowTickets1)
      userEvent.click(icon1)
      expect(handleShowTickets1).toHaveBeenCalled()
      await waitFor(() => screen.getByTestId(`open-bill47qAXb6fIm2zOKkLzMro`) )
      expect(screen.getByTestId(`open-bill47qAXb6fIm2zOKkLzMro`)).toBeTruthy()
      icon2.addEventListener('click', handleShowTickets2)
      userEvent.click(icon2)
      expect(handleShowTickets2).toHaveBeenCalled()
      await waitFor(() => screen.getByTestId(`open-billUIUZtnPQvnbFnB0ozvJh`) )
      expect(screen.getByTestId(`open-billUIUZtnPQvnbFnB0ozvJh`)).toBeTruthy()

      icon3.addEventListener('click', handleShowTickets3)
      userEvent.click(icon3)
      expect(handleShowTickets3).toHaveBeenCalled()
      await waitFor(() => screen.getByTestId(`open-billBeKy5Mo4jkmdfPGYpTxZ`) )
      expect(screen.getByTestId(`open-billBeKy5Mo4jkmdfPGYpTxZ`)).toBeTruthy()
    })

    test("Then je replie la catégorie En attente pour masquer ses notes de frais", async() => {
      // Arrange
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Admin'
      }))

      const dashboard = new Dashboard({
        document, onNavigate, store: null, bills:bills, localStorage: window.localStorage
      })
      document.body.innerHTML = DashboardUI({ data: { bills } })

      const handleShowTickets1 = jest.fn((e) => dashboard.handleShowTickets(e, bills, 1))
      
      const icon1 = screen.getByTestId('arrow-icon1')

      icon1.addEventListener('click', handleShowTickets1)

      // Act
      userEvent.click(icon1) // Déplier
      userEvent.click(icon1) // Replier

      // Assert     
      const pendingBills = await waitFor(() => screen.queryAllByTestId(/open-bill/))
      // Aucune note de frais en attente n'est affichée puisque la catégorie est repliée
      expect(pendingBills.length).toBe(0)
      // Le compteur de clic du container Dashboard doit être paire
      expect(dashboard.counter % 2).toBe(0)   
    })
    
  })

  describe('When I am on Dashboard page and I click on edit icon of a card', () => {
    test('Then, right form should be filled',  () => {

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Admin'
      }))

      const dashboard = new Dashboard({
        document, onNavigate, store: null, bills:bills, localStorage: window.localStorage
      })
      document.body.innerHTML = DashboardUI({ data: { bills } })
      const handleShowTickets1 = jest.fn((e) => dashboard.handleShowTickets(e, bills, 1))
      const icon1 = screen.getByTestId('arrow-icon1')
      icon1.addEventListener('click', handleShowTickets1)
      userEvent.click(icon1)
      expect(handleShowTickets1).toHaveBeenCalled()
      expect(screen.getByTestId(`open-bill47qAXb6fIm2zOKkLzMro`)).toBeTruthy()
      const iconEdit = screen.getByTestId('open-bill47qAXb6fIm2zOKkLzMro')
      userEvent.click(iconEdit)
      expect(screen.getByTestId(`dashboard-form`)).toBeTruthy()
    })
  })

  describe('When I am on Dashboard page and I click 2 times on edit icon of a card', () => {
    test('Then, big bill Icon should Appear',  () => {

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Admin'
      }))

      const dashboard = new Dashboard({
        document, onNavigate, store: null, bills:bills, localStorage: window.localStorage
      })
      document.body.innerHTML = DashboardUI({ data: { bills } })

      const handleShowTickets1 = jest.fn((e) => dashboard.handleShowTickets(e, bills, 1))
      const icon1 = screen.getByTestId('arrow-icon1')
      icon1.addEventListener('click', handleShowTickets1)
      userEvent.click(icon1)
      expect(handleShowTickets1).toHaveBeenCalled()
      expect(screen.getByTestId(`open-bill47qAXb6fIm2zOKkLzMro`)).toBeTruthy()
      const iconEdit = screen.getByTestId('open-bill47qAXb6fIm2zOKkLzMro')
      userEvent.click(iconEdit)
      userEvent.click(iconEdit)
      const bigBilledIcon = screen.queryByTestId("big-billed-icon")
      expect(bigBilledIcon).toBeTruthy()
    })
  })


  describe('When I am on Dashboard and there are no bills', () => {
    test('Then, no cards should be shown', () => {
      document.body.innerHTML = cards([])
      const iconEdit = screen.queryByTestId('open-bill47qAXb6fIm2zOKkLzMro')
      expect(iconEdit).toBeNull()
    })
  })
})

describe('Given I am connected as Admin, and I am on Dashboard page, and I clicked on a pending bill', () => {
  describe('When I click on accept button', () => {
    test('I should be sent on Dashboard with big billed icon instead of form', () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Admin'
      }))
      document.body.innerHTML = DashboardFormUI(bills[0])

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = null
      const dashboard = new Dashboard({
        document, onNavigate, store, bills, localStorage: window.localStorage
      })

      const acceptButton = screen.getByTestId("btn-accept-bill-d")
      const handleAcceptSubmit = jest.fn((e) => dashboard.handleAcceptSubmit(e, bills[0]))
      acceptButton.addEventListener("click", handleAcceptSubmit)
      fireEvent.click(acceptButton)
      expect(handleAcceptSubmit).toHaveBeenCalled()
      const bigBilledIcon = screen.queryByTestId("big-billed-icon")
      expect(bigBilledIcon).toBeTruthy()
    })
  })
  describe('When I click on refuse button', () => {
    test('I should be sent on Dashboard with big billed icon instead of form', () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Admin'
      }))
      document.body.innerHTML = DashboardFormUI(bills[0])

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = null
      const dashboard = new Dashboard({
        document, onNavigate, store, bills, localStorage: window.localStorage
      })
      const refuseButton = screen.getByTestId("btn-refuse-bill-d")
      const handleRefuseSubmit = jest.fn((e) => dashboard.handleRefuseSubmit(e, bills[0]))
      refuseButton.addEventListener("click", handleRefuseSubmit)
      fireEvent.click(refuseButton)
      expect(handleRefuseSubmit).toHaveBeenCalled()
      const bigBilledIcon = screen.queryByTestId("big-billed-icon")
      expect(bigBilledIcon).toBeTruthy()
    })
  })
})

describe('Given I am connected as Admin and I am on Dashboard page and I clicked on a bill', () => {
  describe('When I click on the icon eye', () => {
    test('A modal should open', () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Admin'
      }))
      document.body.innerHTML = DashboardFormUI(bills[0])
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = null
      const dashboard = new Dashboard({
        document, onNavigate, store, bills, localStorage: window.localStorage
      })

      const handleClickIconEye = jest.fn(dashboard.handleClickIconEye)
      const eye = screen.getByTestId('icon-eye-d')
      eye.addEventListener('click', handleClickIconEye)
      userEvent.click(eye)
      expect(handleClickIconEye).toHaveBeenCalled()

      const modale = screen.getByTestId('modaleFileAdmin')
      expect(modale).toBeTruthy()
    })
  })
})

// test d'intégration GET
describe("Given I am a user connected as Admin", () => {
  describe("When I navigate to Dashboard", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Admin", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Dashboard)
      await waitFor(() => screen.getByText("Validations"))
      const contentPending  = await screen.getByText("En attente (1)")
      expect(contentPending).toBeTruthy()
      const contentRefused  = await screen.getByText("Refusé (2)")
      expect(contentRefused).toBeTruthy()
      expect(screen.getByTestId("big-billed-icon")).toBeTruthy()
    })
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Admin',
        email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("fetches bills from an API and fails with 404 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Dashboard)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test("fetches messages from an API and fails with 500 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

      window.onNavigate(ROUTES_PATH.Dashboard)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })

  })
})

describe("Given Je suis connecté en Admin au tableau de bord sur les notes de frais", () => {
  // Préparation commune aux tests qui suivent
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Admin'
    }))
  })
  describe("When J'édite sur une note de frais", () => {
    // Arrange
    // Le container testé
    let containerDashboard
    // L'identifiant d'une note de frais avec un justificatif PDF à tester
    let idBillPDF = 'ixV4o473TTVh58NiCEHofz'
    // L'identifiant d'une note de frais avec un justificatif JPG à tester
    let idBillJPG = 'UIUZtnPQvnbFnB0ozvJh'
    // Les deux notes de frais à tester avec leur nom de fichier      
    let testingBills = []
    // Les fonctions downloadFile et viewFile utilisant les bibliothèques  file-saver et PDF.js
    const pdf = require('../app/pdf')
    // Préparation commune aux tests qui suivent
    beforeEach(async () => {
      // Routage pour navigation
      const onNavigate = (pathname) => {
        document.body.innerHTML  = ROUTES({ pathname })
      }
      // Le container testé avec des notes de frais provenant du store mocké
      containerDashboard = new Dashboard({
        document, onNavigate, store: mockStore, bills:[], localStorage: window.localStorage
      })
      // Temoin d'appel de la catégorie à déplier
      let handleShowTickets2 
      // Le mock store contient deux notes de frais accepted utilisées ici 
      containerDashboard.getBillsAllUsers().then(bills => {
        document.body.innerHTML  = DashboardUI({data: {bills}})
        // Noeud 2 = Validé = Statut accepted
        handleShowTickets2 = jest.fn((e) => containerDashboard.handleShowTickets(e, bills, 2))
        testingBills = bills.filter(bill => bill.id === idBillPDF || bill.id === idBillJPG)
                               .map(bill => { return {'id':bill.id, 'fileName':bill.fileName}  }  )                           
        //new Dashboard({document, onNavigate, store: mockStore, bills, localStorage})        
      })
      .catch(error => {
        document.body.innerHTML  = ROUTES({ pathname, error })
      })
      
      // Mocker l'appel aux bibliothèques file-saver et PDF.js
      jest.spyOn(pdf,'downloadFile').mockImplementation(() => {
        return Promise.resolve('Fake downloaded !')
      }) 
      jest.spyOn(pdf,'viewFile').mockImplementation(() => {
        return Promise.resolve('Fake viewed !')
      })       

      // Cliquer sur le noeud "Validé"
      const icon2 = await waitFor(()=> screen.getByTestId('arrow-icon2'))
      icon2.addEventListener('click', handleShowTickets2)
      userEvent.click(icon2)

      // Bien appelé 
      expect(handleShowTickets2).toHaveBeenCalled()
      // Il y a la note de frais avec un justificatif PNG id:UIUZtnPQvnbFnB0ozvJh
      expect(await waitFor(()=> screen.getByTestId(`open-bill${idBillJPG}`))).toBeTruthy()
      // il y a la note de frais avec un justificatif PDF id:ixV4o473TTVh58NiCEHofz
      expect(await waitFor(()=> screen.getByTestId(`open-bill${idBillPDF}`))).toBeTruthy()
      // Le deux notes de frais PDF et JPG ont été trouvées dans les bllls du store mocké
      expect(testingBills.length).toBe(2)
    })
    afterEach(() => {
      document.body.innerHTML = ''
    })    
    test("Then je vois le justificatif PDF d'une note de frais", async () => {
      // Arrange
      // Le nom du fichier PDF attendu dans le titre de la modale
      const exceptedFilename = testingBills.find(bill => bill.id === idBillPDF).fileName
      // Editer la note de frais possèdant un justificatif PDF
      const iconEdit = screen.getByTestId(`open-bill${idBillPDF}`)
      userEvent.click(iconEdit)
      // Définir la fonction appelée par l'action
      const handleClickIconEye = jest.fn(() => containerDashboard.handleClickIconEye())
      // L'icone voir un justificatif
      const eyeIcon = screen.getByTestId("icon-eye-d") 
      // Ajoiuter l'évènement pour voir un justificatif PDF
      eyeIcon.addEventListener('click', handleClickIconEye)
      // Le témoin de l'appel
      const spyHandleClickIconEye = jest.spyOn(containerDashboard, 'handleClickIconEye').mockImplementation()

      // Act: voir le justificatif
      userEvent.click(eyeIcon)

      // Assert
      expect(spyHandleClickIconEye).toHaveBeenCalled()
      // Le nom du fichier justificatif de la note de frais est bien écrit dans la modale
      expect(screen.getByTestId('modal-long-title')).toHaveTextContent(exceptedFilename)
    })
    test("Then je télécharge le justificatif PDF d'une note de frais", async () => {
      // Arrange      
      // Le message affiché dans la modale après le téléchargement
      const exceptedMessage = 'Le justificatif PDF a été téléchargé'
      // ...
      const iconEdit = screen.getByTestId(`open-bill${idBillPDF}`)
      // Editer la note de frais possèdant un justificatif PDF
      userEvent.click(iconEdit)      
      // Définir la fonction appelée par l'action
      const handleClickIconDownload = jest.fn(() => containerDashboard.handleClickIconDownload())
      // L'icone télécharger un justificatif
      const downloadIcon = screen.getByTestId("icon-download-d") 
      // Ajouter l'évènement pour télécharger un justificatif PDF 
      downloadIcon.addEventListener('click', handleClickIconDownload) 
      // Le témoin de l'appel
      const spyHandleClickIconDownload = jest.spyOn(containerDashboard, 'handleClickIconDownload').mockImplementation(() => {})          

      // Act: télécharger le justificatif
      userEvent.click(downloadIcon)

      // Assert
       expect(spyHandleClickIconDownload).toHaveBeenCalled()
      // Le message "Le justificatif PDF a été téléchargé" est bien écrit à l'écran
      expect(screen.getByTestId('proof-container')).toHaveTextContent(exceptedMessage)
    })
  })
})