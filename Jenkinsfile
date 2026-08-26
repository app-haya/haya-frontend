def githubRepository() {
  String gitUrl = env.GIT_URL ?: ''
  String repo = gitUrl
    .replaceFirst(/.*github\.com[:\/]/, '')
    .replaceFirst(/\.git$/, '')
    .replaceFirst(/\/$/, '')

  return repo ?: 'app-haya/haya-frontend'
}

def githubEnvironmentUrl() {
  return env.GITHUB_ENVIRONMENT_URL ?: "http://${env.DEPLOY_HOST}/"
}

def withGithubToken(Closure body) {
  withCredentials([
    usernamePassword(
      credentialsId: env.GITHUB_DEPLOYMENT_CREDENTIALS_ID,
      usernameVariable: 'GITHUB_USERNAME',
      passwordVariable: 'GITHUB_TOKEN'
    )
  ]) {
    body()
  }
}

def githubCurl(String method, String path) {
  sh 'mkdir -p build'

  return sh(
    script: """
      set -e

      curl -sS \\
        -o build/github-response.json \\
        -w '%{http_code}' \\
        -X '${method}' \\
        -H "Authorization: Bearer \${GITHUB_TOKEN}" \\
        -H "Accept: application/vnd.github+json" \\
        -H "X-GitHub-Api-Version: 2022-11-28" \\
        -H "Content-Type: application/json" \\
        --data-binary @build/github-request.json \\
        "${env.GITHUB_API_URL}${path}"
    """,
    returnStdout: true
  ).trim()
}

def githubResponseId() {
  return sh(
    script: '''
      node -e 'const fs=require("fs"); const json=JSON.parse(fs.readFileSync("build/github-response.json","utf8")); process.stdout.write(String(json.id||""));'
    ''',
    returnStdout: true
  ).trim()
}

def githubResponseMessage() {
  return sh(
    script: '''
      node -e '
        const fs = require("fs");
        const text = fs.readFileSync("build/github-response.json", "utf8");
        const json = JSON.parse(text);
        process.stdout.write(json.message || text);
      '
    ''',
    returnStdout: true
  ).trim()
}

def githubDeploymentIsTerminal() {
  return env.GITHUB_DEPLOYMENT_STATE in [
    'success',
    'failure',
    'error',
    'inactive'
  ]
}

def createGithubDeployment() {
  if (!env.GITHUB_ENVIRONMENT || !env.GIT_COMMIT) {
    return
  }

  try {
    withGithubToken {
      withEnv([
        "GH_REF=${env.GIT_COMMIT}",
        "GH_ENVIRONMENT=${env.GITHUB_ENVIRONMENT}",
        "GH_DESCRIPTION=Jenkins ${env.GITHUB_ENVIRONMENT} frontend deploy #${env.BUILD_NUMBER}",
        "GH_PRODUCTION=${env.ENVIRONMENT == 'prod' ? 'true' : 'false'}"
      ]) {
        sh '''
          set -e
          mkdir -p build

          node -e '
            const fs = require("fs");
            fs.writeFileSync(
              "build/github-request.json",
              JSON.stringify({
                ref: process.env.GH_REF,
                environment: process.env.GH_ENVIRONMENT,
                description: process.env.GH_DESCRIPTION,
                auto_merge: false,
                required_contexts: [],
                production_environment: process.env.GH_PRODUCTION === "true",
                transient_environment: false
              })
            );
          '
        '''
      }

      String httpCode = githubCurl(
        'POST',
        "/repos/${githubRepository()}/deployments"
      )
      String deploymentId = githubResponseId()

      if (httpCode != '201' || !deploymentId) {
        String apiMessage = githubResponseMessage()
        error """
GitHub deployment could not be created (HTTP ${httpCode}).
The Jenkins credential ${env.GITHUB_DEPLOYMENT_CREDENTIALS_ID} needs permission to write deployment statuses.
Classic PAT: repo or repo_deployment. Fine-grained: Deployments Read and write.
Response: ${apiMessage}
"""
      }

      env.GITHUB_DEPLOYMENT_ID = deploymentId
      echo "Created GitHub ${env.GITHUB_ENVIRONMENT} deployment ${env.GITHUB_DEPLOYMENT_ID}"
    }

    setGithubDeploymentStatus(
      'in_progress',
      "Deploying ${env.GITHUB_ENVIRONMENT} from Jenkins #${env.BUILD_NUMBER}"
    )

  } catch (err) {
    echo "WARNING: Could not record GitHub deployment status: ${err}"
    unstable("GitHub deployment status could not be recorded: ${err.message}")
  }
}

