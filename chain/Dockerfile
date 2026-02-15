FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies including hardhat
RUN npm install

# Copy the rest of the project
COPY . .

# Expose the Hardhat node port
EXPOSE 8545

# Run the Hardhat node
CMD ["npx", "hardhat", "node", "--hostname", "0.0.0.0"]
