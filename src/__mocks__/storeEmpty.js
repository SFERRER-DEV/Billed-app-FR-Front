const mockedBills = {
  list() {
    return Promise.resolve([])
  },
  // bill = formData upload file
  async create(bill) {
    return await Promise.resolve({fileUrl: 'https://fakeurl:5678/fakepath/edcba', 
                                  key: '12345' })
  },
  async update(bill) {
    return await Promise.resolve({
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
      "fileUrl": `https://fakeurl:5678/fakepath/jihgf`,
    })
  },
}

export default {
  bills() {
    return mockedBills
  },
}

