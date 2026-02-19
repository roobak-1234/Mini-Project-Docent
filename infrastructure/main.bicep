param location string = resourceGroup().location
param appName string = 'lifelink-ai'

// Azure App Service Plan (Server Farm)
resource appServicePlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: '${appName}-plan'
  location: location
  sku: {
    name: 'B1' // Basic Tier
    tier: 'Basic'
  }
}

// Backend API (App Service)
resource backendApp 'Microsoft.Web/sites@2022-03-01' = {
  name: '${appName}-api'
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
        appSettings: [
            {
                name: 'WEBSITE_NODE_DEFAULT_VERSION'
                value: '~20'
            }
        ]
    }
  }
}

// Frontend (Static Web App is preferred for React, but standard Web App requested here for general template)
// If using Azure Static Web Apps:
resource staticWebApp 'Microsoft.Web/staticSites@2022-03-01' = {
    name: '${appName}-web'
    location: location
    sku: {
        name: 'Free'
        tier: 'Free'
    }
    properties: {
        repositoryUrl: 'https://github.com/your-repo/lifelink-ai'
        branch: 'main'
        buildProperties: {
            appLocation: 'apps/web-dashboard'
            apiLocation: 'services/backend-api'
            outputLocation: 'build'
        }
    }
}

output websiteUrl string = staticWebApp.properties.defaultHostname
output apiUrl string = backendApp.properties.defaultHostName
