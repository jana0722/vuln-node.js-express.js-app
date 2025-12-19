Full-Spectrum Web App Hardening Project
Project Overview
This project demonstrates a complete security assessment and hardening process for a vulnerable Node.js + Express application. It includes:

Dynamic Application Security Testing (DAST)
Static Application Security Testing (SAST) with Semgrep
Custom security rule creation
Vulnerability remediation
Re-testing and validation

Prerequisites

Node.js (v14 or higher)
npm or yarn
Python 3.x (for Semgrep)
OWASP ZAP (for DAST)
Postman (for manual testing)

Installation & Setup
1. Clone the Repository
bashgit clone https://github.com/SirAppSec/vuln-node.js-express.js-app.git
cd vuln-node.js-express.js-app
2. Install Dependencies
bashnpm install
3. Configure Environment Variables
bashcp .env.example .env
# Edit .env with your configuration
4. Run the Application
bash# Development mode
npm run dev

# Production mode
npm start
The application will be available at: http://localhost:3000

Security Testing
Phase A - Dynamic Testing (DAST)
Running OWASP ZAP
Option 1: GUI Mode
bash# Start OWASP ZAP
zap.sh  # Linux/Mac
zap.bat # Windows

# In ZAP GUI:
# 1. Set target: http://localhost:5000
# 2. Click "Automated Scan"
# 3. Start the scan
# 4. Review results in "Alerts" tab
Option 2: Command Line (Headless)
bash# Quick scan
zap.sh -quickurl http://localhost:5000 -quickout zap_report.html

# Full scan
zap.sh -cmd -quickurl http://localhost:5000 -quickprogress -quickout zap_report.xml
Option 3: Docker
bashdocker run -t owasp/zap2docker-stable zap-baseline.py -t http://localhost:5000
Manual Testing with Postman

Import the Postman collection from /tests/postman_collection.json
Test each endpoint with malicious payloads
Export requests as cURL commands for documentation

Example Test Cases:
bash# SQL Injection Test
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin'\'' OR 1=1--", "password": "anything"}'

# XSS Test
curl -X POST http://localhost:5000/api/comment \
  -H "Content-Type: application/json" \
  -d '{"text": "<script>alert(\"XSS\")</script>"}'

# CSRF Test
curl -X POST http://localhost:5000/api/transfer \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000, "to": "attacker"}'

# IDOR Test
curl -X GET http://localhost:5000/api/users/5/details \
  -H "Authorization: Bearer <user1_token>"

Phase B - Static Analysis (SAST)
Installing Semgrep
bash# Using pip
pip install semgrep

# Using Homebrew (Mac)
brew install semgrep

# Using Docker
docker pull returntocorp/semgrep
Running Semgrep with Built-in Rules
Basic Scan:
bash# Scan with JavaScript rules
semgrep --config "p/javascript" .

# Scan with Node.js specific rules
semgrep --config "p/nodejs" .

# Scan with security-focused rules
semgrep --config "p/security-audit" .

# Combine multiple rulesets
semgrep --config "p/javascript" --config "p/nodejs" --config "p/security-audit" .
Output Options:
bash# Save results to JSON
semgrep --config "p/javascript" --json -o semgrep_results.json .

# Save results to SARIF format
semgrep --config "p/javascript" --sarif -o semgrep_results.sarif .

# Show only errors (no warnings)
semgrep --config "p/javascript" --error .

# Verbose output
semgrep --config "p/javascript" --verbose .
Running Semgrep with Custom Rules
Scan with custom rules:
bash# Run with custom rules directory
semgrep --config semgrep-rules/ .

# Run with specific custom rule file
semgrep --config semgrep-rules/sql-injection.yml .

# Combine built-in and custom rules
semgrep --config "p/javascript" --config semgrep-rules/ --error .
Test a specific rule:
bash# Test rule against specific file
semgrep --config semgrep-rules/sql-injection.yml src/routes/userRoutes.js

# Validate rule syntax
semgrep --validate --config semgrep-rules/
Example Custom Rules Location
project-root/
├── semgrep-rules/
│   
│   ├── missing-csrf.yml
│   ├── idor.yml
│   └── ssrf.yml

Vulnerability Summary
Discovered Vulnerabilities (8+)
IDVulnerabilityOWASP CategoryEndpointStatusV1SQL InjectionA03: InjectionPOST /api/login✅ FixedV2Cross-Site Scripting (XSS)A03: InjectionPOST /api/comment✅ FixedV3CSRFA01: Broken Access ControlPOST /api/transfer✅ FixedV4IDORA01: Broken Access ControlGET /api/users/:id✅ FixedV5SSRFA10: Server-Side Request ForgeryPOST /api/fetch-url✅ FixedV6Open RedirectA01: Broken Access ControlGET /redirect✅ FixedV7Insecure CookiesA05: Security MisconfigurationAll endpoints✅ FixedV8Insecure JWTA02: Cryptographic FailuresJWT verification✅ Fixed

Re-testing After Fixes
Re-run DAST
bash# Start the fixed application
npm run dev

# Run ZAP scan again
zap.sh -quickurl http://localhost:5000 -quickout zap_report_after.html

# Test with Postman (same requests as Phase A)
# Verify that attacks now fail
Re-run Semgrep
bash# Run with all rules
semgrep --config "p/javascript" --config "p/nodejs" --config semgrep-rules/ --error .

# Compare before and after
# Before: X findings
# After: Y findings (should be significantly reduced)

Project Structure
.
├── src/
│   ├── controllers/      # Request handlers
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   ├── models/           # Database models
│   └── utils/            # Helper functions
├── semgrep-rules/        # Custom Semgrep rules
├── tests/                # Test files and Postman collections
├── docs/                 # Documentation and screenshots
├── .env.example          # Environment variables template
├── package.json
└── README.md

Key Security Improvements
1. SQL Injection Prevention

✅ Replaced string concatenation with parameterized queries
✅ Using ORM (Sequelize) with proper escaping

2. XSS Prevention

✅ Input validation and sanitization (DOMPurify)
✅ Output encoding
✅ Content Security Policy headers

3. CSRF Protection

✅ CSRF token validation using csurf middleware
✅ SameSite cookie attribute set to 'strict'

4. Access Control

✅ Proper authentication checks
✅ Authorization validation (user owns resource)
✅ Fixed IDOR vulnerabilities

5. SSRF Prevention

✅ URL whitelist implementation
✅ Blocked internal IP ranges
✅ Protocol validation

6. Secure Configuration

✅ Helmet.js for security headers
✅ Secure cookie flags (httpOnly, secure, sameSite)
✅ Rate limiting on sensitive endpoints
✅ Proper JWT configuration (algorithm, expiration)


Testing Checklist

 Application runs successfully
 OWASP ZAP scan completed
 Manual Postman tests performed
 8+ vulnerabilities discovered
 Semgrep scan with built-in rules completed
 Custom Semgrep rules created (3-5 rules)
 All vulnerabilities fixed
 Re-tested with DAST (attacks now fail)
 Re-tested with Semgrep (findings reduced)
 Documentation completed


Additional Resources

OWASP Top 10
Semgrep Documentation
OWASP ZAP User Guide
Node.js Security Best Practices

