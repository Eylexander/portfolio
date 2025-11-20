#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://192.168.0.131:27017';
const DB_NAME = 'Portfolio';
const COLLECTION_NAME = 'projects';

// Get the locales to export (or all if none specified)
const specifiedLocale = process.argv[2];
const contentDir = path.join(__dirname, '../frontend/content/projects');

async function main() {
  let client;
  try {
    console.log('Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    
    // Get list of locale directories
    const locales = specifiedLocale 
      ? [specifiedLocale]
      : fs.readdirSync(contentDir).filter(item => 
          fs.statSync(path.join(contentDir, item)).isDirectory()
        );
    
    console.log(`Found locales: ${locales.join(', ')}`);
    
    // Read all articles and merge by slug
    const articles = {};
    
    for (const locale of locales) {
      const localeDir = path.join(contentDir, locale);
      if (!fs.existsSync(localeDir)) {
        console.warn(`Locale directory not found: ${localeDir}`);
        continue;
      }
      
      const files = fs.readdirSync(localeDir).filter(f => f.endsWith('.mdx'));
      console.log(`\nProcessing ${locale} locale (${files.length} files)...`);
      
      for (const file of files) {
        const filePath = path.join(localeDir, file);
        const slug = path.basename(file, '.mdx');
        const content = fs.readFileSync(filePath, 'utf-8');
        const { data, content: mdxContent } = matter(content);
        
        // Initialize article structure if not exists
        if (!articles[slug]) {
          articles[slug] = {
            slug,
            locales: {},
            date: data.date ? new Date(data.date) : null,
            published: data.published !== false,
            url: data.url || '',
            repository: data.repository || '',
            position: data.position || 0,
          };
        }
        
        // Add locale-specific data
        articles[slug].locales[locale] = {
          title: data.title || '',
          description: data.description || '',
          content: mdxContent.trim(),
        };
      }
    }
    
    console.log(`\nFound ${Object.keys(articles).length} articles to process`);
    
    // Upsert articles to MongoDB
    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    
    for (const [slug, article] of Object.entries(articles)) {
      try {
        const result = await collection.updateOne(
          { slug },
          { $set: article },
          { upsert: true }
        );
        
        if (result.upsertedId) {
          console.log(`Inserted: ${slug}`);
          inserted++;
        } else if (result.modifiedCount > 0) {
          console.log(`Updated: ${slug}`);
          updated++;
        } else {
          console.log(`Skipped: ${slug}`);
          skipped++;
        }
      } catch (err) {
        console.error(`Error processing ${slug}:`, err.message);
      }
    }
    
    console.log('\nExport Summary:');
    console.log(`   Inserted: ${inserted}`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`\nExport completed successfully!`);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

main();
