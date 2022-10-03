/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom"
import {screen, 
        waitFor,
        findByText,
        getByTestId,
        getByText} from "@testing-library/dom"
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


beforeAll(() => {
  // Local Storage
  Object.defineProperty(window, 'localStorage', { value: localStorageMock })
  window.localStorage.setItem('user', JSON.stringify({
    type: 'Employee'
  }))
})
afterAll(() => {
  //
})

describe("Given I am connected as an employee", () => {    
    // Préparation commune aux tests
    beforeEach(() => {
      // Le conteneur Html
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
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
  })
  describe("When je suis sur la page des notes de frais avec des données corrompues uniquement", () => {
    // Arrange
    let containerBills
    let logSpy
    // Préparation commune aux tests
    beforeEach(() => {
      // Une fonction nécessaire
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      // Le container Bills est instancié avec un Store corrompu
      containerBills = new Bills({
        document, onNavigate, store: mockStoreRotten, localStorage: window.localStorage
      })
      // Remplace l'implémentation sur le terminal
      logSpy = jest.spyOn(console, 'log')
    })
    // Nettoyage
    afterEach(() => {
      logSpy.mockRestore();
      document.body.innerHTML = ''
    });
    test("Then la console écrit le nombre de notes de frais reçues", async () => {
      // Arrange
      const exceptedLogMessage1 = 'length'
      const exceptedLogMessage2 = 3 // = 3 notes de frais du mockStoreRotten
      // Il y a des data-id différents sur la page erreur et sur la page des notes de frais 
      let specificElementID;

      // Act
      containerBills.getBills().then(data => {
        // Afficher avec des données corrompues
        document.body.innerHTML = BillsUI({ data })
        specificElementID = 'tbody'
      }).catch(error => {
        // Si les dates invalides n'étaient pas filtrées alors  
        // leur rendu léverait une exception à cause de leur custom formatage.
        document.body.innerHTML = ROUTES({pathname: ROUTES_PATH.Bills, error })
        specificElementID = 'error-message'
      })

      // Assert
      expect(await waitFor(() => screen.getByTestId(specificElementID))).toBeTruthy()
      // Il y a 3 notes de frais corrompues filtrées avant l'affichage
      expect(console.log.mock.calls).toEqual([[exceptedLogMessage1, exceptedLogMessage2]]);
    })
    test("Then le tableau dans la page n'affiche pas de ligne html.", async () => {
      // Arrange
      const zeroHtmlContent = 0
      // Il y a des data-id différents sur la page erreur et sur la page des notes de frais 
      let specificElementID;

      // Act
      containerBills.getBills().then(data => {
        // Afficher avec des données corrompues
        document.body.innerHTML = BillsUI({ data })
        specificElementID = 'tbody'
      }).catch(error => {
        // Si les dates invalides n'étaient pas filtrées alors  
        // leur rendu léverait une exception à cause de leur custom formatage.
        document.body.innerHTML = ROUTES({pathname: ROUTES_PATH.Bills, error })
        specificElementID = 'error-message'
      })

      // Assert
      expect(await waitFor(() => screen.getByTestId(specificElementID))).toBeTruthy()
      // aucune note de frais ne doit pas être affichée et présenté dans le tableau Html
      // (attention aux sauts de lignes \n)
      expect(screen.getByTestId('tbody').innerHTML.trim().length).toBe(zeroHtmlContent)
    })
    test("Then il n'y a pas de message d'erreur affiché", async () => {
      // Arrange
      // Il y a des data-id différents sur la page erreur et sur la page des notes de frais 
      let specificElementID;

      // Act
      containerBills.getBills().then(data => {
        // Afficher avec des données corrompues
        document.body.innerHTML = BillsUI({ data })
        specificElementID = 'tbody'
      }).catch(error => {
        // Si les dates invalides n'étaient pas filtrées alors  
        // leur rendu léverait une exception à cause de leur custom formatage.
        document.body.innerHTML = ROUTES({pathname: ROUTES_PATH.Bills, error })
        specificElementID = 'error-message'
      })

      // Assert
      expect(await waitFor(() => screen.getByTestId(specificElementID))).toBeTruthy()
      // Aucun message d'erreur n'est affiché
      expect(screen.queryByText(/RangeError/)).not.toBeInTheDocument();
      expect(screen.queryByText('Erreur')).not.toBeInTheDocument()
    })
  })
  describe("When je suis sur la page des notes de frais avec des données", () => {
    // L'objet container Bills :
    let containerBills
    // Préparation commune aux tests
    beforeEach(async () => {
      // Une fonction nécessaire
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      // L'objet container Bills :
      containerBills = new Bills({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      })
      containerBills.getBills().then(data => {
          root.innerHTML = BillsUI({ data })
          new Bills({document, onNavigate, store: mockStore, localStorage: window.localStorage})
      })
      .then(await waitFor(() => screen.getByTestId('btn-new-bill')))
    })
    // Nettoyage
    afterEach(() => {
      document.body.innerHTML = ''
    });
    test("Then je suis correctement redirigé si je clique sur le bouton nouvelle note de frais", async () => {
      // Arrange                          
      const exceptedMessage = 'Envoyer une note de frais'

      // Bouton Nouvelle note de frais
      const button = getByTestId(document.body, 'btn-new-bill')

      // Act
      userEvent.click(button)

      // Assert :  La page NewBill est bien affichée à l'écran
      expect(await findByText(document.body, exceptedMessage)).toBeInTheDocument()
    })
    test("then je clique sur un icone pour voir un justificatif image", async () => {
      // Arrange
      const exceptedProofContainerDataId = 'justificatif-image'
      // Obtenir tous les div avec des icones eye des justificatifs image JPG
      const divEyesJpg = screen.getAllByTestId('icon-eye')
                              .filter(ico => ico.attributes['data-file-ext'].value === 'jpg')
      // Prendre le premier div
      const iconEye = divEyesJpg[0]
      // 1/ Définir la fonction appelée par l'action
      const handleClickIconEye = jest.fn(() => containerBills.handleClickIconEye(iconEye))
      // 2/ Ajouter l'évènement à l'icone pour voir un justificatif image
      iconEye.addEventListener('click', handleClickIconEye)
      // 3/ Espioner + implémenter 
      const spyHandleClickIconEye = jest.spyOn(containerBills, 'handleClickIconEye').mockImplementation()

      // Act 
      userEvent.click(iconEye)

      // Assert
      expect(spyHandleClickIconEye).toHaveBeenCalled()
      // Le div proof-container est celui qui contient une image
      expect(await waitFor(() =>getByTestId(document.body, exceptedProofContainerDataId))).toBeTruthy()
    })
    test("then je clique sur un icone pour voir un justificatif pdf", async () => {
      // Arrange
      const exceptedProofContainerDataId = 'justificatif-pdf'
      // Mocker l'appel à la bibliothèque PDF.js
      const pdf = require('../app/pdf')
      jest.spyOn(pdf,'viewFile').mockImplementation(() => {
        return Promise.resolve('Fake viewed !')
      })            
      // Obtenir tous les div avec des icones eye des justifactifs PDF
      const divEyesJpg = screen.getAllByTestId('icon-eye')
                              .filter(ico => ico.attributes['data-file-ext'].value === 'pdf')
      // Prendre le premier div
      const iconEye = divEyesJpg[0]
      // 1/ Définir la fonction appelée par l'action
      const handleClickIconEye = jest.fn(() => containerBills.handleClickIconEye(iconEye))
      // 2/ Ajouter l'évènement à l'icone pour voir un justificatif image
      iconEye.addEventListener('click', handleClickIconEye)
      // 3/ Espioner + implémenter 
      const spyHandleClickIconEye = jest.spyOn(containerBills, 'handleClickIconEye').mockImplementation()

      // Act 
      userEvent.click(iconEye)

      // Assert
      expect(spyHandleClickIconEye).toHaveBeenCalled()
      // Le div proof-container est celui qui contient un document PDF
      expect(await waitFor(() =>getByTestId(document.body, exceptedProofContainerDataId))).toBeTruthy()
    })
    test("then je clique sur un icone pour télécharger un justificatif pdf", async () => {
      // Arrange
      const exceptedMessage = 'Le justificatif PDF a été téléchargé'
      // Mocker l'appel à la bibliothèque file-saver
      const pdf = require('../app/pdf')
      jest.spyOn(pdf,'downloadFile').mockImplementation(() => {
        return Promise.resolve('Fake downloaded !')
      })      

      // Obtenir tous les div avec des icones dowanload des justifactifs PDF
      const divDownloadsPdf = screen.getAllByTestId('icon-download')
                               .filter(ico => ico.attributes['data-file-ext'].value === 'pdf')
      // Prendre le premier div
      const iconDownload = divDownloadsPdf[0]
      // 1/ Définir la fonction appelée par l'action
      const handleClickIconDownload = jest.fn(() => containerBills.handleClickIconDownload(iconDownload))
      // 2/ Ajouter l'évènement à l'icone pour voir un justificatif image
      iconDownload.addEventListener('click', handleClickIconDownload)
      // 3/ Espioner + implémenter 
      const spyhandleClickIconDownload = jest.spyOn(containerBills, 'handleClickIconDownload').mockImplementation()

      // Act 
      userEvent.click(iconDownload)

      // Assert
      expect(spyhandleClickIconDownload).toHaveBeenCalled()
      // Le div proof-container est celui qui contient un document PDF
      expect(screen.getByText(exceptedMessage)).toBeTruthy()
    })
  })
  describe("When je suis sur la page des notes de frais avec une erreur d'API", () => {
        // Arrange
        let containerBills
        let logSpy
        // Préparation commune aux tests
        beforeEach(() => {
          // Une fonction nécessaire
          const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname })
          }
          // Le container Bills est instancié avec un Store corrompu
          containerBills = new Bills({
            document, onNavigate, store: mockStore, localStorage: window.localStorage
          })
          // Remplace l'implémentation sur le terminal
          logSpy = jest.spyOn(console, 'log')
        })
        // Nettoyage
        afterEach(() => {
          logSpy.mockRestore();
          document.body.innerHTML = ''
        });
        test("Then une erreur d'authentification est indiquée par un message 401", async () => {
          // Arrange
          const exceptedErrorMessage = "Erreur 401"
          jest.spyOn(mockStoreRotten, 'bills')
          mockStoreRotten.bills.mockImplementationOnce(() => {
            return {
              list: async () => {
                return await Promise.reject(new Error(exceptedErrorMessage))
              }
            }
          })  
      
          // Act
          // Appeler les données du container
          containerBills.getBills().then(data => {
            // L'erreur d'authentification empêche l'affichage de la liste des notes de frais
          })
          .catch(error => {
            // Afficher l'erreur implémentée dans le mock
            document.body.innerHTML = ROUTES({pathname: ROUTES_PATH.Bills, error })
          })
          .then(waitFor(() => getByTestId(document.body,'error-message')))
        
          // Assert: Erreur 401
          expect(waitFor(() => getByText(document.body, exceptedErrorMessage))).toBeTruthy()
        })
  })
})
