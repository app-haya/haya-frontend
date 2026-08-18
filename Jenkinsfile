pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
    timeout(time: 30, unit: 'MINUTES')
  }

  // Poll Git as a fallback if a webhook is not configured.
  // Prefer a GitHub/Git webhook on this job so pushes deploy immediately.
  triggers {
    pollSCM('H/2 * * * *')
  }

  parameters {
    choice(
      name: 'ENVIRONMENT',
      choices: ['auto', 'dev', 'prod'],
      description: 'auto derives the target from the git branch (development→dev, production→prod). Use dev/prod only to override a manual build.'
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
              credential: 'angular-vm-ssh',
              branch: 'development'
            ],
            prod: [
              host: '172.16.1.75',
              user: 'ubuntu',
              label: 'Angular-prod',
              credential: 'angular-prod-vm-ssh',
              branch: 'production'
            ]
          ]

          def branchName = (env.BRANCH_NAME ?: env.GIT_BRANCH ?: '')
            .replaceFirst('^refs/heads/', '')
            .replaceFirst('^origin/', '')

          def resolvedEnv = params.ENVIRONMENT

          if (!resolvedEnv || resolvedEnv == 'auto') {
            if (branchName == 'development') {
              resolvedEnv = 'dev'
            } else if (branchName == 'production') {
              resolvedEnv = 'prod'
            } else {
              error """
              No automatic deployment for branch '${branchName ?: '(unknown)'}'.
              Push to 'development' or 'production', or start a manual build with ENVIRONMENT=dev or prod.
              """
            }
          }

          def target = targets[resolvedEnv]

          if (!target) {
            error "Unknown ENVIRONMENT: ${resolvedEnv}"
          }

          // Keep env.ENVIRONMENT in sync so later shell stages (Build) use the resolved value.
          env.ENVIRONMENT = resolvedEnv
          env.GIT_BRANCH_NAME = branchName
          env.DEPLOY_HOST = target.host
          env.DEPLOY_USER = target.user
          env.DEPLOY_LABEL = target.label
          env.SSH_CREDENTIALS_ID = target.credential

          echo """
          Deployment target:
          Branch: ${branchName ?: '(unknown)'}
          Environment: ${env.ENVIRONMENT}
          Server: ${env.DEPLOY_LABEL}
          Host: ${env.DEPLOY_HOST}
          Path: ${params.DEPLOY_PATH}
          Credential: ${env.SSH_CREDENTIALS_ID}
          """
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

          if [ "${ENVIRONMENT}" = "prod" ]; then
            echo "Building for PRODUCTION (api.hayaapp.sa)"
            npm run build:prod
          else
            echo "Building for DEVELOPMENT (dev-api.hayaapp.sa)"
            npm run build:dev
          fi

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
      echo "Pipeline succeeded — ${env.ENVIRONMENT} (${env.DEPLOY_LABEL})"
    }

    failure {
      echo "Pipeline failed — ${env.ENVIRONMENT ?: params.ENVIRONMENT}"
    }

    aborted {
      echo "Pipeline aborted — ${env.ENVIRONMENT ?: params.ENVIRONMENT}"
    }

    always {
      cleanWs(deleteDirs: true, notFailBuild: true)
    }
  }
}