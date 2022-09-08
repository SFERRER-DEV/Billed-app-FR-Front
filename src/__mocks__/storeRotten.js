const mockedBillRotten = {
  list() {
    return Promise.resolve([{
        "id": "8pnoKnMAEGxkwjMb2WaAie",
        "name": "*ERROR*",
        "type": "Transports",
        "email": "b@b",
        "date": "99-99-9999",
        "vat": 20,
        "pct": 20,
        "commentary": "*SHOULD NOT APPEAR*",
        "status": "pending",
        "commentAdmin": "Exemple de date erronée stockée en base de données",
        "fileName": "invoice-99999.pdf",
        "amount": 100,
        "fileUrl": "http://localhost:5678/public\\212236a22675e4deee832f04c67b2ffc",
      },
      {
        "id": "ixV4o473TTVh58NiCEHofz",
        "name": "*ERROR*",
        "type": null,
        "email": "b@b",
        "date": null,
        "vat": null,
        "pct": null,
        "commentary": "*SHOULD NOT APPEAR*",
        "status": null,
        "commentAdmin": "Exemple de date null stockée en base de données",
        "fileName": "invoice-12345.pdf",
        "amount": null,
        "fileUrl": "http://localhost:5678/public\\74fc3e76757e14ec6152caaad3e4a646",
      },
      {
        "id": "pTjFM3YtFFcef3xqZjguUM",
        "name": "*ERROR*",
        "type": null,
        "email": "b@b.tld",
        "date": "",
        "vat": null,
        "pct": null,
        "commentary": "*SHOULD NOT APPEAR*",
        "status": null,
        "commentAdmin": "Exemple de date vide stockée en base de données",
        "fileName": "invoice-67890.jpg",
        "amount": null,
        "fileUrl": "http://localhost:5678/public\\3d1e85e2a1fbd0fa518e74f92538208a",
      },
    
    ])
  },
}

export default {
  bills() {
    return mockedBillRotten
  },
}

