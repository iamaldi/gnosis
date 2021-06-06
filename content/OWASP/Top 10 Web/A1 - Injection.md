# A1 - Injection

| Type | Description | Impact | Mitigation | OWASP | CWE |
|:-:|:-:|:-:|:-:|:-:|:-:|
| SQL Injection | SQL Injection vulnerabilities occurr when user-supplied data is concatenated as part of SQL queries. As a result, it is possible to... | Adversaries can ... | Use prepared statements. | https://owasp.org/www-project-top-ten/2017/A1_2017-Injection | https://cwe.mitre.org/data/definitions/89.html |
| Command Injection | Command injection vulnerabilities occurr when user input is included as part of a shell operation. As a result, it is possible to execute arbitrary OS commands... | An attacker can execute arbitrary... | It is highly recommended to ... | https://owasp.org/www-community/attacks/Command_Injection | https://cwe.mitre.org/data/definitions/77.html |