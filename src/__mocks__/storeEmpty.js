const mockedBills = {
  backend: 'https://fakeurl:5678',
  list() {
    return Promise.resolve([])
  },
  // bill = formData = upload file
  create(bill) {
    return Promise.resolve({fileUrl: `${this.backend}/fakepath/edcba`, 
                            key: '12345' })
  },
  update(bill) {
    return Promise.resolve({
      "id": "12345",
      "vat": bill.vat,
      "status": bill.status,
      "type": bill.type,
      "commentary": bill.commentary,
      "name": bill.name,
      "fileName": bill.fileName,
      "date": bill.date,
      "amount": bill.amount,
      "commentAdmin": bill.commentAdmin,
      "email": bill.email,
      "pct": bill.pct,
      "fileUrl": `${this.backend}\fakepath\jihgf`,
    })
  },
}

export default {
  bills() {
    return mockedBills
  },
}

