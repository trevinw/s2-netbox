export type AccessCard = {
  encodedNumber: number
  hotstamp: number
  cardFormat: string
  disabled: boolean | null
  cardStatus: string
  cardExpirationDate: Date | null
}

export type Details = {
  PERSONID: number
  FIRSTNAME: string
  MIDDLENAME: string
  LASTNAME: string
  ACTDATE: string
  UDF1: '' | 'ERT PSM/RMP HSC' | 'ERT PSM/RMP' | 'ERT HSC' | 'ERT' | 'PSM/RMP HSC' | 'PSM/RMP' | 'HSC'
  UDF2: '' | 'Y' | 'N'
  UDF3: '' | 'Contingent' | 'IS Contractor' | 'Contractor' | 'SEH'
  UDF4: '' | 'Y' | 'N'
  UDF5: string
  UDF6: string
  UDF7: string
  UDF8: '' | 'Y' | 'N'
  UDF9: '' | 'Y' | 'N'
  UDF10: string
  UDF11: string
  UDF12: string
  UDF13: string
  UDF14: string
  UDF15: string
  UDF16: string
  UDF17: '' | 'Y'
  UDF18: '' | 'Jan' | 'Feb' | 'Mar' | 'Apr' | 'May' | 'Jun' | 'Jul' | 'Aug' | 'Sep' | 'Oct' | 'Nov' | 'Dec'
  UDF19: string
  UDF20: string
  PIN: string
  NOTES: string
  DELETED: 'TRUE' | 'FALSE'
  PICTUREURL: string
  BADGELAYOUT: string
  LASTMOD: string
  LASTEDIT: string
  LASTEDITPERSONID: string
  CONTACTPHONE: string
  MOBILEPHONE: string
  CONTACTEMAIL: string
  CONTACTSMSEMAIL: string
  CONTACTLOCATION: string
  OTHERCONTACTNAME: string
  OTHERCONTACTPHONE1: string
  OTHERCONTACTPHONE2: string
  VEHICLES: {
    VEHICLE: Array<{
      VEHICLECOLOR: string
      VEHICLEMAKE: string
      VEHICLEMODEL: string
      VEHICLESTATE: string
      VEHICLELICNUM: string
      VEHICLETAGNUM: '' | number
    }>
  }
  ACCESSLEVELS: {
    ACCESSLEVEL: string[]
  }
  ACCESSCARDS: {
    ACCESSCARD: Array<{
      ENCODEDNUM: number
      HOTSTAMP: number
      CARDFORMAT: string
      DISABLED: 0 | 1
      CARDSTATUS: 'Active' | 'Damaged' | 'Disabled' | 'Expired' | 'Lost' | 'Not Returned' | 'Not Used' | 'Returned'
      CARDEXPDATE: string
    }>
  }
}

export type Vehicle = {
  color: string | null
  make: string | null
  model: string | null
  state: string | null
  license: string | null
  parkingPass: number | null
}
