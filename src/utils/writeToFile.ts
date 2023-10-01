import * as fs from 'fs'
import path from 'path'
import { ContentWithMetadata } from '../types'

export function writeToFile(filename: string, data: ContentWithMetadata): void {
    const randomId = Math.floor(Math.random() * 100000)
        .toString()
        .padStart(5, '0')

    filename = path.resolve(__dirname, `../../data/${filename}-${randomId}.md`)

    if (!data) throw new Error('No data to write')

    const json = JSON.stringify(data, null, 2)

    const metadataObj = JSON.parse(json)

    const metadataTable = Object.entries(metadataObj)
        .map(([key, value]) => {
            let displayValue: string
            if (Array.isArray(value)) {
                displayValue = value.join(', ')
            } else if (typeof value === 'object') {
                const jsonString = JSON.stringify(value, null, 2)
                displayValue = jsonString.split('\n').join('\n    ')
            } else {
                displayValue = value as string
            }
            return `| ${key} | ${displayValue} |`
        })
        .join('\n')

    const dataToWrite = `
# Metadata

| Key                       | Value |
|---------------------------|-------|
${metadataTable}


---

# Content
${data.content}

---

# Monologue
${data.monologue}
`

    fs.writeFile(filename, dataToWrite, (err) => {
        if (err) throw err
        console.log(`Data written to ${filename}`)
    })
}
