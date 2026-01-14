pipeline {
  agent any

  options {
    disableConcurrentBuilds()
    timestamps()
  }

  triggers {
    pollSCM('* * * * *')
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
      }
    }

    stage('Install Dependencies') {
      steps {
        // Installs packages from package-lock.json ensuring consistent builds
        bat "npm install"
      }
    }

    stage('Linting') {
      steps {
        // Checks code style/errors (defined in package.json)
        bat "npm run lint"
      }
    }

    stage('Unit Tests') {
      steps {
        // Run backend unit tests
        // We skip frontend tests here to ensure speed and stability in CI
        bat "npm run test:backend"
      }
    }

    stage('Build Docker Image') {
      steps {
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
        powershell '''
          (Get-Content deployment.yaml) `
            -replace "{{BUILD_NUMBER}}", "$env:BUILD_NUMBER" |
          kubectl apply -f -
        '''
        bat "kubectl apply -f service.yaml"
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
        bat "minikube service devops-project-service --url"
      }
    }
  }

  post {
    always {
      echo "Build finished."
    }
    success {
      emailext body: "Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' passed ALL checks (Lint, Test, Deploy).\n\nConsole: ${env.BUILD_URL}",
               subject: "SUCCESS: Jenkins Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
               to: '2404908b@student.tp.edu.sg'
    }
    failure {
      emailext body: "Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' FAILED.\n\nConsole: ${env.BUILD_URL}",
               subject: "FAILURE: Jenkins Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
               to: '2404908b@student.tp.edu.sg'
    }
  }
}
