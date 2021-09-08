import { copySync, moveSync } from 'fs-extra'
import path from 'path'

const DEPLOY_DIR = 'factions-server-deploy'

function copy(internalPath) {
	const destPath = path.join('..', DEPLOY_DIR, internalPath)
	copySync(internalPath, destPath)
}

function move(internalPath) {
	const destPath = path.join('..', DEPLOY_DIR, internalPath)
	moveSync(internalPath, destPath, { overwrite: true })
}

// Run

copy('package.json')
copy('~$dist/common')
copy('~$dist/server')
