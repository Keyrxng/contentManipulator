/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from 'fs'
import path from 'path'
import { ContentWithMetadata } from '../types'

export function writeToFile(filename: string, data: ContentWithMetadata): void {
    const randomId = Math.floor(Math.random() * 100000)
        .toString()
        .padStart(5, '0')

    filename = path.resolve(__dirname, `../../data/${filename}-${randomId}.md`)

    if (!data) throw new Error('No data to write')

    const metadata = JSON.parse(data.metadata.text) as Record<string, any>

    let metadataTable = ''

    for (const key in metadata) {
        metadataTable += `| ${key} | ${metadata[key]} |\n`
    }

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
