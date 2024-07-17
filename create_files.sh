#!/bin/bash

# Array of filenames and their paths
files=(
    "modules/user.js"
    "modules/product.js"
    "modules/utils.js"
    "modules/multipleExports.js"
    "modules/log.js"
    "fx.js"
    "manifest.js"
    "main.js"
    "generate_hashes.php"
)

# Function to create a file and open it with Code-Server
create_and_edit_file() {
    local filepath=$1
    touch $filepath
    code-server $filepath
    echo "Press Enter to continue to the next file..."
    read
}

# Iterate over the list of files
for file in "${files[@]}"; do
    create_and_edit_file $file
done

echo "All files have been created and edited."