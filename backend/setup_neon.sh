#!/bin/bash
# Neon CLI Project Initialization Script

echo "Step 1: Installing Neon CLI globally and logging in..."
npm i -g neon@latest && neon login

echo "Step 2: Activating Neon skills..."
neon skills -y

echo "Step 3: Setting up Model Context Protocol (MCP)..."
neon mcp -y

echo "Step 4: Linking project 'nameless-heart-66467457' on 'production' branch..."
neon link --project-id nameless-heart-66467457 --branch production -y

echo "Step 5: Initializing local Neon configuration..."
neon config init

echo "Step 6: Configuration file 'neon.ts' has been created in the workspace."

echo "Step 7: Deploying project infrastructure..."
neon deploy

echo "Initialization complete!"
