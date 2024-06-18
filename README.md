## Getting Started

### Step 1: Set up the Development Environment

You need to set up your development environment before you can do anything.

#### Install Node.js and NPM:

- **On OSX:**
  Open your terminal and run the following command to install Node.js and NPM using Homebrew:

  ```bash
  brew install node
  ```

- **On Windows:**
  Open Command Prompt or PowerShell and run the following command to install Node.js and NPM using Chocolatey:
  ```bash
  choco install nodejs
  ```

#### Install Dependencies:

Once Node.js and NPM are installed, navigate to your project directory and run the following command to install all dependencies using Yarn:

```bash
yarn install
```

### Step 2: Database Migrations

Migrations are used to set up your database schema. Here are the steps to create and run migrations.

#### How to Create a Migration:

Run the following command to generate a new migration file. Replace `create-namatable` with the name of your migration:

```bash
npx sequelize-cli migration:generate --name create-namatable
```

#### How to Run Migration:

After creating your migration files, run the following command to apply all pending migrations to the database:

```bash
npx sequelize-cli db:migrate
```

### Step 3: Seeders

Seeders are used to populate your database with initial data. Here are the steps to create and run seeders.

#### Creating a New Seeder:

Run the following command to generate a new seeder file. Replace `nama_seeder` with the name of your seeder:

```bash
npx sequelize-cli seed:generate --name nama_seeder
```

#### How to Run Seeders:

After creating your seeder files, run the following command to execute all seeders and populate your database with initial data:

```bash
npx sequelize-cli db:seed:all
```

### Summary

1. **Install Node.js and NPM** using Homebrew (OSX) or Chocolatey (Windows).
2. **Install Dependencies** with `yarn install`.
3. **Create a Migration** with `npx sequelize-cli migration:generate --name create-namatable`.
4. **Run Migrations** with `npx sequelize-cli db:migrate`.
5. **Create a Seeder** with `npx sequelize-cli seed:generate --name nama_seeder`.
6. **Run Seeders** with `npx sequelize-cli db:seed:all`.
