/**
 * @jest-environment jsdom
 */
import {screen, waitFor} from "@testing-library/dom"
import '@testing-library/jest-dom/extend-expect';
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"

import { bills } from "../fixtures/bills.js"
//import { billsErrors } from "../fixtures/bills.js"

import { ROUTES, ROUTES_PATH} from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStoreRotten from "../__mocks__/storeRotten"

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon).toBeTruthy()
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      // Les dates sont affichées avec un format custom français.
      // Les fixtures factures  contiennent ces données brutes : 01/01/01 02/02/02, 03/03/03, 04/04/04
      // affichées en '4 Avr. 04, 3 Mar. 03, 2 Fév. 02, 1 Jan 01'
      let re = /^(0?[1-9]|[12][0-9]|3[01])\s(Jan.|Fév.|Mar.|Avr.|Mai|Jui.|Jui.|Aoû.|Sep.|Oct.|Nov.|Déc.)\s([0-9]{2})$/i
      const dates = screen.getAllByText(re).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      // Attention le choix des dates dans fixture peut faire échouer le test, recpecter la règle
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})

describe("Given je suis connecté comme employé avec des notes aux dates corrompues", () => {
  describe("When je suis sur la page des factures", () => {
    // Arrange
    let containerBills
    let logSpy
    // Préparation
    beforeEach(() => {
      // Local Storage
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
         type: 'Employee'
      }))
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
    });
    test("Then la console écrit avoir reçu un nombre de notes de frais", async () => {
      // Arrange
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

      // Il n'y a pas d'élement hmtl avec un data-id commun dans les deux pages
      await waitFor(() => screen.getByTestId(elementId))

      expect(console.log.mock.calls).toEqual([["length", 3]]);
    })
    test("Then le tableau dans la page n'affiche pas de ligne html pour ces notes de frais.", async () => {
      // Arrange
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

      // Il n'y a pas d'élement hmtl avec un data-id commun dans les deux pages
      await waitFor(() => screen.getByTestId(elementId))

      // Assert: aucune notes de frais ne doit pas être affichée
      // (attention aux sauts de lignes \n)
      expect(screen.getByTestId('tbody').innerHTML.trim().length).toBe(0)
    })
    test("Then ces notes de frais ne redirigent pas vers la page du message d'erreur", async () => {
      // Arrange
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

      // Il n'y a pas d'élement hmtl avec un data-id commun dans les deux pages
      await waitFor(() => screen.getByTestId(elementId))

      // Assert: Les dates invalides ont été filtrées et ne sont pas envoyées au rendu
      expect(screen.queryByText(/RangeError/)).not.toBeInTheDocument();
    })
  })
})
