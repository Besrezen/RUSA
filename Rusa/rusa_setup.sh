#!/bin/bash

# This script was tested in Linux Mint 22

# Make sure that setup script is executable before installation:
# chmod +x rusa_setup.sh
# Then run in terminal:
# sudo ./rusa_setup.sh

# Function to clone the repository and check for errors
clone_repository() {
	echo "Installing git..."
    sudo apt-get update
	sudo apt-get install -y git
	echo "Cloning the repository from GitHub..."
    cd /home/
    git clone https://github.com/Besrezen/RUSA.git
    if [ $? -ne 0 ]; then
        echo "Error: Failed to clone the repository. Exiting."
        exit 1
    fi
}

# Function to install Docker and Docker Compose
install_docker() {
    echo "Updating system and installing required packages..."
    sudo apt-get install -y \
        apt-transport-https \
        ca-certificates \
        curl \
        gnupg-agent \
        software-properties-common

    echo "Removing old Docker versions..."
    sudo apt-get remove -y docker docker-engine docker.io containerd runc

    echo "Installing Docker..."
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
    sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io

    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose

    echo "Restarting Docker daemon..."
    sudo systemctl restart docker

    echo "Verifying Docker installation..."
    sudo docker --version
    echo "Verifying Docker Compose installation..."
    docker-compose --version

    echo "Setting up the project using Docker..."
    cd /home/RUSA/Rusa/
    docker-compose build
    docker-compose up
}

# Function to deploy using Python virtual environment
install_venv() {
    echo "Updating system and installing required packages..."
    sudo apt-get install -y python3-venv python3-pip

    echo "Setting up the project using Python venv..."
    cd /home/RUSA/Rusa
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    python manage.py makemigrations
    python manage.py migrate
    python manage.py runserver 0.0.0.0:8000
}



# Prompt user to choose installation type
echo "Choose the installation type:"
echo "1) Docker"
echo "2) Python venv"
read -p "Enter your choice (1 or 2): " choice

# Clone the repository before proceeding
clone_repository

# Perform the selected installation
if [ "$choice" -eq 1 ]; then
    install_docker
elif [ "$choice" -eq 2 ]; then
    install_venv
else
    echo "Invalid choice. Please run the script again and select 1 or 2."
    exit 1
fi