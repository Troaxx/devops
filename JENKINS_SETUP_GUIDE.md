# Jenkins Pipeline Setup Guide

## Step 1: Access Jenkins

1. Open browser and go to: **http://localhost:8080**
2. Login with credentials:
   - Username: `gengyue`
   - Password: [your password]

## Step 2: Create New Pipeline Job

1. Click **"New Item"** on the left sidebar
2. Enter item name: `chess-ranking-pipeline`
3. Select **"Pipeline"** as the project type
4. Click **OK**

## Step 3: Configure Pipeline

### General Settings

1. Check **"GitHub project"**
   - Project url: `https://github.com/Troaxx/devops`

2. Under **"Build Triggers"**, check:
   - ☑ **Poll SCM**
   - Schedule: `* * * * *` (polls every minute for demo purposes)

### Pipeline Configuration

1. Under **"Pipeline"** section:
   - Definition: Select **"Pipeline script from SCM"**
   - SCM: Select **"Git"**

2. **Repository Configuration**:
   - Repository URL: `https://github.com/Troaxx/devops.git`
   - Credentials: Click **"Add"** → **"Jenkins"**
     - Kind: Username with password
     - Username: [Your GitHub username]
     - Password: [Your GitHub Personal Access Token]
     - ID: `github-credentials`
     - Description: `GitHub Access`
   - Select the credentials you just created

3. **Branches to build**:
   - Branch Specifier: `*/update_gengyue`

4. **Script Path**:
   - Script Path: `Jenkinsfile`

5. Click **"Save"**

## Step 4: Test Pipeline

1. Click **"Build Now"** to trigger the first build
2. Watch the build progress in **"Build History"**
3. Click on the build number (e.g., #1) to see details
4. Click **"Console Output"** to view detailed logs

## Expected Pipeline Stages

The pipeline will execute these stages:

1. ✅ **Checkout** - Pull code from GitHub
2. ✅ **Install Dependencies** - Run `npm install`
3. ✅ **Run Tests** - Execute unit, API, and frontend tests
4. ✅ **Build Docker Image** - Create Docker image with Minikube
5. ✅ **Deploy to Kubernetes** - Deploy to Minikube cluster
6. ✅ **Verify Deployment** - Check pods and services

## Step 5: Verify Automated Trigger

1. Make a small code change (e.g., edit README.md)
2. Commit and push to `update_gengyue` branch
3. Wait 1 minute (poll interval)
4. Jenkins should automatically detect the change and trigger a new build

## Troubleshooting

### Issue: Docker commands fail

**Solution**: Ensure Jenkins container has access to Docker
```bash
docker exec -it jenkins bash
docker ps  # Should show containers
```

### Issue: kubectl commands fail

**Solution**: Jenkins needs kubectl configured
```bash
# Copy kubectl config to Jenkins container
docker cp C:\Users\gengy\.kube jenkins:/var/jenkins_home/.kube
```

### Issue: Build fails at npm install

**Solution**: Check Node.js is available in Jenkins
- Install NodeJS plugin in Jenkins
- Configure Node.js installation in Global Tool Configuration

## Demo Checklist

- [ ] Pipeline is configured and saved
- [ ] First manual build completed successfully
- [ ] All 6 stages completed
- [ ] Application is deployed to Kubernetes
- [ ] Pods are running (verify with `kubectl get pods`)
- [ ] Service is accessible
- [ ] Make a code change to test automated trigger
- [ ] Wait for automatic build
- [ ] Verify new build triggered automatically
- [ ] All stages pass again

## Next Steps

After Jenkins is configured:
1. Test the complete CI/CD flow
2. Take screenshots of each stage
3. Document the process
4. Prepare for 10-minute demo
