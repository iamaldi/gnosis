# Gnosis
A collaborative knowledge base implemented using Markdown, GitHub Pages, and GitHub Actions.

## How does it work?

All contributed content\* is parsed and indexed on successful push commits to the `main` branch. The indexed results are accessible via the search functionality which can be found at the GitHub Pages [deployment](../../deployments/activity_log?environment=github-pages) of the repository.

\* Currently only Markdown Tables are supported (see below). Free Markdown text is an additional feature under consideration.

## Adding content to the knowledge base

Contributing to the knowledge base is straight forward. You can add/edit content by simply adding or editing a table row on the existing [content](./content) files. Additionally, you can use the following format to create a new document inside the `content/` folder.

```md
# Category, e.g. A1 - Injection 

| Type | Description | Impact | Mitigation | OWASP | CWE |
|:-:|:-:|:-:|:-:|:-:|:-:|
| Text | Text | Text | Text | URL to OWASP | URL to CWE |
```

# Contributors

- [@Screamfull](https://dribbble.com/Screamfull) - UI/UX Design
- [@JorgePap](https://github.com/JorgePap) - Web Development
