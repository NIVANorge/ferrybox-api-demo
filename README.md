# Ferrybox API

This repo serves as a simple demo of the Ferrybox API

## Token

In order to access the API, you'll need to aquire a token named "service-account-token.json" and place it in this folder

## prerequisites

the demo requires nodejs and npm. It was tested on node v10.1.0 and v10.16.3 (current LTS), but should probably work for most versions of node.

## Running

```
// first place service-account-token.json in this directory
npm install
node ferrybox-api-demo.js
```