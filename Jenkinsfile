pipeline {
  agent any

  options {
    disableConcurrentBuilds()
    timestamps()
  }

  triggers {
    pollSCM('* * * * *')
    cron('H 0 * * *') // Run nightly at midnight 
  }

  environment {
    APP_NAME   = "devops-project"
    IMAGE_TAG  = "${env.BUILD_NUMBER}"
    IMAGE_FULL = "${APP_NAME}:${IMAGE_TAG}"
    DEPLOYMENT = "devops-project-deploy"
  }

  stages {
    stage('Checkout') {
      steps {
        git branch: 'main',
            credentialsId: '0765cf8e-02bc-4005-9a89-7a1ea729647e',
            url: 'https://github.com/Troaxx/devops'
        bat "npm install"
        bat "node scripts/pipeline-logger.js info \"Pipeline Started\" stage=Checkout branch=main"
      }
    }

    stage('Install Dependencies') {
      steps {
        bat "npm install"
      }
    }

    stage('Code Quality & Tests') {
      steps {
        script {
          // Check if build was triggered by the nightly timer
          def isNightly = currentBuild.getBuildCauses().toString().contains('TimerTrigger')
          echo "Is Nightly Build? ${isNightly}"

          if (isNightly) {
            // Run FULL suite (Mobile + Desktop)
            bat "node scripts/pipeline-logger.js info \"Running Nightly Tests\" stage=Tests type=Full"
            bat "npm run test:coverage"
          } else {
            // Run CI suite (Desktop only) for speed
            bat "node scripts/pipeline-logger.js info \"Running CI Tests\" stage=Tests type=CI"
            bat "npm run test:ci"
          }
        }
        // Generate report and check thresholds
        bat "npm run coverage:report"
      }
    }

    stage('Build Docker Image') {
      steps {
        bat "node scripts/pipeline-logger.js info \"Building Docker Image\" stage=Build image=%IMAGE_FULL%"
        bat "docker build -t %IMAGE_FULL% ."
        bat "docker images | findstr %APP_NAME%"
      }
    }

    stage('Start Minikube') {
      steps {
        bat "minikube start --ports=127.0.0.1:30080:30080"
      }
    }

    stage('Load Image to Minikube') {
      steps {
        bat "minikube image load %IMAGE_FULL%"
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        bat "node scripts/pipeline-logger.js info \"Deploying to Kubernetes with Helm\" stage=Deploy"
        bat "helm upgrade --install devops-project ./helm/devops-project --set image.tag=%BUILD_NUMBER% --rollback-on-failure --timeout 120s"
      }
    }

    stage('Verify Rollout') {
      steps {
        bat "kubectl rollout status deployment/%DEPLOYMENT% --timeout=120s"
        bat "kubectl get pods -o wide"
        bat "kubectl get svc"
      }
    }

    stage('Smoke Test') {
      steps {
        bat "kubectl get svc devops-project-service"
        bat "kubectl get endpoints devops-project-service"
      }
    }
  }

  post {
    always {
      echo "Build finished."
      // Archive the coverage reports so they can be viewed in Jenkins
      archiveArtifacts artifacts: 'coverage/**', allowEmptyArchive: true
    }
    success {
      emailext body: """
        <html>
        <body style="font-family: Arial, sans-serif;">
          <div style="background-color: #4CAF50; color: white; padding: 10px; text-align: center;">
            <h2>BUILD SUCCESS</h2>
          </div>
          <div style="padding: 20px; border: 1px solid #ddd;">
            <p><strong>Project:</strong> ${env.JOB_NAME}</p>
            <p><strong>Build Number:</strong> ${env.BUILD_NUMBER}</p>
            <p><strong>Status:</strong> <span style="color: green; font-weight: bold;">Passed</span></p>
            <p>Ref: <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
            <hr>
            <h3>Build Summary</h3>
            <ul>
              <li>Linting: Passed</li>
              <li>Unit Tests: Passed (Coverage Thresholds Met)</li>
              <li>Deployment: Passed</li>
            </ul>
            <p><a href="${env.BUILD_URL}artifact/coverage/jest/lcov-report/index.html">View Backend Coverage</a> | <a href="${env.BUILD_URL}artifact/coverage/playwright-istanbul/index.html">View Frontend Coverage</a></p>
          </div>
        </body>
        </html>
      """,
      mimeType: 'text/html',
      subject: "SUCCESS: ${env.JOB_NAME} [${env.BUILD_NUMBER}] - All Systems Go",
      to: '2404908b@student.tp.edu.sg'
    }
    failure {
      bat "node scripts/pipeline-logger.js error \"Pipeline Failed\" result=Failure"
      emailext body: """
        <html>
        <body style="font-family: Arial, sans-serif;">
          <div style="background-color: #f44336; color: white; padding: 10px; text-align: center;">
            <h2>BUILD FAILED</h2>
          </div>
          <div style="padding: 20px; border: 1px solid #ddd;">
            <p><strong>Project:</strong> ${env.JOB_NAME}</p>
            <p><strong>Build Number:</strong> ${env.BUILD_NUMBER}</p>
            <p><strong>Status:</strong> <span style="color: red; font-weight: bold;">Failed</span></p>
            <p>Check the console output for details.</p>
            <p>Ref: <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>
          </div>
        </body>
        </html>
      """,
      mimeType: 'text/html',
      subject: "FAILURE: ${env.JOB_NAME} [${env.BUILD_NUMBER}] - Action Required",
      to: '2404908b@student.tp.edu.sg'
    }
  }
}
