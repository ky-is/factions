import { copySync, moveSync } from 'fs-extra'
import path from 'path'

const DEPLOY_DIR = 'factions-server-deploy'

function copy(internalPath, externalPath) {
	const destPath = path.join('..', DEPLOY_DIR, externalPath ?? internalPath)
	copySync(internalPath, destPath)
}

function move(internalPath, externalPath) {
	const destPath = path.join('..', DEPLOY_DIR, externalPath ?? internalPath)
	moveSync(internalPath, destPath, { overwrite: true })
}

// Run

copy('package.json')
copy('~$dist/common', 'common')
copy('~$dist/server', 'server')
