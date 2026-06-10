#!/usr/bin/env tsx

import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

interface PackageJson {
  name: string;
  version: string;
}

function fail(message: string): never {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function readReleaseNotes(version: string): string {
  if (!existsSync('CHANGES.md')) fail('CHANGES.md not found');
  const sections = readFileSync('CHANGES.md', 'utf-8').split(/^## /m);
  const match =
    sections.find((s) => s.trimStart().startsWith(`v${version}`)) ??
    sections.find((s) => s.trim().length > 0 && !s.startsWith('# '));
  if (!match) fail('No release notes found in CHANGES.md');
  // Drop the heading line, keep the bullet points.
  return match.split('\n').slice(1).join('\n').trim();
}

function main(): void {
  const version = process.argv[2];
  if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
    fail('Usage: npm run release <version>  (e.g. 2.2.0)');
  }

  const pkg: PackageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
  const notes = readReleaseNotes(version);

  console.log(`🎯 Releasing v${version}\n`);

  pkg.version = version;
  writeFileSync('package.json', `${JSON.stringify(pkg, null, 2)}\n`);

  console.log('📦 Building Chrome zip...');
  execSync('npm run zip', { stdio: 'inherit' });

  console.log('🦊 Building Firefox zip...');
  execSync('npm run zip:firefox', { stdio: 'inherit' });

  console.log('🔖 Committing, tagging and pushing...');
  const tagMsg = `${version}\n\n${notes}`;
  execSync('git add package.json CHANGES.md', { stdio: 'inherit' });
  execSync(`git commit -m "${version}: release"`, { stdio: 'inherit' });
  execSync(`git tag -a ${version} -F -`, {
    input: tagMsg,
    stdio: ['pipe', 'inherit', 'inherit'],
  });
  execSync('git push', { stdio: 'inherit' });
  execSync(`git push origin ${version}`, { stdio: 'inherit' });

  console.log(`\n🎉 Release v${version} tagged and pushed!`);
  console.log('   Upload the zips from .output/ to AMO / Chrome Web Store.');
}

main();
