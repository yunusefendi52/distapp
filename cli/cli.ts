#!/usr/bin/env node

import { Command } from '@commander-js/extra-typings'
import { distribute } from './commands/distribute.js'

const distributeDeprecated = 'Deprecated. Use distribute command instead. See https://docs.distapp.app/cli/cli-usage#distribute-to-distapp'
const program = new Command()
    .option('--distribute', distributeDeprecated)
    .action((options) => {
        if (options.distribute) {
            console.error(distributeDeprecated)
            return
        }
        console.info(program.helpInformation())
    })
    .allowExcessArguments()
    .allowUnknownOption() // Remove until distribute notice removed as well
program.addCommand(distribute)

await program.parseAsync();
