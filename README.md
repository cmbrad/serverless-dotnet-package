# serverless-dotnet-package

[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)
[![npm version](https://badge.fury.io/js/serverless-dotnet-package.svg)](https://badge.fury.io/js/serverless-dotnet-package)
[![license](https://img.shields.io/npm/l/serverless-dotnet-package.svg)](https://www.npmjs.com/package/serverless-dotnet-package)

This plugin automatically runs `dotnet restore` and `dotnet lambda package` during package and deployment of Serverless functions. This removes the need for extra build scripts to run these commands manually.

Tested against Serverless v1.17.0

Inspired by https://github.com/fruffin/serverless-dotnet

## Prerequisites
To use this package you will need to have dotnet core installed for use of the `dotnet` command line binary.

Available from: https://www.microsoft.com/net/core

## Installation

To install, add serverless-dotnet-package to your `package.json`:

```
npm install serverless-dotnet-package --save
```

Now add the plugin to your `serverless.yml`:

```yaml
plugins:
  - serverless-dotnet-package
```

## Usage

The default settings of the plugin will create a package with just the compiled code using Release mode and netcoreapp1.0.

### Options

An example of all options is:

```yaml
  dotnetpackage:
    include:
      - extra/**
    configuration: Debug
    framework: netcoreapp1.1
```

#### Extra files
Sometimes it can be helpful to include extra files along with your compiled code. This can be done by listing globs of files to include in the include section. This is similar to the default Serverless mechanism of including extra files.

```yaml
  dotnetpackage:
    include:
      - extra/**
```

#### Release mode and framework
Configuration can be changed to Debug mode, and different versions of the framework. The default options use Release mode and netcoreapp1.0 - this can be changed as in the example to other options.

```yaml
  dotnetpackage:
    configuration: Debug
    framework: netcoreapp1.1
```

## Note

This package overrides the default packaging behaviour of Serverless and thus the default include/exclude options of the framework will do nothing.
