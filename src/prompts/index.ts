import {Answers, Questions, ux} from '@cto.ai/sdk';

export function stackEnvPrompt () {
    return ux.prompt < {
        STACK_ENV: string
    } > ({
        type: 'list',
        name: 'STACK_ENV',
        choices: ['stg', 'sbx', 'pre', 'prd'],
        default: 'stg',
        message: 'What is the name of the environment?',
    })
}

export function stackRepoPrompt () {
    return ux.prompt < {
        STACK_REPO: string
    } > ({
        type: 'list',
        name: 'STACK_REPO',
        choices: [''],
        default: 'changeme',
        message: 'What is the name of the application repo?',
        allowEmpty: false
    })
}

export function stackTagPrompt (tags: string[] = [], defaultValue?: string | number) {
    const questions: Questions = tags.length > 0
    ? {
        type: 'list',
        name: 'STACK_TAG',
        message: 'What is the name of the tag or branch?',
        choices: tags
    }
    : {
        type: 'input',
        name: 'STACK_TAG',
        message: 'What is the name of the tag or branch?',
        allowEmpty: false
    }
    return ux.prompt < {
        STACK_TAG: string
    }>(questions)
}

export function secretValuePrompt () {
    return ux.prompt < {
        SECRET_VALUE: string
    }>({
        type: 'input',
        name: 'SECRET_NAME',
        message: 'What is the value for the secret?',
        allowEmpty: false
    })
}

export function secretKeyPrompt () {
    return ux.prompt < {
        SECRET_VALUE: string
    }>({
        type: 'input',
        name: 'SECRET_NAME',
        message: 'What is the key for the secret?',
        allowEmpty: false
    })
}