def setGithubDeploymentStatus(String state, String description) {
  if (!env.GITHUB_DEPLOYMENT_ID) {
    return
  }

  try {
    withGithubToken {
      withEnv([
        "GH_STATE=${state}",
        "GH_DESCRIPTION=${description.take(140)}",
        "GH_ENVIRONMENT=${env.GITHUB_ENVIRONMENT}",
        "GH_LOG_URL=${env.BUILD_URL ?: ''}",
        "GH_ENVIRONMENT_URL=${githubEnvironmentUrl()}"
      ]) {
        sh '''
          set -e
          mkdir -p build

          node -e '
            const fs = require("fs");
            fs.writeFileSync(
              "build/github-request.json",
              JSON.stringify({
                state: process.env.GH_STATE,
                description: process.env.GH_DESCRIPTION,
                environment: process.env.GH_ENVIRONMENT,
                log_url: process.env.GH_LOG_URL,
                environment_url: process.env.GH_ENVIRONMENT_URL,
                auto_inactive: true
              })
            );
          '
        '''
      }

      String httpCode = githubCurl(
        'POST',
        "/repos/${githubRepository()}/deployments/${env.GITHUB_DEPLOYMENT_ID}/statuses"
      )

      if (httpCode != '201' && httpCode != '200') {
        String apiMessage = githubResponseMessage()
        error """
GitHub deployment status '${state}' failed (HTTP ${httpCode}).
Response: ${apiMessage}
"""
      }

      env.GITHUB_DEPLOYMENT_STATE = state
      echo "GitHub ${env.GITHUB_ENVIRONMENT} deployment ${env.GITHUB_DEPLOYMENT_ID}: ${state}"
    }

  } catch (err) {
    echo "WARNING: Could not update GitHub deployment status to ${state}: ${err}"
    unstable("GitHub deployment status could not be updated: ${err.message}")
  }
}

