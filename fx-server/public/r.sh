#!/bin/bash

# Function to create file and open in code-server
create_and_edit() {
    local file_path="$1"
    local dir_name=$(dirname "$file_path")
    
    # Create directory if it doesn't exist
    mkdir -p "$dir_name"
    
    # Create file
    touch "$file_path"
    
    # Open file in code-server
    code-server "$file_path"
    
    # Wait for user input
    read -p "Press Enter when you're done editing $file_path..."
}

# Create project directory
mkdir -p my-fx-project
cd my-fx-project

# List of files to create
files=(
    "index.html"
    "main.js"
    "manifest.js"
    "components/fx-layout.html"
    "components/fx-counter.html"
    "styles/main.css"
)

# Create and edit each file
for file in "${files[@]}"; do
    create_and_edit "$file"
done

echo "Project setup complete!"