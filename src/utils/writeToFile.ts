/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from 'fs'
import path from 'path'
import { ContentWithMetadata } from '../types'

function formatFilename(filename: string): string {
    filename = filename.replace(/[<>:"/\\|?*]+/g, '')
    filename = filename.replace(/\s+/g, '-')
    filename = filename.toLowerCase()
    filename = filename.substring(0, 50)
    return filename
}

export function writeToFile(filename: string, data: ContentWithMetadata): void {
    const formattedFilename = formatFilename(filename)
    const filepath = path.resolve(
        __dirname,
        `../../data/${formattedFilename}.md`
    )
    filename = path.resolve(__dirname, `../../data/${filename}.md`)

    if (!data) throw new Error('No data to write')

    let metadata: Record<string, any> = {}
    try {
        metadata = JSON.parse(data.metadata.text) as Record<string, any>
    } catch (e) {
        metadata = {
            metadata: data.metadata.text,
        }
    }
    let benchmarkData: Record<string, any> = {}

    try {
        benchmarkData = JSON.parse(data.benchmark) as Record<string, any>
    } catch (e) {
        benchmarkData = {
            benchmark: data.benchmark,
        }
    }

    let metadataTable = ''

    for (const key in metadata) {
        metadataTable += `| ${key} | ${metadata[key]} |\n`
    }

    let benchmarkTable = ''

    const recursiveUnpack = (obj: any, parentKey?: string): string => {
        let tableRows = ''
        for (const key in obj) {
            const fullKey = parentKey ? `${parentKey} > ${key}` : key
            if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
                tableRows += recursiveUnpack(obj[key], fullKey)
            } else {
                tableRows += `| ${fullKey} | ${JSON.stringify(obj[key])} |\n`
            }
        }
        return tableRows
    }

    benchmarkTable += recursiveUnpack(benchmarkData)

    const dataToWrite = `
# Metadata

| Key                       | Value |
|---------------------------|-------|
${metadataTable}

---

# Benchmark

| Key                       | Value |
|---------------------------|-------|
${benchmarkTable}
---

# Content
${data.content}

---

# Monologue
${data.monologue}
`

    fs.writeFile(filepath, dataToWrite, (err) => {
        if (err) throw err
        console.log(`Data written to ${filename}`)
    })
}
