import axios from 'axios'
import { XMLBuilder, XMLParser } from 'fast-xml-parser'
import Person from './Person'
import type { Details } from './types'

type PersonSearchTerms = {
  badgeNumber?: number
  firstName?: string
  middleName?: string
  lastName?: string
  department?: string
  activeOnly?: boolean
}

export default class S2Netbox {
  private url: string
  private username: string
  private password: string
  private sessionId: string | undefined
  private builder: XMLBuilder
  private parser: XMLParser

  constructor(url: string, username: string, password: string) {
    if (url.includes('/goforms/nbapi')) {
      this.url = url
    } else {
      this.url = `${url}/goforms/nbapi`
    }
    this.username = username
    this.password = password
    this.builder = new XMLBuilder({
      attributeNamePrefix: '@_',
      ignoreAttributes: false,
    })
    this.parser = new XMLParser({
      ignoreAttributes: false,
    })
  }

  async init(): Promise<void> {
    await this.login()
  }

  async getAPIVersion(): Promise<string> {
    const xml = this.builder.build({
      'NETBOX-API': {
        '@_sessionid': this.sessionId,
        COMMAND: {
          '@_name': 'GetAPIVersion',
          '@_num': '1',
        },
      },
    })

    const response = await axios.post(this.url, `APIcommand=${xml}`)

    const parsedResponse = this.parser.parse(response.data)

    return parsedResponse.NETBOX.RESPONSE.DETAILS.APIVERSION
  }

  async getPerson(badgeNumber: number): Promise<Person> {
    const xml = this.builder.build({
      'NETBOX-API': {
        '@_sessionid': this.sessionId,
        COMMAND: {
          '@_name': 'GetPerson',
          '@_num': '1',
          PARAMS: {
            PERSONID: badgeNumber,
          },
        },
      },
    })

    const response = await axios.post(this.url, `APIcommand=${xml}`)

    const parsedResponse = this.parser.parse(response.data)
    const details: Details = parsedResponse.NETBOX.RESPONSE.DETAILS
    const person = new Person(details)

    return person
  }

  async getPicture(badgeNumber: number): Promise<string> {
    const xml = this.builder.build({
      'NETBOX-API': {
        '@_sessionid': this.sessionId,
        COMMAND: {
          '@_name': 'GetPicture',
          '@_num': '1',
          PARAMS: {
            PERSONID: badgeNumber,
          },
        },
      },
    })

    const response = await axios.post(this.url, `APIcommand=${xml}`)
    const parsedResponse = this.parser.parse(response.data)

    return parsedResponse.NETBOX.RESPONSE.DETAILS.PICTURE
  }

  async searchPersonData(searchTerms: PersonSearchTerms): Promise<Person | Person[] | null> {
    if (searchTerms.badgeNumber) {
      return this.getPerson(searchTerms.badgeNumber)
    }

    const params = this.parseSearchTerms(searchTerms)

    let people: Person[] = []
    let nextKey: number | undefined = undefined

    do {
      const xml = this.builder.build({
        'NETBOX-API': {
          '@_sessionid': this.sessionId,
          COMMAND: {
            '@_name': 'SearchPersonData',
            '@_num': '1',
            PARAMS: nextKey ? { ...params, STARTFROMKEY: nextKey } : params,
          },
        },
      })

      const response = await axios.post(this.url, `APIcommand=${xml}`)
      const parsedResponse = this.parser.parse(response.data)

      if (parsedResponse.NETBOX.RESPONSE.CODE === 'NOT FOUND') {
        return null
      }

      if (!Array.isArray(parsedResponse.NETBOX.RESPONSE.DETAILS.PEOPLE.PERSON)) {
        return new Person(parsedResponse.NETBOX.RESPONSE.DETAILS.PEOPLE.PERSON)
      }

      parsedResponse.NETBOX.RESPONSE.DETAILS.PEOPLE.PERSON.forEach((p: any) => {
        const person = new Person(p)

        if (searchTerms.activeOnly) {
          if (person.isActive()) {
            people.push(person)
          }
        } else {
          people.push(person)
        }
      })

      nextKey = parsedResponse.NETBOX.RESPONSE.DETAILS.NEXTKEY
    } while (nextKey !== -1)

    return people
  }

  private async login(): Promise<void> {
    const xml = this.builder.build({
      'NETBOX-API': {
        COMMAND: {
          '@_name': 'Login',
          '@_num': '1',
          '@_dateformat': 'tzoffset',
          PARAMS: {
            USERNAME: this.username,
            PASSWORD: this.password,
          },
        },
      },
    })

    const response = await axios.post(this.url, `APIcommand=${xml}`)
    const parsedResponse = this.parser.parse(response.data)

    this.sessionId = parsedResponse.NETBOX['@_sessionid']
  }

  private parseSearchTerms(searchTerms: PersonSearchTerms): any {
    let parsedSearchTerms: any = {}

    if (searchTerms.department) {
      parsedSearchTerms.UDF5 = searchTerms.department
    }
    if (searchTerms.firstName) {
      parsedSearchTerms.FIRSTNAME = searchTerms.firstName
    }
    if (searchTerms.middleName) {
      parsedSearchTerms.MIDDLENAME = searchTerms.middleName
    }
    if (searchTerms.lastName) {
      parsedSearchTerms.LASTNAME = searchTerms.lastName
    }

    return parsedSearchTerms
  }
}
