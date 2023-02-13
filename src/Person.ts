import type { AccessCard, Details, Vehicle } from './types'

type UnparsedAccessCard = {
  ENCODEDNUM: number
  HOTSTAMP: number
  CARDFORMAT: string
  DISABLED: number
  CARDSTATUS: string
  CARDEXPDATE: string
}

type UnparsedVehicle = {
  VEHICLECOLOR: string
  VEHICLEMAKE: string
  VEHICLEMODEL: string
  VEHICLESTATE: string
  VEHICLELICNUM: string
  VEHICLETAGNUM: '' | number
}

export default class Person {
  badgeNumber: number
  firstName: string | null
  middleName: string | null
  lastName: string
  activationDate: Date | null
  psmRmp: 'ERT PSM/RMP HSC' | 'ERT PSM/RMP' | 'ERT HSC' | 'ERT' | 'PSM/RMP HSC' | 'PSM/RMP' | 'HSC' | null
  mcz: boolean | null
  employerCode: 'Contingent' | 'IS Contractor' | 'Contractor' | 'SEH' | null
  incidentCommand: boolean | null
  department: string | null
  carpoolId: string | null
  mczDate: Date | null
  contractorSafety: boolean | null
  receiptOfCH: boolean | null
  title: string | null
  sponsorBadge: string | null
  tempId: string | null
  supervisorBadge: string | null
  primaryPhone: string | null
  assignedKeys: string[] | null
  company: string | null
  gym: boolean | null
  expirationMonth: 'Jan' | 'Feb' | 'Mar' | 'Apr' | 'May' | 'Jun' | 'Jul' | 'Aug' | 'Sep' | 'Oct' | 'Nov' | 'Dec' | null
  secondaryPhone: string | null
  workPhone: string | null
  pin: string | null
  notes: string | null
  deleted: boolean | null
  pictureUrl: string
  badgeLayout: string
  lastModifiedDate: Date | null
  lastEditedDate: Date | null
  vehicles: Vehicle[]
  accessLevels: string[]
  accessCards: AccessCard[]

  constructor(details: Details) {
    this.accessCards = this.parseAccessCards(details.ACCESSCARDS.ACCESSCARD)
    this.accessLevels = details.ACCESSLEVELS.ACCESSLEVEL
    this.activationDate = this.convertToDate(details.ACTDATE)
    this.assignedKeys = this.parseKeys(details.UDF15)
    this.badgeLayout = details.BADGELAYOUT
    this.badgeNumber = details.PERSONID
    this.carpoolId = this.convertToNull(details.UDF6)
    this.company = this.convertToNull(details.UDF16)
    this.contractorSafety = this.convertToBoolean(details.UDF8)
    this.deleted = this.convertToBoolean(details.DELETED)
    this.department = this.convertToNull(details.UDF5)
    this.employerCode = details.UDF3 === '' ? null : details.UDF3
    this.expirationMonth = details.UDF18 === '' ? null : details.UDF18
    this.firstName = this.convertToNull(details.FIRSTNAME)
    this.gym = this.convertToBoolean(details.UDF17)
    this.incidentCommand = this.convertToBoolean(details.UDF4)
    this.lastEditedDate = this.convertToDate(details.LASTEDIT)
    this.lastModifiedDate = this.convertToDate(details.LASTMOD)
    this.lastName = details.LASTNAME
    this.mcz = this.convertToBoolean(details.UDF2)
    this.mczDate = this.convertToDate(details.UDF7)
    this.middleName = this.convertToNull(details.MIDDLENAME)
    this.notes = this.convertToNull(details.NOTES)
    this.pictureUrl = details.PICTUREURL
    this.pin = this.convertToNull(details.PIN)
    this.primaryPhone = this.convertToNull(details.UDF14)
    this.psmRmp = details.UDF1 === '' ? null : details.UDF1
    this.receiptOfCH = this.convertToBoolean(details.UDF9)
    this.secondaryPhone = this.convertToNull(details.UDF19)
    this.sponsorBadge = this.convertToNull(details.UDF11)
    this.supervisorBadge = this.convertToNull(details.UDF13)
    this.tempId = this.convertToNull(details.UDF12)
    this.title = this.convertToNull(details.UDF10)
    this.vehicles = this.parseVehicles(details.VEHICLES.VEHICLE)
    this.workPhone = this.convertToNull(details.UDF20)
  }

  public isActive(): boolean {
    return (
      this.accessCards.length !== 0 &&
      !this.lastName.toLowerCase().includes('badge') &&
      this.accessCards.some((accessCard) => accessCard.cardStatus === 'Active')
    )
  }

  public fullName(): string {
    return `${this.firstName} ${this.lastName}`
  }

  private parseAccessCards(accessCards: UnparsedAccessCard | UnparsedAccessCard[] | null): AccessCard[] {
    if (!accessCards) {
      return []
    }

    if (!Array.isArray(accessCards)) {
      accessCards = [accessCards]
    }

    const parsedAccessCards: AccessCard[] = []

    accessCards.forEach((accessCard: UnparsedAccessCard) => {
      const parsedCard: AccessCard = {
        cardExpirationDate: this.convertToDate(accessCard.CARDEXPDATE),
        cardFormat: accessCard.CARDFORMAT,
        cardStatus: accessCard.CARDSTATUS,
        disabled: this.convertToBoolean(accessCard.DISABLED),
        encodedNumber: accessCard.ENCODEDNUM,
        hotstamp: accessCard.HOTSTAMP,
      }

      parsedAccessCards.push(parsedCard)
    })

    return parsedAccessCards
  }

  private parseKeys(keys: string | number): string[] | null {
    if (typeof keys === 'number') {
      keys = keys.toString()
    }

    if (!keys || keys === '') {
      return null
    }

    return keys.split(', ')
  }

  private parseVehicles(vehicles: UnparsedVehicle | UnparsedVehicle[] | null): Vehicle[] {
    if (!vehicles) {
      return []
    }

    if (!Array.isArray(vehicles)) {
      vehicles = [vehicles]
    }

    const parsedVehicles: Vehicle[] = []

    vehicles.forEach((vehicle: UnparsedVehicle) => {
      const v: Vehicle = {
        color: vehicle.VEHICLECOLOR === '' ? null : vehicle.VEHICLECOLOR,
        license: vehicle.VEHICLELICNUM === '' ? null : vehicle.VEHICLELICNUM,
        make: vehicle.VEHICLEMAKE === '' ? null : vehicle.VEHICLEMAKE,
        model: vehicle.VEHICLEMODEL === '' ? null : vehicle.VEHICLEMODEL,
        parkingPass: vehicle.VEHICLETAGNUM === '' ? null : vehicle.VEHICLETAGNUM,
        state: vehicle.VEHICLESTATE === '' ? null : vehicle.VEHICLESTATE,
      }

      parsedVehicles.push(v)
    })

    return parsedVehicles
  }

  private convertToBoolean(value: string | number): boolean | null {
    if (typeof value === 'string') {
      value = value.toLowerCase()
    }

    switch (value) {
      case 'y':
      case 'true':
      case 1:
        return true

      case 'n':
      case 'false':
      case 0:
        return false
    }

    return null
  }

  private convertToDate(value: string): Date | null {
    if (value === '') {
      return null
    }

    return new Date(value)
  }

  private convertToNull(value: string): string | null {
    if (value === '') return null

    return value
  }
}
