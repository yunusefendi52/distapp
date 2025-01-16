import { spawn, spawnSync } from 'node:child_process'
import { join } from 'node:path'

export default defineNitroPlugin(async (nuxtApp) => {
    if (import.meta.dev || import.meta.preset === 'bun') {
        const cwd = join(process.cwd(), 'distapp-headless')
        spawnSync('bun', ['i'], {
            cwd: cwd,
            encoding: 'utf8',
        })
        const ls = spawn('bun', ['run', 'dev'], {
            cwd: cwd,
            // encoding: 'utf-8',
        })
        ls.stdout.on('data', (data) => {
            console.log(`${data}`)
        })

        ls.stderr.on('data', (data) => {
            console.log(`${data}`)
        })

        ls.stdin.on('data', (data) => {
            console.log(`${data}`)
        })

        ls.on('close', (code) => {
            console.log(`child process exited with code ${code}`)
        })
    }
})
