# 🚀 Drivechain Launcher

Drivechain Launcher is an **Electron-based desktop application** that allows users to manage and interact with various blockchain nodes, including a version of Bitcoin Core with BIP 300 and BIP 301 enabled, and various drivechains.

## ✨ Features

- 🗂️ **Download and manage multiple blockchain nodes**
- 🔄 **Start and stop individual chains**
- ♻️ **Reset chain data**
- 📊 **View chain details and settings**
- 🌗 **Dark/Light mode toggle**
- 🖥️ **Cross-platform support (Windows, macOS, Linux)**

## 📚 Table of Contents

1. [Installation](#installation)
2. [Usage](#usage)
3. [Project Structure](#project-structure)
4. [Development](#development)
5. [Building](#building)
6. [Contributing](#contributing)
7. [Disclaimer](#disclaimer)

## 🛠️ Installation

To install the Drivechain Launcher, follow these steps:

1. **Clone the repository**:
   ```sh
   git clone https://github.com/seriouscatsoserious/drivechain-launcher.git
   ```
2. **Navigate to the project directory**:
   ```sh
   cd drivechain-launcher
   ```
3. **Install dependencies**:
   ```sh
   npm install
   ```
4. **Update your local copy**:
   After pulling changes from the repository, run `npm install` again to update dependencies.

## 🚀 Usage

To run the application in development mode:

```sh
npm start
```

This will start the Electron app and the React dev server.

### Linux-specific Instructions
When running on Linux from the command line, you might need to run the application with the `--no-sandbox` flag if you encounter sandbox-related errors:

```sh
./drivechain-launcher --no-sandbox
```

For a more secure setup when running from command line, it's recommended to properly configure the Chrome sandbox:
1. Install the required dependencies (on Ubuntu/Debian):
   ```sh
   sudo apt-get install libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2
   ```
2. Set up the Chrome sandbox by following the [official Electron documentation](https://www.electronjs.org/docs/latest/tutorial/sandbox#linux).

## 📂 Project Structure

- `public/`: Contains the main Electron process files
  - `electron.js`: Main Electron process
  - `preload.js`: Preload script for IPC communication
- `src/`: Contains React components and application logic
  - `components/`: React components
  - `contexts/`: React contexts (e.g., ThemeContext)
  - `store/`: Redux store and slices
- `chain_config.json`: Configuration file for supported chains

## ⚙️ Development

The project uses **React** for the frontend and **Electron** for the desktop application wrapper. Key technologies and libraries include:

- ⚛️ React
- 🛠️ Redux (with Redux Toolkit)
- ⚡ Electron
- 🌐 React Router
- 🎨 CSS Modules

To add a new feature or modify existing ones, locate the relevant component in the `src/components/` directory or the appropriate slice in `src/store/`.

## 🏗️ Building

To build the application for production:

```sh
npm run build
```

This will create a production-ready build in the `build/` directory.

Built releases can be downloaded at [releases.drivechain.info](https://releases.drivechain.info) under the "drivechain-launcher" section.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. **Fork the repository**
2. **Create your feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

## ⚠️ Disclaimer

Drivechain Launcher is in heavy development. Features and functionalities may change, and the application may contain bugs. Please use with caution and contribute to the development process to help improve the software.
