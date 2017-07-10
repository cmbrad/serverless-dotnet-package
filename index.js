'use strict';

const Promise = require('bluebird');
const program = require('child_process');
var fs = require('fs');
const path = require('path');
const glob = require('glob-all');
var archiver = require('archiver');
var unzip = require('unzip');

class ServerlessDotnetDeploy {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.settings = this.serverless.service.custom.dotnetpackage;

    let zipFileName = `${this.serverless.service.service}.zip`;
    this.artifactPath = path.join(this.serverless.config.servicePath, '.serverless', zipFileName);

    this.hooks = {
      'before:package:createDeploymentArtifacts': () => Promise.bind(this).then(this.restoreDependencies),
      'after:package:createDeploymentArtifacts': () => Promise.bind(this).then(this.createPackage).then(this.extractPackage).then(this.createPackageWithExtraFiles)
    };
  }

  restoreDependencies() {
    return new Promise(function(resolve, reject) {
      this.serverless.cli.log('Restoring dotnet packages');
      program.exec('dotnet restore', function(error, stdout, stderr) {
        console.log(stdout);

        if (error) {
          console.log(stderr);
          reject(stderr);
        }

        resolve();
      });
    }.bind(this));
  }

  createPackage() {
    return new Promise(function(resolve, reject) {
      let configuration = this.settings.configuration || 'Release';
      let framework = this.settings.framework || 'netcoreapp1.0';

      this.serverless.cli.log(`Creating ${configuration} package using ${framework} in ${this.artifactPath}`);
      
      program.exec(`dotnet lambda package -c ${configuration} -f ${framework} -o ${this.artifactPath}`, function(error, stdout, stderr) {
        console.log(stdout);

        if (error) {
          console.log(stderr);
          reject(stderr);
        }

        resolve();
      });
    }.bind(this));
  }

  extractPackage() {
    return new Promise(function(resolve, reject) {
      this.serverless.cli.log('Extracting package...');
      fs.createReadStream(this.artifactPath).pipe(unzip.Extract({ path: path.join('.serverless', 'tmp')})).on('close', function() {
        resolve();
      });;
    }.bind(this));
  }

  createPackageWithExtraFiles() {
    return new Promise(function(resolve, reject) {
      if (typeof this.serverless.service.custom.dotnetpackage.include === 'undefined') {
        this.serverless.cli.log('No extra files to add to package');
        resolve();
      }
      this.serverless.cli.log('Creating package with extra files');

      var output = fs.createWriteStream(this.artifactPath);
      var archive = archiver('zip');
      archive.pipe(output);

      // Add original files back to package
      let globs = this.serverless.service.custom.dotnetpackage.include;
      archive.glob('**', {cwd: path.join('.serverless', 'tmp')});

      // Add extra files to package
      this.serverless.service.custom.dotnetpackage.include.forEach((pattern) => {
        archive.glob(pattern);
      });

      // Save the package
      archive.finalize();
    }.bind(this));
  }
}

module.exports = ServerlessDotnetDeploy;