def finalizeGithubDeployment() {
  if (!env.GITHUB_DEPLOYMENT_ID || githubDeploymentIsTerminal()) {
    return
  }

  String result = currentBuild.result ?: currentBuild.currentResult

  if (result == 'SUCCESS' || result == 'UNSTABLE') {
    setGithubDeploymentStatus(
      'success',
      "Deployed to ${env.GITHUB_ENVIRONMENT}"
    )

  } else if (result == 'ABORTED') {
    setGithubDeploymentStatus(
      'error',
      "Jenkins ${env.GITHUB_ENVIRONMENT} deploy was aborted"
    )

  } else {
    // FAILURE, NOT_BUILT, or any other non-success result
    setGithubDeploymentStatus(
      'failure',
      "Jenkins ${env.GITHUB_ENVIRONMENT} deploy failed"
    )
  }
}

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

    /*
     * Same credential as haya-backend Jenkinsfile.
     * Checkout can stay on github-pat-readonly, but that PAT must also be
     * allowed to write deployment statuses on app-haya/haya-frontend:
     *   - classic: repo or repo_deployment
     *   - fine-grained: Deployments Read and write on app-haya/haya-frontend
     *
     * Statuses appear on the commit and under the repo Environments tab.
     */
    GITHUB_DEPLOYMENT_CREDENTIALS_ID = 'github-pat-readonly'
    GITHUB_API_URL = 'https://api.github.com'
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
              branch: 'development',
              githubEnvironment: 'development',
              environmentUrl: 'http://172.16.3.108/'
            ],
            prod: [
              host: '172.16.1.75',
              user: 'ubuntu',
              label: 'Angular-prod',
              credential: 'angular-prod-vm-ssh',
              branch: 'production',
              githubEnvironment: 'production',
              environmentUrl: 'http://172.16.1.75/'
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

          // Parameters are not always exported into the shell env on Multibranch jobs.
          // Copy every value the later `sh` steps need onto `env.*`.
          env.ENVIRONMENT = resolvedEnv
          env.GITHUB_ENVIRONMENT = target.githubEnvironment
          env.GITHUB_ENVIRONMENT_URL = target.environmentUrl
          env.GIT_BRANCH_NAME = branchName
          env.DEPLOY_HOST = target.host
          env.DEPLOY_USER = target.user
          env.DEPLOY_LABEL = target.label
          env.SSH_CREDENTIALS_ID = target.credential
          env.DEPLOY_PATH = (params.DEPLOY_PATH ?: '').trim() ?: '/var/www/html'

          echo """
          Deployment target:
          Branch: ${branchName ?: '(unknown)'}
          Environment: ${env.ENVIRONMENT}
          GitHub environment: ${env.GITHUB_ENVIRONMENT}
          GitHub environment URL: ${env.GITHUB_ENVIRONMENT_URL}
          Server: ${env.DEPLOY_LABEL}
          Host: ${env.DEPLOY_HOST}
          Path: ${env.DEPLOY_PATH}
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
        script {
          createGithubDeployment()

          try {
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
          } catch (err) {
            setGithubDeploymentStatus(
              'failure',
              "Deploy to ${env.GITHUB_ENVIRONMENT} failed in Jenkins #${env.BUILD_NUMBER}"
            )
            throw err
          }
        }
      }
    }

    stage('Verify deployment') {
      steps {
        script {
          try {
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

            setGithubDeploymentStatus(
              'success',
              "Deployed ${env.GITHUB_ENVIRONMENT} from Jenkins #${env.BUILD_NUMBER}"
            )
          } catch (err) {
            setGithubDeploymentStatus(
              'failure',
              "Verify ${env.GITHUB_ENVIRONMENT} failed in Jenkins #${env.BUILD_NUMBER}"
            )
            throw err
          }
        }
      }
    }
  }

  post {
    always {
      script {
        // Safety net: always close out a non-terminal GitHub deployment
        // (covers failures before Deploy try/catch, aborts, etc.)
        finalizeGithubDeployment()
      }

      cleanWs(deleteDirs: true, notFailBuild: true)
    }

    success {
      echo """
Angular pipeline completed successfully.

Environment: ${env.ENVIRONMENT ?: 'none'}
Server: ${env.DEPLOY_LABEL ?: 'n/a'}
GitHub deployment: ${env.GITHUB_DEPLOYMENT_ID ?: 'none'} (${env.GITHUB_DEPLOYMENT_STATE ?: 'n/a'})
"""
    }

    failure {
      script {
        // Explicit failure path so GitHub is updated even if always/finalize
        // cannot see the final build result yet.
        if (env.GITHUB_DEPLOYMENT_ID && !githubDeploymentIsTerminal()) {
          setGithubDeploymentStatus(
            'failure',
            "Jenkins ${env.GITHUB_ENVIRONMENT} deploy failed"
          )
        }
      }
      echo "Pipeline failed — ${env.ENVIRONMENT ?: params.ENVIRONMENT}"
    }

    aborted {
      script {
        if (env.GITHUB_DEPLOYMENT_ID && !githubDeploymentIsTerminal()) {
          setGithubDeploymentStatus(
            'error',
            "Jenkins ${env.GITHUB_ENVIRONMENT} deploy was aborted"
          )
        }
      }
      echo "Pipeline aborted — ${env.ENVIRONMENT ?: params.ENVIRONMENT}"
    }
  }
}
