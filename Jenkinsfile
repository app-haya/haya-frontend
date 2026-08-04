pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
    timeout(time: 30, unit: 'MINUTES')
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
      description: 'Skip npm ci'
    )
  }

  environment {
    NODE_VERSION = '22'
    BUILD_DIR = 'dist/haya/browser'
  }

  stages {
    stage('Resolve target') {
      steps {
        script {
          def targets = [
            dev: [
              host: '172.16.3.108',
              user: 'ubuntu',
              label: 'Angular-Dev',
              credential: 'angular-vm-ssh'
            ],
            prod: [
              host: '172.16.1.75',
              user: 'ubuntu',
              label: 'Angular-prod',
              credential: 'angular-prod-vm-ssh'
            ]
          ]

          def target = targets[params.ENVIRONMENT]

          if (!target) {
            error "Unknown ENVIRONMENT: ${params.ENVIRONMENT}"
          }

          env.DEPLOY_HOST = target.host
          env.DEPLOY_USER = target.user
          env.DEPLOY_LABEL = target.label
          env.SSH_CREDENTIALS_ID = target.credential

          echo """
          Deployment target:
          Environment: ${params.ENVIRONMENT}
          Server: ${env.DEPLOY_LABEL}
          Host: ${env.DEPLOY_HOST}
          Path: ${params.DEPLOY_PATH}
          Credential: ${env.SSH_CREDENTIALS_ID}
          """

          if (params.ENVIRONMENT == 'prod') {
            timeout(time: 10, unit: 'MINUTES') {
              input(
                message: "Deploy commit ${env.GIT_COMMIT ?: 'current build'} to PRODUCTION (${target.host})?",
                ok: 'Deploy to production'
              )
            }
          }
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

          echo "Node version:"
          node -v

          echo "npm version:"
          npm -v

          NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]")

          if [ "$NODE_MAJOR" -lt 20 ]; then
            echo "ERROR: Angular requires Node.js 20.19+ or Node.js 22.12+."
            exit 1
          fi
        '''
      }
    }

    stage('Install dependencies') {
      when {
        expression {
          return !params.SKIP_INSTALL
        }
      }

      steps {
        sh '''
          set -e
          npm ci
        '''
      }
    }

    stage('Build') {
      steps {
        sh '''
          set -e

          npm run build

          if [ ! -d "${BUILD_DIR}" ]; then
            echo "ERROR: Build directory does not exist: ${BUILD_DIR}"
            exit 1
          fi

          if [ ! -f "${BUILD_DIR}/index.html" ]; then
            echo "ERROR: index.html was not generated."
            exit 1
          fi

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

            SSH_OPTIONS="-o BatchMode=yes -o ConnectTimeout=10 -o StrictHostKeyChecking=yes"

            echo "Testing SSH connection..."

            ssh ${SSH_OPTIONS} \
              "${DEPLOY_USER}@${DEPLOY_HOST}" \
              "whoami && hostname"

            echo "Preparing deployment directory..."

            ssh ${SSH_OPTIONS} \
              "${DEPLOY_USER}@${DEPLOY_HOST}" \
              "sudo mkdir -p '${DEPLOY_PATH}' &&
               sudo chown -R '${DEPLOY_USER}':'${DEPLOY_USER}' '${DEPLOY_PATH}'"

            echo "Uploading Angular build..."

            rsync -az --delete \
              -e "ssh ${SSH_OPTIONS}" \
              "${BUILD_DIR}/" \
              "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/"

            echo "Validating deployed application..."

            ssh ${SSH_OPTIONS} \
              "${DEPLOY_USER}@${DEPLOY_HOST}" \
              "test -f '${DEPLOY_PATH}/index.html' &&
               sudo nginx -t &&
               sudo systemctl reload nginx"

            echo "Deployed successfully to ${DEPLOY_LABEL} (${DEPLOY_HOST})"
          '''
        }
      }
    }

    stage('Verify deployment') {
      steps {
        sh '''
          set -e

          echo "Checking website from Jenkins..."

          curl \
            --fail \
            --silent \
            --show-error \
            --connect-timeout 10 \
            --max-time 20 \
            "http://${DEPLOY_HOST}/" > /dev/null

          echo "Website returned a successful HTTP response."
        '''
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

    aborted {
      echo "Pipeline aborted — ${params.ENVIRONMENT}"
    }

    always {
      cleanWs(deleteDirs: true, notFailBuild: true)
    }
  }
}