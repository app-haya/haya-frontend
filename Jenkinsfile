pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  parameters {
    choice(
      name: 'ENVIRONMENT',
      choices: ['dev', 'prod'],
      description: 'Target deployment environment'
    )
    string(
      name: 'DEPLOY_PATH',
      defaultValue: '/var/www/html',
      description: 'Remote path where the Angular build will be deployed'
    )
    booleanParam(
      name: 'SKIP_INSTALL',
      defaultValue: false,
      description: 'Skip npm ci (use only if node_modules is already cached on the agent)'
    )
  }

  environment {
    NODE_VERSION = '20'
    BUILD_DIR = 'dist/haya/browser'
    // Jenkins Credentials → SSH Username with private key
    SSH_CREDENTIALS_ID = 'angular-vm-ssh'
  }

  stages {
    stage('Resolve target') {
      steps {
        script {
          def targets = [
            dev : [host: '172.16.3.108', user: 'ubuntu', label: 'Angular-Dev'],
            prod: [host: '172.16.1.75',  user: 'ubuntu', label: 'Angular-prod']
          ]

          def target = targets[params.ENVIRONMENT]
          if (!target) {
            error "Unknown ENVIRONMENT: ${params.ENVIRONMENT}"
          }

          if (params.ENVIRONMENT == 'prod') {
            input message: "Deploy to PRODUCTION (${target.label} / ${target.host})?", ok: 'Deploy'
          }

          env.DEPLOY_HOST = target.host
          env.DEPLOY_USER = target.user
          env.DEPLOY_LABEL = target.label

          echo "Deploying to ${env.DEPLOY_LABEL} (${env.DEPLOY_USER}@${env.DEPLOY_HOST}:${params.DEPLOY_PATH})"
        }
      }
    }

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Setup Node') {
      steps {
        sh '''
          set -e
          if command -v nvm >/dev/null 2>&1; then
            . "$HOME/.nvm/nvm.sh"
            nvm install "${NODE_VERSION}"
            nvm use "${NODE_VERSION}"
          fi
          node -v
          npm -v
        '''
      }
    }

    stage('Install dependencies') {
      when {
        expression { return !params.SKIP_INSTALL }
      }
      steps {
        sh 'npm ci'
      }
    }

    stage('Build') {
      steps {
        sh '''
          set -e
          npm run build
          test -d "${BUILD_DIR}"
          echo "Build output:"
          ls -la "${BUILD_DIR}"
        '''
      }
    }

    stage('Deploy') {
      steps {
        sshagent(credentials: [env.SSH_CREDENTIALS_ID]) {
          sh '''
            set -e

            ssh -o StrictHostKeyChecking=no \
              "${DEPLOY_USER}@${DEPLOY_HOST}" \
              "sudo mkdir -p '${DEPLOY_PATH}' && sudo chown -R ${DEPLOY_USER}:${DEPLOY_USER} '${DEPLOY_PATH}'"

            rsync -az --delete \
              -e "ssh -o StrictHostKeyChecking=no" \
              "${BUILD_DIR}/" \
              "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/"

            echo "Deployed successfully to ${DEPLOY_LABEL} (${DEPLOY_HOST})"
          '''
        }
      }
    }
  }

  post {
    success {
      echo "Pipeline succeeded — ${params.ENVIRONMENT} (${env.DEPLOY_LABEL})"
    }
    failure {
      echo "Pipeline failed — ${params.ENVIRONMENT}"
    }
    always {
      cleanWs(deleteDirs: true, notFailBuild: true)
    }
  }
}
