## Getting Started

### Step 1: Set up the Development Environment

You need to set up your development environment before you can do anything.

- **Install Node.js and NPM:**

  - On OSX, use homebrew `brew install node`
  - On Windows, use chocolatey `choco install nodejs`

- **Install Dependencies:**
  Install all dependencies with `yarn install`

### How to Create a Migration:

```bash
npx sequelize-cli migration:generate --name create-namatable
```

### How to Run Migration:

```bash
npx sequelize-cli db:migrate
```

### Creating a New Seeder:

```bash
npx sequelize-cli seed:generate --name nama_seeder
```

### How to Run Seeders:

```bash
npx sequelize-cli db:seed:all
```
